import { auth } from "./auth";

export const fetchWithAuth = async (url: string, options: RequestInit = {}, withFormData?: boolean) => {
    try {
        const session = await auth();

        if (!session?.tokens?.accessToken) {
            console.error("❌ Aucun token trouvé, impossible d'effectuer la requête.");
            throw new Error("Utilisateur non authentifié.");
        }

        console.log("🔍 Token utilisé :", session.tokens.accessToken);

        let headers: { Authorization: string; "Content-Type"?: string } = {
            Authorization: `Bearer ${session.tokens.accessToken}`,
            "Content-Type": "application/json",
        };

        if (withFormData) {
            delete headers["Content-Type"];
        }

        const res = await fetch(`${process.env.API_URL}/${url}`, {
            ...options,
            headers: headers,
        });

        console.log("🔍 Réponse brute reçue :", res);

        // ✅ Vérifie si c'est un téléchargement de fichier (PDF, etc.)
        if (url.includes("download-pdf")) {
            return res; // 🔥 Retourne la réponse brute pour éviter le parsing JSON
        }

        // ✅ Vérification de la réponse HTTP
        if (!res.ok) {
            console.error(`❌ Erreur API (HTTP ${res.status}): ${res.statusText}`);
            throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
        }

        // ✅ Vérification et parsing JSON sécurisé
        const text = await res.text();
        if (text.length > 0) {
            try {
                const jsonData = JSON.parse(text);
                console.log("✅ Données API analysées avec succès :", JSON.stringify(jsonData, null, 2));

                return Array.isArray(jsonData)
                    ? jsonData.map(item => ({
                        ...item,
                        responses: typeof item.responses === "string" ? JSON.parse(item.responses) : item.responses
                    }))
                    : jsonData;
            } catch (error) {
                console.error("❌ Erreur de parsing JSON :", error);
                return [];
            }
        }
        return [];
    } catch (error) {
        console.error("❌ Erreur dans fetchWithAuth :", error);
        throw error;
    }
};

// 📌 Fonction spécifique pour le téléchargement de fichiers (ex: PDF)
export const fetchFile = async (url: string, options: RequestInit = {}) => {
    try {
        const session = await auth();

        if (!session?.tokens?.accessToken) {
            throw new Error("Utilisateur non authentifié.");
        }

        const headers = { Authorization: `Bearer ${session.tokens.accessToken}` };

        const res = await fetch(`${process.env.API_URL}/${url}`, {
            ...options,
            headers: headers
        });

        if (!res.ok) {
            console.error(`❌ Erreur lors du téléchargement du fichier (HTTP ${res.status})`);
            throw new Error(`Erreur lors du téléchargement du fichier.`);
        }

        return res; // ✅ On renvoie la réponse brute
    } catch (error) {
        console.error("❌ Erreur dans fetchFile :", error);
        throw error;
    }
};


