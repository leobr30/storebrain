// In documents.controller.ts
import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Body,
    Get,
    Param,
    ParseIntPipe,
    Delete,
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
    Res,
    StreamableFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentType } from '@prisma/client';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/documents',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
        limits: {
            fileSize: 1024 * 1024 * 5, // 5MB limit
        },
    }))
    async uploadDocument(
        @UploadedFile() file: Express.Multer.File,
        @Body('userId') userIdString: string, // Récupérer comme string
        @Body('type') type: string,
    ) {
        if (!file) {
            throw new BadRequestException('Aucun fichier n\'a été envoyé.');
        }

        if (!Object.values(DocumentType).includes(type as DocumentType)) {
            throw new BadRequestException('Type de document invalide');
        }

        const userId = parseInt(userIdString, 10); // Convertir en nombre

        if (isNaN(userId)) {
            throw new BadRequestException('userId doit être un nombre valide');
        }

        try {
            return await this.documentsService.createDocument({
                fileName: file.originalname,
                mimeType: file.mimetype,
                filePath: file.path,
                userId, // Maintenant un nombre
                type: type as DocumentType,
            });
        } catch (error) {
            console.error('Erreur lors de la création du document:', error);
            throw new InternalServerErrorException('Erreur lors de l\'enregistrement du document');
        }
    }

    @Get(':userId')
    async getDocuments(@Param('userId', ParseIntPipe) userId: number) {
        return this.documentsService.getDocumentsByUserId(userId);
    }

    @Delete(':id')
    async deleteDocument(@Param('id', ParseIntPipe) id: number) {
        try {
            return await this.documentsService.deleteDocument(id);
        } catch (error) {
            console.error('Erreur lors de la suppression du document:', error);
            throw new NotFoundException('Document non trouvé');
        }
    }

    @Get('download/:id')
    async downloadDocument(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
        const document = await this.documentsService.getDocumentById(id);

        if (!document) {
            throw new NotFoundException('Document non trouvé');
        }

        const file = createReadStream(join(process.cwd(), document.filePath));
        res.set({
            'Content-Type': document.mimeType,
            'Content-Disposition': `attachment; filename="${document.fileName}"`,
        });
        return new StreamableFile(file);
    }
}
