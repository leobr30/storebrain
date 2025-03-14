"use server";

import { fetchWithAuth } from "@/lib/fetch";

export const updateEmployeeInformation = async (employeeId: number, updateData: any) => {
    console.log("📤 Envoi des données à l'API :", updateData);

    try {
        const response = await fetchWithAuth(`employees/${employeeId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
        });

        if (!response) throw new Error("Erreur lors de la mise à jour");

        console.log("✅ Informations mises à jour avec succès !");
        return { success: true };
    } catch (error) {
        console.error("❌ Erreur dans updateEmployeeInformation :", error);
        return { success: false, error: error.message };
    }
};

