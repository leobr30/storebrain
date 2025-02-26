export type OneDOCFeuilleDeRoute = {
    date: Date;
    quantity: number;
    CloturerId: string;
    ReportId: number;
}

export type OneDOCStoreShipment = {    
    sendDate: Date | null;
    receiveDate: Date | null;
    StatutId: number;   
}

export type OneDOCStoreShipmentItem = {
    id: number;
    number: string;
    StatutId: number;
    
}