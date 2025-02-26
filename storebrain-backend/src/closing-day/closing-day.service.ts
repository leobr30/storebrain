import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnerpService } from '../onerp/onerp.service';
import { SavService } from '../sav/sav.service';
import { CreateCommentDto } from './dto/create-comment.dto';
@Injectable()
export class ClosingDayService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly onerpService: OnerpService,
        private readonly savService: SavService,
    ) {}
    async getClosingDay() {
        const date = new Date();
        const livraisonData = await this.onerpService.getLivraisonFournisseurData();
        const transfertData = await this.onerpService.getTransfertData();
        const demandeTransfertData = await this.onerpService.getDemandeTransfertData();
        const commandeFournisseurData = await this.onerpService.getCommandeFournisseurData();
        const savDevisData = await this.savService.getSavDevisData();
        const savReceptionAtelierData = await this.savService.getSavReceptionAtelierData();
        const savReceptionMagasinData = await this.savService.getSavReceptionMagasinData();
        const savEnvoiMagasinData = await this.savService.getSavEnvoiMagasinData();
        const receptionData = await this.savService.getReceptionData();
        const closingDay = await this.prisma.closingDay.upsert({
            where: {
                date: date,
            },
            update: {},
            create: {
                date: date,
                startRemainingLabeling: 0,
                endRemainingLabeling: 0,
                realizedLabeling: 0,
            },
            include: {
                comments: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            }
                        }
                    }
                }
            }
        });
        
        return {
            closingDay: closingDay,
            onerpData: {livraisonData, transfertData, demandeTransfertData, commandeFournisseurData},
            savData: {
                atelier_devis: savDevisData.length > 0 ? savDevisData[0].atelier_devis : 0 ,
                attente_devis: savDevisData.length > 0 ? savDevisData[0].attente_devis : 0,
                attente_reponse: savDevisData.length > 0 ? savDevisData[0].attente_reponse : 0,
                savReceptionAtelierData: savReceptionAtelierData,
                savReceptionMagasinData: savReceptionMagasinData,
                savEnvoiMagasinData: savEnvoiMagasinData,
            },
            receptionData: receptionData,
        }
    }

    async createComment(id: number, comment: CreateCommentDto, userId: number) {
        return this.prisma.closingDayComment.create({
            data: {
                closingDayId: id,
                comment: comment.comment,
                quantity: comment.quantity,
                time: comment.time,
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        });
    }
}
