// In documents.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, DocumentType } from '@prisma/client';


@Injectable()
export class DocumentsService {

    constructor(private prisma: PrismaService) { }


    async createDocument(data: {
        fileName: string;
        mimeType: string;
        filePath: string;
        userId: number;
        type: DocumentType;
    }) {
        return this.prisma.document.create({
            data: {
                fileName: data.fileName,
                mimeType: data.mimeType,
                filePath: data.filePath,
                userId: data.userId,
                type: data.type,
            },
        });
    }


    // documents.service.ts
    async getDocumentsByUserId(userId: number) {
        console.log("Fetching documents for userId:", userId);
        return this.prisma.document.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }


    // documents.service.ts
    async deleteDocument(id: number) {
        return this.prisma.document.delete({
            where: { id },
        });
    }

    async getDocumentById(id: number) {
        const document = await this.prisma.document.findUnique({
            where: { id },
        });

        if (!document) {
            throw new NotFoundException('Document non trouvé');
        }

        return document;
    }


}
