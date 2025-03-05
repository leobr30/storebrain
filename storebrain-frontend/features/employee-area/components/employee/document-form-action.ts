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
