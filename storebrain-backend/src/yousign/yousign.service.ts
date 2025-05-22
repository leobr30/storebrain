import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import FormData = require('form-data');


@Injectable()
export class YousignService {
    private readonly baseUrl = 'https://api.yousign.app/v3';
    private readonly apiKey = process.env.YOUSIGN_API_KEY;

    private getHeaders() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }

    async createProcedure(name: string) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/procedures`,
                {
                    name,
                    start: false, // on peut la démarrer plus tard avec un appel séparé
                },
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error("❌ Erreur Yousign :", error?.response?.data || error);
            throw new HttpException('Erreur avec l’API Yousign', HttpStatus.BAD_REQUEST);
        }
    }
    async sendToSignature(userId: string, buffer: Buffer) {
        try {
            // 🔍 Récupérer l’utilisateur pour obtenir son nom/email
            // 👉 À adapter selon ton projet si tu as accès à Prisma ici ou injecte-le
            const email = 'signataire@example.com'; // Remplace par un vrai email si dispo
            const userName = 'Nom Utilisateur';     // À récupérer dynamiquement

            // 1️⃣ Créer une procédure
            const procedure = await this.createProcedure(`Documents à signer pour ${userName}`);
            const procedureId = procedure.id;

            // 2️⃣ Envoyer le document PDF
            const fileForm = new FormData();
            fileForm.append('file', buffer, {
                filename: 'documents-a-signer.pdf',
                contentType: 'application/pdf',
            });
            fileForm.append('procedure', procedureId);

            const fileUpload = await axios.post(
                `${this.baseUrl}/files`,
                fileForm,
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        ...fileForm.getHeaders(),
                    },
                }
            );
            const fileId = fileUpload.data.id;

            // 3️⃣ Ajouter un signataire (membre)
            const member = await axios.post(
                `${this.baseUrl}/procedures/${procedureId}/members`,
                {
                    firstname: 'Prénom',
                    lastname: 'Nom',
                    email: email,
                    phone: '+33600000000', // facultatif
                    fileObjects: [
                        {
                            file: fileId,
                            page: 1,
                            position: '230,500,200,40', // x,y,width,height (à ajuster)
                            mention: 'Lu et approuvé',
                            mention2: '',
                            reason: 'Signature',
                        },
                    ],
                },
                { headers: this.getHeaders() }
            );

            // 4️⃣ Lancer la procédure
            await axios.post(
                `${this.baseUrl}/procedures/${procedureId}/start`,
                {},
                { headers: this.getHeaders() }
            );

            console.log(`✅ Documents envoyés à Yousign pour l'utilisateur ${userId}`);
            return { success: true };
        } catch (error) {
            console.error("❌ Erreur dans sendToSignature :", error?.response?.data || error);
            throw new HttpException('Échec de l’envoi à Yousign', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
