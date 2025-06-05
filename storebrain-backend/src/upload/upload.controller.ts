import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('uploads')
export class UploadController {
    @Post('quizz-image')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads/quizz-images',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    cb(null, `quizz-image-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                    return cb(new Error('Seules les images sont autorisées!'), false);
                }
                cb(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB max
            },
        }),
    )
    uploadQuizzImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('Aucun fichier uploadé');
        }
        const imageUrl = `/uploads/quizz-images/${file.filename}`;

        return {
            message: 'Image uploadée avec succès',
            imageUrl: imageUrl,
            originalName: file.originalname,
            size: file.size,
        };
    }
}