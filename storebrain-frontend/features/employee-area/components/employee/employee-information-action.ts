"use server";

import { fetchWithAuth } from "@/lib/fetch";
import { revalidatePath } from "next/cache";

export const updateEmployeeInformation = async (employeeId: number, updateData: {
    firstName: string;
    lastName: string;
    entryDate: string;
    job: string;
    contract: string;
    zone: string;
    badgeNumber: string;
    trialEndDate: string;
    endDate: string;
}) => {
    console.log("📤 Envoi des données à l'API :", updateData);

    try {
        // Préparer les données pour l'API
        const formattedData: any = {
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            entryDate: updateData.entryDate || undefined,
            zone: updateData.zone || undefined,
            badgeNumber: updateData.badgeNumber || undefined,
        };

        // Ajouter les dates optionnelles seulement si elles existent
        if (updateData.trialEndDate) {
            formattedData.trialEndDate = updateData.trialEndDate;
        }
        if (updateData.endDate) {
            formattedData.endDate = updateData.endDate;
        }

        // Envoyer job et contract comme strings (le backend les convertira)
        if (updateData.job) {
            formattedData.job = updateData.job;
        }
        if (updateData.contract) {
            formattedData.contract = updateData.contract;
        }

        console.log("📤 Données formatées pour l'API :", formattedData);

        const response = await fetchWithAuth(`employees/${employeeId}`, {
            method: "PUT",
            body: JSON.stringify(formattedData),
        });

        if (!response) throw new Error("Erreur lors de la mise à jour");

        console.log("✅ Informations mises à jour avec succès !");

        revalidatePath('/en/employee-area/home');
        revalidatePath(`/en/employee-area/employees/${employeeId}`);

        return { success: true, data: response };
    } catch (error) {
        console.error("❌ Erreur dans updateEmployeeInformation :", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Une erreur s'est produite"
        };
    }
};