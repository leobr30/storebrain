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

        console.log("🔍 Réponse reçue :", res.status, res.statusText);

        
        if (!res.ok) {
            console.error(`❌ Erreur API (HTTP ${res.status}): ${res.statusText}`);
            throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
        }

        
        if (res.status === 204) {
            return null;
        }

        
        const text = await res.text();
        if (text.length > 0) {
            try {
                return JSON.parse(text);
            } catch (error) {
                console.error("❌ Erreur de parsing JSON :", error);
                throw new Error("Réponse API non valide (impossible de parser en JSON).");
            }
        }
        
        return null;
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


