import { Injectable } from "@nestjs/common";
import { differenceInCalendarYears, differenceInDays } from "date-fns";
import { MailStoreShipment } from "src/mail/mail.interfaces";
import { MailService } from "src/mail/mail.service";
import { OnedocService } from "src/onedoc/onedoc.service";
import { OnerpService } from "src/onerp/onerp.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AlertsService {
    constructor(private prisma: PrismaService, private onerpService: OnerpService, private mailService: MailService, private onedocService: OnedocService) {}

    async getAlerts() {
        return await this.prisma.alert.findMany({
            include: {
                conditions: true
            }
        });
    }

    async storeShipmentAlert() {
        await this.cleanStoreShipmentItems();
        const alert = await this.prisma.alert.findUnique({
            where: {
                id: 1
            }
        })

        if(!alert) {
            return;
        }
        
        const shopDay = 1;
        const storeShipments = (await this.onerpService.getCurrentStoreShipments()).filter(w => w.produit_quantite > 0 && w.transfert_type !== 'CLIENT');        
        const headOfficeShipmentsToAlert: MailStoreShipment[] = [];
        for(const magasin of [17,18,19,20,21,22]) {
            const storeShipmentsToAlert: MailStoreShipment[] = [];        
            const filteredStoreShipments = storeShipments.filter(ss => ss.magasin === magasin);
            
            await Promise.all(filteredStoreShipments.map(async (ss) => {
                let status = '';
                let quantity = null
                let isInError = false;
                let isInWarning = false;
                if(ss.ged) {
                    const feuilleDeRoute = await this.onedocService.getFeuilleDeRoute(ss.bon);
                    
                    if(feuilleDeRoute.length > 0) {                        
                        status = 'Feuille de route du ' + feuilleDeRoute[0].date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        if(feuilleDeRoute[0].quantity) {
                            quantity = feuilleDeRoute[0].quantity
                        }
                    }
                } else {
                    const storeShipmentItem = await this.onedocService.getStoreShipmentItem(ss.bon);
                    
                    if(storeShipmentItem.length > 0) {
                        if(storeShipmentItem[0].receiveDate ) {
                            if(differenceInDays(new Date(), storeShipmentItem[0].receiveDate) >= shopDay) isInError = true;
                            status = 'Réception du labo le ' + storeShipmentItem[0].receiveDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        } else if(storeShipmentItem[0].sendDate ) {
                            if(differenceInDays(new Date(), storeShipmentItem[0].sendDate) >= shopDay )isInError = true;
                            status = 'En cours d\'envoi du labo le ' + storeShipmentItem[0].sendDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        }
                    } else if(ss.livraison_site ) {
                        if (differenceInDays(new Date(), ss.datecreation) >= shopDay)  isInError = true;
                        status = 'Réception fournisseur le ' + ss.datecreation.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    } else if(ss.date_reception ) {
                        if(differenceInDays(new Date(), ss.date_reception) >= shopDay) isInError = true;
                        status = 'Réception caisse bleue le ' + ss.date_reception.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    } else if(ss.date_expedition ) {
                        if(differenceInDays(new Date(), ss.date_expedition) >= 2) isInError = true;
                        status = 'Expédition du siège le ' + ss.date_expedition.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    } else if(differenceInDays(new Date(), ss.date) >= 5) {
                        isInWarning = true;
                        status = 'En attente d\'expédition siège'
                    }
                }
                if(isInError) {
                    storeShipmentsToAlert.push({
                        bon: ss.bon,
                        magasin: ss.magasin,
                        date: ss.date.toLocaleDateString('fr-FR'),
                        quantity: quantity ? quantity : ss.produit_quantite,
                        status: status,
                    })
                } else if(isInWarning) {
                    headOfficeShipmentsToAlert.push({
                        bon: ss.bon,
                        magasin: 116,
                        date: ss.date.toLocaleDateString('fr-FR'),
                        quantity: quantity ? quantity : ss.produit_quantite,
                        status: status,
                    })
                }
            }))                        
            if(storeShipmentsToAlert.length > 0) {
                console.log('SENDING MAIL', magasin)
                 await this.mailService.sendStoreShipmentAlertMail(magasin, storeShipmentsToAlert.sort((a, b) => a.date.localeCompare(b.date)));
            } else console.log('NO MAIL', magasin)
        }
        if(headOfficeShipmentsToAlert.length > 0) {
            console.log('SENDING MAIL', 116)
            await this.mailService.sendStoreShipmentAlertMail(116, headOfficeShipmentsToAlert.sort((a, b) => a.date.localeCompare(b.date)));
        } else console.log('NO MAIL', 116)

    }

    private async cleanStoreShipmentItems() {
        const storeShipmentItems = await this.onedocService.getAllStoreShipmentItemsNotClosed();
        await Promise.all(storeShipmentItems.map(async (ssi) => {
            const storeShipmentItem = await this.onedocService.getStoreShipmentItem(ssi.number);
            if(storeShipmentItem.filter(w => w.StatutId === 3).length > 0) {
                await this.onedocService.closeStoreShipmentItem(ssi.id);
            } else {
                const item = await this.onerpService.getStoreShipment(ssi.number);
                if(item.length > 0) {
                    if(item[0].cloturer_ged) {
                        await this.onedocService.closeStoreShipmentItem(ssi.id);
                    }
                }
            }
        }))
    }
}