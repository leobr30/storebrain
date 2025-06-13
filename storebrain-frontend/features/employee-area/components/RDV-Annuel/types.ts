
export type QuestionType = "TEXT" | "TEXTAREA" | "SELECT" | "RADIO" | "CHECKBOX" | "NUMBER" | "DATE";

export interface AnnualReviewQuestion {
    id: number;
    sectionId: number;
    question: string;
    type: QuestionType;
    options: string[];
    order: number;
    required: boolean;
}

export interface AnnualReviewSection {
    id: number;
    title: string;
    order: number;
    questions: AnnualReviewQuestion[];
}

export interface AnnualReviewResponse {
    id?: number;
    reviewId?: number;
    questionId: number;
    answer: string;
}

export interface AnnualReview {
    id: number;
    employeeId: number;
    employee: {
        id: number;
        name: string;
        firstName?: string;
        lastName?: string;
        job?: {
            name: string;
        };
        contract?: {
            type: string;
        };
    };
    reviewerId: number;
    reviewer: {
        id: number;
        name: string;
    };
    companyId: number;
    responses: AnnualReviewResponse[];
    status: "DRAFT" | "IN_PROGRESS" | "COMPLETED";
    reviewDate: Date;
    signedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAnnualReviewDto {
    employeeId: number;
    companyId: number;
    responses: {
        questionId: number;
        answer: string;
    }[];
}