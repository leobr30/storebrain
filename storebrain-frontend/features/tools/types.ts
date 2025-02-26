interface PriceUpdate {
    id: number;
    date: string;
    rows: PriceUpdateRow[];
}

interface PriceUpdateRow {
    id: number;
    priceUpdateId: number;
    reference: string;
    lastPrice: number;
    newPrice: number;
    priceDifference: number;
    newPurchasePrice: number;
    newSalePrice: number;
    stock: number;
    status: string;
    articles: PriceUpdateArticle[];
}

interface PriceUpdateArticle {
    id: number;
    priceUpdateRowId: number;
    shop: number;
    article: string;
    stock: number;
    purchasePrice: number;
    lastSalePrice: number;
    newSalePrice: number;
}