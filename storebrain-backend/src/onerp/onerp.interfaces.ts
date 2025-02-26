interface ProduitFournisseur {
  reference: number;  
  prixfaconht: number;
  tauxremise: number;
  unite: string;
  coef: number;
  prixventettc: number;
  poidsmatiere: number;
  perte: number;
  frais: number;
}


interface ArticleMagasinMouvement {
    magasin: number;
    article: string;
    prixachatht: number;
    prixventettc: number;
    stock: number;
  
  }

  interface Magasin {
    id: number;
    numero: number;
    siege: boolean;
    site: boolean;
  }

  interface Historique {
    numero: number;
    famille: string;
    taille: number | null;
    matiere: string | null;
    pierre: string | null;    
    reference: string;
    achat: number;
    vente:number;
    commande: number;
    cu: number;
    stock: number;
    entree: Date | null;
    sortie: Date | null;
    ddv: number | null;
    libellecommercial: string;
  }

  interface Historique2 {
    magasinId: number;
    numero: number;
    famille: string;
    taille: number | null;
    matiere: string | null;
    pierre: string | null;
    image: string | null;
    reference: string;
    article: string;
    achat: number;
    vente:number;
    commande: number;
    cu: number;
    stock: number;
    entree: Date | null;
    sortie: Date | null;
    ddv: number | null;
    libellecommercial: string;
  } 

  interface StoreShipmentTracking {
    date: Date;
    bon: string;
    magasin: number;
    livraison_site: boolean;
    date_expedition: Date | null;
    date_reception: Date | null;
    ged: number;
    produit_quantite: number;
  } 
  