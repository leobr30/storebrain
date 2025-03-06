"use server";

import { fetchWithAuth } from "@/lib/fetch";

export const getDoc = async () => {
    try {
        const response = await fetchWithAuth(`forms`, {
            method: 'GET',
        });
        return response;
    } catch (error) {
        console.error("❌ Erreur dans getDoc :", error);
        throw error;
    }
};

export const saveEmployeeResponse = async (data) => {
    const response = await fetchWithAuth(`employee-responses`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response;
};
