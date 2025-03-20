"use server";

import { fetchWithAuth } from "@/lib/fetch";
import { revalidatePath } from "next/cache";

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
    try {
        console.log("📨 Envoi des réponses du formulaire...");

        // Étape 1 : Enregistrement de la réponse de l'employé
        const response = await fetchWithAuth(`employee-responses`, {
            method: 'POST',
            body: JSON.stringify(data),
        });

        console.log("✅ Réponse enregistrée :", response);

        // Étape 2 : Sauvegarde dans l'historique des formulaires
        const historyData = {
            userId: data.userId,
            formId: data.formId,
            responses: data.responses,
            comment: data.comment || "Aucun commentaire",
        };

        console.log("📜 Sauvegarde du formulaire dans l'historique...");

        const historyResponse = await fetchWithAuth(`forms/history`, {
            method: "POST",
            body: JSON.stringify(historyData),
        });

        console.log("✅ Formulaire sauvegardé dans l'historique :", historyResponse);

        // ✅ Étape 3 : Mettre à jour le statut du document en "COMPLETED"
        if (data.employeeId && data.stepId) {
            const updatedStep = await markDocumentAsCompleted(data.employeeId, data.stepId);
            return { ...response, updatedStep };
        }
        revalidatePath('/en/employee-area/home')

        return response;
    } catch (error) {
        console.error("❌ Erreur lors de la soumission du formulaire :", error);
        throw error;
    }

};

export const markDocumentAsCompleted = async (employeeId: number, stepId: number) => {
    try {
        console.log(`🔄 Mise à jour du statut du document (Employee ID: ${employeeId}, Step ID: ${stepId})...`);

        const response = await fetchWithAuth(`employees/${employeeId}/onboarding/${stepId}/complete`, {
            method: "PATCH",
        });

        console.log("✅ Statut mis à jour :", response);
        return response;
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du statut du document :", error);
        throw error;
    }
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
