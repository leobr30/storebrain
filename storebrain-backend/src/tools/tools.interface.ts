
interface PriceUpdate {
    supplier:string;
    reference:string;
    newPrice:number;
    lastPrice:number;
    priceDifference:number;
    newPurchasePrice:number;  
    newSalePrice:number;  
    stock:number;
    priceUpdateArticles: PriceUpdateArticle[];
  }

  interface PriceUpdateArticle {
    shop: number;
    article: string;
    purchasePrice: number;
    lastSalePrice: number;
    newSalePrice: number;
    salePriceDifference: number;
    coefficient: number;
    stock: number;
  }

  interface PriceUpdateOrderRow {
    family: string;    
    material: string | null;
    stone: string | null;
    supplier: string;
    reference: string;
    size: number | null;
    shop: number | null;
    purchase: number;
    sale: number;
    stock: number;
    order: number;
    unitOrder: number;
    lastLifeSpan: number | null;
    commercialLabel: string;
    newPurchasePrice: number;
    newSalePrice: number;
  }

  interface CreateBalanceRow {
    image: string | null;
    reference: string;    
    stock: number;
    remaining: number;
    details: CreateBalanceRowDetail[];
  }

  interface CreateBalanceRowDetail {
    receiverStoreId: number;
    storeNumber: number;
    stock: number;
    qty: number;
    totalSales: number;
    lastLifeSpan: number | null;
  }