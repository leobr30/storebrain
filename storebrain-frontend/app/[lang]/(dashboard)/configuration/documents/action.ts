"use server";

import { fetchWithAuth } from "@/lib/fetch";
import { json } from "stream/consumers";
import { revalidatePath } from "next/cache"

// FORMULAIRE

export const saveDoc = async (data: any) => {
    const response = await fetchWithAuth(`forms`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
};

// QUIZZ

export const saveQuizz = async (data: any) => {
    const response = await fetchWithAuth("quizz", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return response;
};

export const fetchAllEmployees = async () => {
    return await fetchWithAuth("employees");
};

export const createQuizz = async (data: {
    title: string;
    assignedToId: string;
    createdById: string;
    sections: {
        title: string;
        questions: {
            imageUrl?: string;
            text: string;
        }[];
    }[];
}) => {
    const apiPayload = {
        title: data.title,
        employeeId: parseInt(data.assignedToId), // ✅ OK !
        createdById: parseInt(data.createdById),
        jobOnboardingId: 1,
        sections: data.sections.map((section) => ({
            title: section.title,
            questions: section.questions.map((question) => ({
                text: question.text,
                imageUrl: question.imageUrl,
            })),
        })),
    };

    console.log("📦 Payload envoyé à l’API : ", JSON.stringify(apiPayload, null, 2));

    const response = await fetchWithAuth("quizz", {
        method: "POST",
        body: JSON.stringify(apiPayload),
    });

    revalidatePath('/en/employee-area/home');
    return response;
};




