"use server"
import { fetchWithAuth } from "@/lib/fetch";
import { revalidatePath } from "next/cache"





export const fetchJobOnboardingSteps = async (jobOnboardingId: number) => {
    return await fetchWithAuth(`employees/onboarding/steps?jobOnboardingId=${jobOnboardingId}`);
};



export const updateJobOnboardingStep = async (id: number, data: {
    day?: number;
    month?: number;
    type?: "TRAINING" | "DOCUMENT" | "RESULT_REVIEW" | "QUIZZ";
    trainingModelId?: number | null;
}) => {
    return await fetchWithAuth(`employees/onboarding/steps/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};


export const fetchTrainingModels = async () => {
    return await fetchWithAuth("employees/training-models");
};

export const updateTrainingModel = async (
    id: number,
    data: {
        tool?: string;
        exercise?: string;
        aide?: string;
    }
) => {
    const result = await fetchWithAuth(`trainings/training-model/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    revalidatePath('/configuration/trainings');
    return result;
};

export const updateTrainingModelSubject = async (
    id: number,
    data: { name: string; aide: string }
) => {
    const result = await fetchWithAuth(`trainings/training-model-subject/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return result;
};


export const createTrainingModelSubject = async (
    trainingModelId: number,
    name: string
) => {
    const result = await fetchWithAuth(`trainings/training-models/${trainingModelId}/subjects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    });
    revalidatePath('/configuration/trainings');
    return result;
};

export const deleteTrainingModelSubject = async (subjectId: number) => {
    const result = await fetchWithAuth(`trainings/training-models/subjects/${subjectId}`, {
        method: 'DELETE',
    });
    revalidatePath('/configuration/trainings');
    return result;
};




