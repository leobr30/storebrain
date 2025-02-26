export type ClosingDay = {
    closingDay: {
        id: number;
        date: string;
        startRemainingLabeling: number;
        endRemainingLabeling: number;
        realizedLabeling: number;
        comments: {
            id: number;
            comment: string;
            quantity: number;
            time: number;
            user: {
                firstName: string;
                lastName: string;
            };
        }[];
        status: string;
    };
    onerpData: {
        livraisonData: {
            type: string;
            utilisateur: string;
            qtt_lf: number;
            qtt_sas: number;
        }[];
        transfertData: {
            type: string;
            utilisateur: string;
            qtt: number;
        }[];
        demandeTransfertData: {
            type: string;
            utilisateur: string;
            qtt: number;
        }[];
        commandeFournisseurData: {
            type: string;
            utilisateur: string;
            qtt: number;
        }[];
    }
    savData: {
        atelier_devis: number;
        attente_devis: number;
        attente_reponse: number;
        savReceptionAtelierData: {
            nom: string;
            quantite_reception: number;
        }[];
        savReceptionMagasinData: {
            nom: string;
            quantite_reception: number;
        }[];
        savEnvoiMagasinData: {
            nom: string;
            quantite_envoyer: number;
        }[];
    }
    receptionData: {
        prenom: string;
        nom: string;
        colis: number;
        temps: {
            hours: number;
            minutes: number;
        };
    }[];
}