export type Employee = {
    id: number;
    name: string;
    zone: string;
    status: Status
    job: { name: string }
    contract: { type: string, workingHoursPerWeek: string }
    entryDate: Date
    badge: string
    histories: EmployeeHistory[]
    jobOnboardings: EmployeeJobOnboarding[]
    absenses: Absence[]
    vacations: Absence[]
    trainings: Training[]
    Document: Document[]
}

type EmployeeHistory = {
    id: number;
    title: string;
    text: string;
    createdAt: Date,
    createdBy: { name: string, id: number }
    documents: EmployeeDocument[]
}

type EmployeeDocument = {
    id: number;
    fileName: string;
    filePath: string;
    mimeType: "application/pdf"
}

export type TrainingModel = {
    id: number;
    name: string;
    subjects: TrainingSubject[];
    createdAt: Date;
    updatedAt: Date;
};




export interface EmployeeJobOnboarding {
    id: number;
    date: Date;
    status: Status;
    appointmentNumber: number;
    responseId?: string;
    jobOnboardingStep: {
        id: number;
        type: string;
        trainingModel?: {
            id: number;
            name: string;
            numberOAppointmentsRequired: number;
            tool: string;
            subjects: {
                id: number;
                name: string;
            }[];
        };
        jobOnboardingResultReview?: {
            id: number;
            name: string;
        };
        jobOnboardingDocuments?: { // Ajout du ? pour rendre la propriété optionnelle
            id: number;
            name: string;
        }[];
        jobOnboardingQuizz?: { // Ajout de la propriété pour le quizz
            id: number;
            name: string;
        };
    };
    training?: {
        id: number;
        status: Status;
        subjects: {
            id: number;
            state: string;
        }[];
    };
}







export interface Training {
    id: number;
    date: Date;
    name: string;
    subjects: TrainingSubject[];
    tool: string;
    exercise: string;
    comment: string;
    status: Status;
    realizedBy: {
        name: string;
    } | null;
    user: {
        name: string;
    };
    userJobOnboarding: {
        appointmentNumber: number;
    };
}

export type TrainingSubject = {
    id: number;
    name: string;
    state: "ACQUIRED" | "NOT_ACQUIRED" | "IN_PROGRESS",
    trainingId: number;
    files: TrainingSubjectFile[];
    aide?: string | null; 
};


export interface TrainingSubjectFile {
    id: number;
    fileName: string;
    createdAt: Date;
    trainingSubjectId: number
}

type Status = "PENDING" | "PENDING_ONBOARDING" | "ONBOARDING" | "ENABLED" | "IN_PROGRESS" | "COMPLETED" | "DRAFT"


export enum AbsenceType {
    UNJUSTIFIED_ABSENCE = "UNJUSTIFIED_ABSENCE",
    DELAY = "DELAY",
    MEDICAL = "MEDICAL",
    SICK_CHILDREN = "SICK_CHILDREN",
    DEATH = "DEATH",
    ACCIDENT_AT_WORK = "ACCIDENT_AT_WORK",
    TRANSPORT_ACCIDENT = "TRANSPORT_ACCIDENT",
}

export type Absence = {
    id: number;
    startAt: Date;
    endAt: Date | null;
    type: AbsenceType;
    user: {
        name: string;
    }
    createdAt: Date;
    createdBy: {
        name: string;
    }
    status: Status
}

export type MondayAppointment = {
    id: number;
    date: Date;
    remainingDays: number;
    objective: number;
    objectiveOr: number;
    objectiveMode: number;
    realizedRevenue: number;
    remainingRevenue: number;
    realizedRevenueOr: number;
    remainingRevenueOr: number;
    realizedRevenueMode: number;
    remainingRevenueMode: number;
    status: Status
    details: MondayAppointmentDetail[]
}

export type MondayAppointmentDetail = {
    id: number;
    onerpId: number;
    fullname: string;
    zone: string;
    objective: number;
    realizedRevenue: number;
    remainingRevenue: number;
    remainingDays: number;
    userId: number | null;
    omar: Omar | null;
    signedAt: Date | null;
}

export type Omar = {
    id: number;
    objective: string;
    tool: string;
    action: string;
    result: string;
    status: Status
    dateSignature?: string | Date;
    user: {
        name: string;
    }
}

export enum DocumentType {
    CNI = "CNI",
    VITAL_CARD = "VITAL_CARD",
    MUTUAL_CARD = "MUTUAL_CARD",
    RIB = "RIB",
    ADDRESS_PROOF = "ADDRESS_PROOF",
    CRIMINAL_RECORD = "CRIMINAL_RECORD",
    RESIDENCE_PERMIT = "RESIDENCE_PERMIT",
    SICK_LEAVE = "SICK_LEAVE",
    OTHER = "OTHER",
}


export interface Document {
    id: number;
    fileName: string;
    mimeType: string;
    filePath: string;
    userId: number;
    type: DocumentType;
    createdAt: Date;
}

export const documentTypeLabels: Record<DocumentType, string> = {
    [DocumentType.CNI]: "Carte d'identité",
    [DocumentType.VITAL_CARD]: "Carte Vitale",
    [DocumentType.MUTUAL_CARD]: "Carte Mutuelle",
    [DocumentType.RIB]: "RIB",
    [DocumentType.ADDRESS_PROOF]: "Justificatif de domicile",
    [DocumentType.CRIMINAL_RECORD]: "Extrait de casier judiciaire",
    [DocumentType.RESIDENCE_PERMIT]: "Titre de séjour",
    [DocumentType.SICK_LEAVE]: "Arrêt maladie",
    [DocumentType.OTHER]: "Autre",
};


