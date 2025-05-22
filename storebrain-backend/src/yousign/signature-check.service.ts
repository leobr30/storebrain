import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { YousignService } from './yousign.service';

@Injectable()
export class SignatureCheckService {
    constructor(
        private prisma: PrismaService,
        private yousignService: YousignService,
    ) {
        console.log('🟡 SignatureCheckService initialisé');
    }

    @Cron('*/30 * * * * *')
    async checkAllPendingSignatures() {
        console.log('🔄 Vérification des signatures Yousign lancée...');
        await this.checkForms();
        await this.checkTrainings();
        await this.checkOmars();
        await this.checkQuizz();
        await this.checkMergedSignatures(); // 👈 ajout ici
    }

    private async checkForms() {
        const forms = await this.prisma.form.findMany({
            where: { signatureRequestId: { not: null }, dateSignature: null },
        });

        for (const form of forms) {
            try {
                const status = await this.yousignService.checkSignatureStatus(form.signatureRequestId!);
                console.log(`🧪 Status Yousign pour form ${form.id} :`, status.status);
                if (status.status === 'done') {
                    await this.prisma.form.update({
                        where: { id: form.id },
                        data: { dateSignature: new Date() },
                    });
                    console.log(`✅ Form signé : ${form.id}`);
                }
            } catch (error) {
                console.error(`❌ Erreur statut form ${form.id}`, error);
            }
        }
    }

    private async checkTrainings() {
        const trainings = await this.prisma.training.findMany({
            where: { signatureRequestId: { not: null }, dateSignature: null },
        });

        for (const training of trainings) {
            try {
                const status = await this.yousignService.checkSignatureStatus(training.signatureRequestId!);
                console.log(`🧪 Status Yousign pour form ${training.id} :`, status.status);
                if (status.status === 'done') {
                    await this.prisma.training.update({
                        where: { id: training.id },
                        data: { dateSignature: new Date() },
                    });
                    console.log(`✅ Training signé : ${training.id}`);
                }
            } catch (error) {
                console.error(`❌ Erreur statut training ${training.id}`, error);
            }
        }
    }

    private async checkOmars() {
        const omars = await this.prisma.omar.findMany({
            where: { signatureRequestId: { not: null }, dateSignature: null },
        });

        for (const omar of omars) {
            try {
                const status = await this.yousignService.checkSignatureStatus(omar.signatureRequestId!);
                console.log(`🧪 Status Yousign pour form ${omar.id} :`, status.status);
                if (status.status === 'done') {
                    await this.prisma.omar.update({
                        where: { id: omar.id },
                        data: { dateSignature: new Date() },
                    });
                    console.log(`✅ OMAR signé : ${omar.id}`);
                }
            } catch (error) {
                console.error(`❌ Erreur statut OMAR ${omar.id}`, error);
            }
        }
    }

    private async checkQuizz() {
        const quizz = await this.prisma.quizz.findMany({
            where: { signatureRequestId: { not: null }, dateSignature: null },
        });

        for (const q of quizz) {
            try {
                const status = await this.yousignService.checkSignatureStatus(q.signatureRequestId!);
                console.log(`🧪 Status Yousign pour form ${q.id} :`, status.status);
                if (status.status === 'done') {
                    await this.prisma.quizz.update({
                        where: { id: q.id },
                        data: { dateSignature: new Date() },
                    });
                    console.log(`✅ Quizz signé : ${q.id}`);
                }
            } catch (error) {
                console.error(`❌ Erreur statut quizz ${q.id}`, error);
            }
        }
    }

    private async checkMergedSignatures() {
        const logs = await this.prisma.signatureRequestLog.findMany({
            where: {
                type: 'merged',
                dateSignature: null,
            },
        });

        for (const log of logs) {
            try {
                const status = await this.yousignService.checkSignatureStatus(log.signatureRequestId);
                console.log(`🧪 Status Yousign pour merged ${log.id} :`, status.status);

                if (status.status === 'done') {
                    const now = new Date();

                    // ✅ Marquer le log comme signé
                    await this.prisma.signatureRequestLog.update({
                        where: { id: log.id },
                        data: { dateSignature: now },
                    });

                    console.log(`✅ Document fusionné signé pour user ${log.userId}`);

                    // ✅ Mettre à jour toutes les entités liées
                    await Promise.all([
                        this.prisma.omar.updateMany({
                            where: { userId: log.userId, dateSignature: null },
                            data: { dateSignature: now },
                        }),
                        this.prisma.quizz.updateMany({
                            where: { assignedToId: log.userId, dateSignature: null },
                            data: { dateSignature: now },
                        }),
                        this.prisma.training.updateMany({
                            where: { userId: log.userId, dateSignature: null },
                            data: { dateSignature: now },
                        }),
                    ]);

                    const responses = await this.prisma.employeeResponse.findMany({
                        where: {
                            userId: log.userId,
                            form: { dateSignature: null },
                        },
                        select: { formId: true },
                    });

                    const formIds = [...new Set(responses.map((r) => r.formId))];

                    if (formIds.length > 0) {
                        await this.prisma.form.updateMany({
                            where: { id: { in: formIds } },
                            data: { dateSignature: now },
                        });
                    }
                }

            } catch (error) {
                console.error(`❌ Erreur statut merged ${log.id}`, error);
            }
        }
    }


}
