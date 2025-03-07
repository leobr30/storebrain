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

export const handleGeneratePdfAndSendEmail = async (responseId: string, email: string) => {
    try {
        console.log(`📩 Envoi de la requête pour générer le PDF avec responseId: ${responseId}`);

        const response = await fetchWithAuth(`forms/${responseId}/generate-pdf-email`, {
            method: "POST",
            body: JSON.stringify({ email }),
        });

        console.log("✅ Réponse du backend :", response);
        return response;
    } catch (error) {
        console.error("❌ Erreur dans handleGeneratePdfAndSendEmail:", error);
        throw error;
    }
};

