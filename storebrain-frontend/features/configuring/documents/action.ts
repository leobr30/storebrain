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