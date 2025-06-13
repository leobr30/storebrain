
import type { QuestionType } from '@prisma/client';
import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CurrentUserType } from 'src/auth/dto/current-user.dto';
import { Status } from '@prisma/client';

@Injectable()
export class AnnualReviewsService {
    constructor(private readonly prisma: PrismaService) { }

    async getSections() {
        return await this.prisma.annualReviewSection.findMany({
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { order: 'asc' },
        });
    }

    async getReviews(filters: {
        employeeId?: number;
        reviewerId?: number;
        companyId?: number;
        status?: string;
    }) {
        const where: any = {};

        if (filters.employeeId) where.employeeId = filters.employeeId;
        if (filters.reviewerId) where.reviewerId = filters.reviewerId;
        if (filters.companyId) where.companyId = filters.companyId;
        if (filters.status) where.status = filters.status;

        return await this.prisma.annualReview.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        firstName: true,
                        lastName: true,
                        job: {
                            select: { name: true },
                        },
                        contract: {
                            select: { type: true },
                        },
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                company: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                responses: true,
            },
            orderBy: { reviewDate: 'desc' },
        });
    }

    async getReview(id: number) {
        const review = await this.prisma.annualReview.findUnique({
            where: { id },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        firstName: true,
                        lastName: true,
                        job: {
                            select: { name: true },
                        },
                        contract: {
                            select: { type: true },
                        },
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                company: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                responses: {
                    include: {
                        question: true,
                    },
                },
            },
        });

        if (!review) {
            throw new NotFoundException('Entretien annuel non trouvé');
        }

        return review;
    }

    async createReview(data: {
        employeeId: number;
        companyId: number;
        reviewerId: number;
    }) {
        // Vérifier que l'employé existe
        const employee = await this.prisma.user.findUnique({
            where: { id: data.employeeId },
        });

        if (!employee) {
            throw new NotFoundException('Employé non trouvé');
        }

        // Vérifier que la société existe
        const company = await this.prisma.company.findUnique({
            where: { id: data.companyId },
        });

        if (!company) {
            throw new NotFoundException('Société non trouvée');
        }

        // Créer l'entretien
        const review = await this.prisma.annualReview.create({
            data: {
                employeeId: data.employeeId,
                companyId: data.companyId,
                reviewerId: data.reviewerId,
                status: Status.DRAFT,
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Ajouter à l'historique
        await this.prisma.userHistory.create({
            data: {
                title: 'Entretien annuel',
                text: `a créé un entretien annuel`,
                type: 'ACTION',
                userId: data.employeeId,
                createdById: data.reviewerId,
            },
        });

        return review;
    }

    async updateReview(
        id: number,
        dto: { responses: { questionId: number; answer: string }[] },
        currentUser: CurrentUserType,
    ) {
        const review = await this.prisma.annualReview.findUnique({
            where: { id },
        });

        if (!review) {
            throw new NotFoundException('Entretien annuel non trouvé');
        }

        if (review.status === Status.COMPLETED) {
            throw new BadRequestException('Impossible de modifier un entretien complété');
        }

        // Supprimer les anciennes réponses
        await this.prisma.annualReviewResponse.deleteMany({
            where: { reviewId: id },
        });

        // Créer les nouvelles réponses
        await this.prisma.annualReviewResponse.createMany({
            data: dto.responses.map(response => ({
                reviewId: id,
                questionId: response.questionId,
                answer: response.answer,
            })),
        });

        // Mettre à jour le statut
        await this.prisma.annualReview.update({
            where: { id },
            data: {
                status: Status.IN_PROGRESS,
                updatedAt: new Date(),
            },
        });

        return { message: 'Entretien mis à jour avec succès' };
    }

    async saveResponse(
        reviewId: number,
        dto: { questionId: number; answer: string },
        currentUser: CurrentUserType,
    ) {
        const review = await this.prisma.annualReview.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new NotFoundException('Entretien annuel non trouvé');
        }

        if (review.status === Status.COMPLETED) {
            throw new BadRequestException('Impossible de modifier un entretien complété');
        }

        // Upsert de la réponse
        const response = await this.prisma.annualReviewResponse.upsert({
            where: {
                reviewId_questionId: {
                    reviewId: reviewId,
                    questionId: dto.questionId,
                },
            },
            update: {
                answer: dto.answer,
                updatedAt: new Date(),
            },
            create: {
                reviewId: reviewId,
                questionId: dto.questionId,
                answer: dto.answer,
            },
        });

        return response;
    }

    async submitReview(id: number, currentUser: CurrentUserType) {
        const review = await this.prisma.annualReview.findUnique({
            where: { id },
            include: {
                responses: true,
                employee: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!review) {
            throw new NotFoundException('Entretien annuel non trouvé');
        }

        if (review.status === Status.COMPLETED) {
            throw new BadRequestException('Cet entretien est déjà complété');
        }

        // Vérifier que toutes les questions obligatoires ont une réponse
        const sections = await this.getSections();
        const requiredQuestionIds = sections
            .flatMap(s => s.questions)
            .filter(q => q.required)
            .map(q => q.id);

        const answeredQuestionIds = review.responses.map(r => r.questionId);
        const missingQuestions = requiredQuestionIds.filter(
            id => !answeredQuestionIds.includes(id),
        );

        if (missingQuestions.length > 0) {
            throw new BadRequestException(
                'Toutes les questions obligatoires doivent être remplies',
            );
        }

        // Mettre à jour le statut
        const updatedReview = await this.prisma.annualReview.update({
            where: { id },
            data: {
                status: Status.COMPLETED,
                signedAt: new Date(),
            },
        });

        // Ajouter à l'historique
        await this.prisma.userHistory.create({
            data: {
                title: 'Entretien annuel',
                text: `a complété l'entretien annuel`,
                type: 'ACTION',
                idUrl: id.toString(),
                userId: review.employeeId,
                createdById: currentUser.sub,
            },
        });

        return {
            message: 'Entretien annuel soumis avec succès',
            review: updatedReview,
        };
    }

    // Méthode pour initialiser les sections et questions (à exécuter une fois)
    async initializeSections() {
        const { QuestionType } = await import('@prisma/client');

        const sections = [
            {
                title: "Bilan de l'année écoulée",
                order: 1,
                questions: [
                    {
                        question: "Quelles ont été vos principales réalisations cette année ?",
                        type: QuestionType.TEXTAREA,
                        order: 1,
                        required: true,
                        options: [],
                    },
                    {
                        question: "Quels défis avez-vous rencontrés ?",
                        type: QuestionType.TEXTAREA,
                        order: 2,
                        required: true,
                        options: [],
                    },
                    {
                        question: "Comment évaluez-vous votre performance globale ?",
                        type: QuestionType.SELECT,
                        order: 3,
                        required: true,
                        options: ["Excellente", "Très bonne", "Bonne", "Satisfaisante", "À améliorer"],
                    },
                ],
            },
            {
                title: "Objectifs et développement",
                order: 2,
                questions: [
                    {
                        question: "Quels sont vos objectifs pour l'année à venir ?",
                        type: QuestionType.TEXTAREA,
                        order: 1,
                        required: true,
                        options: [],
                    },
                    {
                        question: "Quelles compétences souhaitez-vous développer ?",
                        type: QuestionType.TEXTAREA,
                        order: 2,
                        required: true,
                        options: [],
                    },
                    {
                        question: "Quel type de formation serait bénéfique pour vous ?",
                        type: QuestionType.TEXT,
                        order: 3,
                        required: false,
                        options: [],
                    },
                ],
            },
            {
                title: "Environnement de travail",
                order: 3,
                questions: [
                    {
                        question: "Comment évaluez-vous votre environnement de travail actuel ?",
                        type: QuestionType.SELECT,
                        order: 1,
                        required: true,
                        options: ["Très satisfaisant", "Satisfaisant", "Correct", "À améliorer"],
                    },
                    {
                        question: "Quelles améliorations suggérez-vous ?",
                        type: QuestionType.TEXTAREA,
                        order: 2,
                        required: false,
                        options: [],
                    },
                    {
                        question: "Comment est votre relation avec votre équipe ?",
                        type: QuestionType.SELECT,
                        order: 3,
                        required: true,
                        options: ["Excellente", "Très bonne", "Bonne", "Correcte", "Difficile"],
                    },
                ],
            },
            {
                title: "Perspectives d'évolution",
                order: 4,
                questions: [
                    {
                        question: "Où vous voyez-vous dans 2-3 ans ?",
                        type: QuestionType.TEXTAREA,
                        order: 1,
                        required: true,
                        options: [],
                    },
                    {
                        question: "Êtes-vous intéressé(e) par une évolution de poste ?",
                        type: QuestionType.SELECT,
                        order: 2,
                        required: true,
                        options: ["Oui", "Non", "Peut-être"],
                    },
                    {
                        question: "Commentaires additionnels",
                        type: QuestionType.TEXTAREA,
                        order: 3,
                        required: false,
                        options: [],
                    },
                ],
            },
        ];

        for (const section of sections) {
            await this.prisma.annualReviewSection.create({
                data: {
                    title: section.title,
                    order: section.order,
                    questions: {
                        create: section.questions.map(q => ({
                            question: q.question,
                            type: q.type,
                            order: q.order,
                            required: q.required,
                            options: q.options,
                        })),
                    },
                },
            });
        }

        return { message: 'Sections initialisées avec succès' };
    }

    // ========== ADMIN METHODS ==========

    async updateSections(
        sections: {
            id?: number;
            title: string;
            order: number;
            questions: {
                id?: number;
                question: string;
                type: string;
                options: string[];
                order: number;
                required: boolean;
            }[];
        }[],
        currentUser: CurrentUserType,
    ) {
        const { QuestionType } = await import('@prisma/client');


        return await this.prisma.$transaction(async (tx) => {

            const existingSections = await tx.annualReviewSection.findMany({
                include: { questions: true },
            });


            const sectionsToDelete = existingSections.filter(
                (existing) => !sections.find((s) => s.id === existing.id),
            );


            for (const section of sectionsToDelete) {
                await tx.annualReviewSection.delete({
                    where: { id: section.id },
                });
            }


            for (const section of sections) {

                const upsertedSection = await tx.annualReviewSection.upsert({
                    where: { id: section.id ?? -1 },
                    update: {
                        title: section.title,
                        order: section.order,
                    },
                    create: {
                        title: section.title,
                        order: section.order,

                        questions: {
                            create: section.questions.map(q => ({
                                question: q.question,
                                type: q.type as QuestionType,
                                options: q.options,
                                order: q.order,
                                required: q.required,
                            })),
                        },
                    },
                });


                const existingQs = await tx.annualReviewQuestion.findMany({
                    where: { sectionId: upsertedSection.id },
                });


                for (const q of existingQs) {
                    if (!section.questions.find(sq => sq.id === q.id)) {

                        await tx.annualReviewResponse.deleteMany({
                            where: { questionId: q.id },
                        });
                        await tx.annualReviewQuestion.delete({
                            where: { id: q.id },
                        });

                    }
                }


                for (const q of section.questions) {
                    await tx.annualReviewQuestion.upsert({
                        where: { id: q.id ?? -1 },
                        update: {
                            question: q.question,
                            type: q.type as QuestionType,
                            options: q.options,
                            order: q.order,
                            required: q.required,
                        },
                        create: {
                            sectionId: upsertedSection.id,
                            question: q.question,
                            type: q.type as QuestionType,
                            options: q.options,
                            order: q.order,
                            required: q.required,
                        },
                    });
                }
            }


            return { message: 'Configuration mise à jour avec succès' };
        });
    }

    async createSection(dto: { title: string; order: number }) {
        const section = await this.prisma.annualReviewSection.create({
            data: {
                title: dto.title,
                order: dto.order,
            },
        });

        return section;
    }

    async updateSection(id: number, dto: { title?: string; order?: number }) {
        const section = await this.prisma.annualReviewSection.update({
            where: { id },
            data: {
                title: dto.title,
                order: dto.order,
            },
        });

        return section;
    }

    async deleteSection(id: number) {
        await this.prisma.annualReviewSection.delete({
            where: { id },
        });

        return { message: 'Section supprimée avec succès' };
    }

    async createQuestion(
        sectionId: number,
        dto: {
            question: string;
            type: string;
            options: string[];
            order: number;
            required: boolean;
        },
    ) {
        const { QuestionType } = await import('@prisma/client');

        const question = await this.prisma.annualReviewQuestion.create({
            data: {
                sectionId,
                question: dto.question,
                type: dto.type as QuestionType,
                options: dto.options,
                order: dto.order,
                required: dto.required,
            },
        });

        return question;
    }

    async updateQuestion(
        id: number,
        dto: {
            question?: string;
            type?: string;
            options?: string[];
            order?: number;
            required?: boolean;
        },
    ) {
        const { QuestionType } = await import('@prisma/client');

        const question = await this.prisma.annualReviewQuestion.update({
            where: { id },
            data: {
                question: dto.question,
                type: dto.type ? (dto.type as QuestionType) : undefined,
                options: dto.options,
                order: dto.order,
                required: dto.required,
            },
        });

        return question;
    }

    async deleteQuestion(id: number) {
        await this.prisma.annualReviewQuestion.delete({
            where: { id },
        });

        return { message: 'Question supprimée avec succès' };
    }

    async reorderSections(sections: { id: number; order: number }[]) {
        await this.prisma.$transaction(
            sections.map((section) =>
                this.prisma.annualReviewSection.update({
                    where: { id: section.id },
                    data: { order: section.order },
                }),
            ),
        );

        return { message: 'Ordre des sections mis à jour' };
    }

    async reorderQuestions(
        sectionId: number,
        questions: { id: number; order: number }[],
    ) {
        await this.prisma.$transaction(
            questions.map((question) =>
                this.prisma.annualReviewQuestion.update({
                    where: { id: question.id, sectionId },
                    data: { order: question.order },
                }),
            ),
        );

        return { message: 'Ordre des questions mis à jour' };
    }
}