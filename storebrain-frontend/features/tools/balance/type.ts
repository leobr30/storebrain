export interface Balance {
    id: number;
    date: string;
    rows: BalanceRow[];
}

export interface BalanceRow {
    id: number;
    reference: string;
    stock: number;
    remaining: number;
    details: BalanceRowDetail[];
    status: string;
}

export interface BalanceRowDetail {
    receiverStoreId: number;
    storeNumber: number;
    stock: number;
    quantity: number;
    totalSales: number;
    lastLifeSpan: number | null;
}