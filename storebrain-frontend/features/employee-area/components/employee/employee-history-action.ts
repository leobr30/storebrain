"use server";

import { fetchFile, fetchWithAuth } from "@/lib/fetch";

// 📌 Récupérer l'historique des formulaires d'un employé
export const getEmployeeHistory = async (userId: number) => {
    try {
        const response = await fetchWithAuth(`forms/history/${userId}`, {
            method: "GET",
        });
        console.log("🔍 Structure exacte des données reçues :", JSON.stringify(response, null, 2));

        console.log("🔍 Réponse API reçue :", response);

        if (!response || !Array.isArray(response)) {
            console.error("❌ Données invalides reçues, retour d'un tableau vide.");
            return [];
        }

        return response;
    } catch (error) {
        console.error("❌ Erreur dans getEmployeeHistory :", error);
        return [];
    }
};


export const saveFormToHistory = async (data: { userId: number; formId: string; responses: any; comment?: string }) => {
    try {
        const response = await fetchWithAuth("forms/history", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response;
    } catch (error) {
        console.error("❌ Erreur dans saveFormToHistory :", error);
        throw error;
    }
};


export const downloadFormHistoryPdf = async (formId: string) => {

    try {
        console.log(`📥 Début du téléchargement du PDF pour formId: ${formId}`);

        console.log("✅ Téléchargement lancé côté client !");

        const response = await fetchFile(`forms/${formId}/download-pdf`, { method: "GET" });
        console.log("✅ c'est carré");

        if (!response.ok) {
            throw new Error(`Erreur lors du téléchargement du PDF (HTTP ${response.status})`);
        }

        // ✅ Convertir la réponse en fichier
        const blob = await response.blob();
        if (!blob) {
            throw new Error("Le fichier est vide ou corrompu.");
        }

        // ✅ Créer un lien temporaire pour le téléchargement
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `historique_formulaire_${formId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log("✅ PDF téléchargé avec succès !");
    } catch (error) {
        console.error("❌ Erreur dans downloadFormHistoryPdf :", error);
    }
};





