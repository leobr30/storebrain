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
        const tempDay = 3;
        const storeShipments = (await this.onerpService.getCurrentStoreShipments()).filter(w => w.produit_quantite > 0);
        

        for(const magasin of [17,18,19,20,21,22]) {
            const storeShipmentsToAlert: MailStoreShipment[] = [];
            const filteredStoreShipments = storeShipments.filter(ss => ss.magasin === magasin);
            
            await Promise.all(filteredStoreShipments.filter(w => differenceInDays(new Date(), w.date) >= tempDay).map(async (ss) => {
                let status = '';
                let quantity = null
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
                        if(storeShipmentItem[0].receiveDate) {
                            status = 'Réception du labo le ' + storeShipmentItem[0].receiveDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        } else if(storeShipmentItem[0].sendDate) {
                            status = 'En cours d\'envoi du labo le ' + storeShipmentItem[0].sendDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        }
                    } else if(ss.livraison_site) {
                        status = 'Réception fournisseur le ' + ss.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    } else if(ss.date_reception) {
                        status = 'Réception caisse bleue le ' + ss.date_reception.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    } else if(ss.date_expedition){
                        status = 'Expédition du siège le ' + ss.date_expedition.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    } else {
                        status = 'En attente d\'expédition siège'
                    }
                }

                storeShipmentsToAlert.push({
                    bon: ss.bon,
                    magasin: ss.magasin,
                    date: ss.date.toLocaleDateString('fr-FR'),
                    quantity: quantity ? quantity : ss.produit_quantite,
                    status: status
                })
            }))                        
            if(storeShipmentsToAlert.length > 0) {
                console.log('SENDING MAIL', magasin)
                 await this.mailService.sendStoreShipmentAlertMail(magasin, storeShipmentsToAlert.sort((a, b) => a.date.localeCompare(b.date)));
            } else console.log('NO MAIL', magasin)
        }

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