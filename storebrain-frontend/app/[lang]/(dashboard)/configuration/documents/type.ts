export enum QuestionType {
    MULTIPLE_CHOICE = "multiple-choice",
    TRUE_FALSE = "true-false",
    OPEN_ENDED = "open-ended",
}

export interface QuizzAnswer {
    readonly id: number; // Or string
    readonly text: string;
    readonly isCorrect?: boolean;
}

export interface QuizzQuestion {
    readonly id: number; // Or string
    readonly text: string;
    readonly answers: QuizzAnswer[];
    readonly correctAnswerId?: number; // Or string, matching the id of the correct QuizzAnswer (optional for open-ended)
    readonly type: QuestionType;
    readonly imageUrl?: string;
}

export interface QuizzSection {
    readonly id: number; // Or string
    readonly title: string;
    readonly description?: string; // Optional description
    readonly questions: QuizzQuestion[];
}

export interface QuizzPayload {
    readonly id: number; // Or string
    readonly title: string;
    readonly description?: string; // Optional description
    readonly assignedToId: number;
    readonly createdById: number;
    readonly sections: QuizzSection[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
