"use server";

import { fetchWithAuth } from "@/lib/fetch";
import { QuizzPayload } from "./type";

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

// Récupération de tous les employés pour assignation d’un quizz
export const fetchAllEmployees = async () => {
    return await fetchWithAuth("employees");
};

export const createQuizz = async (data: {
    title: string;
    assignedToId: number;
    createdById: number;
    sections: {
        title: string;
        questions: {
            imageUrl?: string;
            text: string;
            answers: { text: string }[];
        }[];
    }[];
    jobOnboardingId: number;
}) => {
    const res = await fetchWithAuth('quizz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    return res;
};




