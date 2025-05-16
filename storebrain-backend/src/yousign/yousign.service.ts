import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import FormData from 'form-data';

@Injectable()
export class YousignService {
    private readonly baseUrl = 'https://api-sandbox.yousign.app/v3';
    private readonly apiKey = process.env.YOUSIGN_API_KEY;

    constructor(private prisma: PrismaService) { }

    private getHeaders(extraHeaders: Record<string, string> = {}) {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            ...extraHeaders,
        };
    }

    async sendToSignature(
        userId: string,
        buffer: Buffer,
        type: 'form' | 'training' | 'omar' | 'quizz',
        documentId: string | number,
    ) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: parseInt(userId) },
                select: {
                    email: true,
                    firstName: true,
                    lastName: true,
                    information: {
                        select: { cellPhone: true },
                    },
                },
            });

            if (!user || !user.email || !user.information?.cellPhone) {
                throw new Error(`Utilisateur, email ou téléphone manquant pour l'ID ${userId}`);
            }

            const phone = user.information.cellPhone.replace(/^0/, '+33');
            const fullName = `${user.firstName} ${user.lastName}`;

            // 1️⃣ Création de la signature request
            const signatureRequestRes = await axios.post(
                `${this.baseUrl}/signature_requests`,
                {
                    name: `Signature pour ${fullName}`,
                    delivery_mode: 'email',
                    timezone: 'Europe/Paris',
                    signers_allowed_to_decline: false,
                },
                {
                    headers: this.getHeaders({ 'Content-Type': 'application/json' }),
                }
            );

            const signatureRequestId = signatureRequestRes.data.id;

            // 2️⃣ Upload du document
            const form = new FormData();
            form.append('file', buffer, {
                filename: 'document-a-signer.pdf',
                contentType: 'application/pdf',
            });
            form.append('nature', 'signable_document');

            const docRes = await axios.post(
                `${this.baseUrl}/signature_requests/${signatureRequestId}/documents`,
                form,
                {
                    headers: this.getHeaders(form.getHeaders()),
                }
            );

            const documentIdYousign = docRes.data.id;

            // 3️⃣ Ajout du signataire
            const signerRes = await axios.post(
                `${this.baseUrl}/signature_requests/${signatureRequestId}/signers`,
                {
                    info: {
                        first_name: user.firstName,
                        last_name: user.lastName,
                        email: user.email,
                        phone_number: phone,
                        locale: 'fr',
                    },
                    signature_level: 'electronic_signature',
                    signature_authentication_mode: 'otp_sms',
                    delivery_mode: 'email',
                },
                {
                    headers: this.getHeaders({ 'Content-Type': 'application/json' }),
                }
            );

            const signerId = signerRes.data.id;

            // 4️⃣ Ajout du champ de signature
            await axios.post(
                `${this.baseUrl}/signature_requests/${signatureRequestId}/documents/${documentIdYousign}/fields`,
                {
                    type: 'signature',
                    signer_id: signerId,
                    page: 1,
                    x: 230,
                    y: 500,
                    width: 200,
                    height: 40,
                    reason: 'Signature',
                },
                {
                    headers: this.getHeaders({ 'Content-Type': 'application/json' }),
                }
            );

            // 5️⃣ Activation de la signature
            await axios.post(
                `${this.baseUrl}/signature_requests/${signatureRequestId}/activate`,
                {},
                {
                    headers: this.getHeaders({ 'Content-Type': 'application/json' }),
                }
            );

            if (documentId === 'merged') {
                await this.prisma.signatureRequestLog.create({
                    data: {
                        signatureRequestId,
                        userId: parseInt(userId),
                        type: 'merged',
                        documentId: 'merged',
                    },
                });

                console.log(`📄 Signature multiple envoyée (PDF fusionné), requête enregistrée.`);
                return { success: true, signatureRequestId };
            }


            // 6️⃣ Enregistrement dans SignatureRequestLog
            await this.prisma.signatureRequestLog.create({
                data: {
                    userId: parseInt(userId),
                    type,
                    documentId: String(documentId),
                    signatureRequestId,
                },
            });




            // 6️⃣ Mise à jour en base du document concerné
            switch (type) {
                case 'form':
                    await this.prisma.form.update({
                        where: { id: documentId as string },
                        data: { signatureRequestId },
                    });
                    break;
                case 'training':
                    await this.prisma.training.update({
                        where: { id: Number(documentId) },
                        data: { signatureRequestId },
                    });
                    break;
                case 'omar':
                    await this.prisma.omar.update({
                        where: { id: Number(documentId) },
                        data: { signatureRequestId },
                    });
                    break;
                case 'quizz':
                    await this.prisma.quizz.update({
                        where: { id: Number(documentId) },
                        data: { signatureRequestId },
                    });
                    break;
                default:
                    throw new Error(`Type de document non pris en charge : ${type}`);
            }

            console.log(`✅ Signature request créée pour ${fullName} et enregistrée dans ${type} ${documentId}`);

            return { success: true, signatureRequestId };
        } catch (error) {
            console.error('❌ Erreur dans sendToSignature :', error?.response?.data || error);
            throw new HttpException('Échec de l’envoi à Yousign', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async checkSignatureStatus(signatureRequestId: string) {
        try {
            console.log("📤 Vérification du statut Yousign pour :", signatureRequestId);
            const res = await axios.get(
                `${this.baseUrl}/signature_requests/${signatureRequestId}`,
                {
                    headers: this.getHeaders(),
                }
            );

            const status = res.data.status;
            const signers = res.data.signers;

            return {
                status,
                signers: signers.map((s: any) => ({ id: s.id, status: s.status })),
            };
        } catch (error) {
            console.error('❌ Erreur dans checkSignatureStatus :', error?.response?.data || error);
            throw new HttpException('Erreur lors de la vérification de signature Yousign', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



}
