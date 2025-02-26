"use server"
import { fetchWithAuth } from "@/lib/fetch"


export const createBalance = async () => {
    const balance = await fetchWithAuth("tools/balance", {
        method: "POST",
        body: JSON.stringify({
            departments: ["OR"],
            senderStoreIds: [1,3,5,6,2],
            receiverStoreIds: [4, 7]
        })
    });
    return balance;
}

export const getLastBalance = async () => {
    const balance = await fetchWithAuth(`tools/balance/last`);
    return balance;
}

export const deleteBalanceRow = async (id: number) => {
    const balance = await fetchWithAuth(`tools/balance/row/${id}`, {
        method: "DELETE"
    });
    return balance;
}

export const updateBalanceRow = async (id: number, data: any) => {
    const balance = await fetchWithAuth(`tools/balance/row/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
    return balance;
}

export const completeBalanceRow = async (id: number) => {
    const balance = await fetchWithAuth(`tools/balance/row/${id}/complete`, {
        method: "PUT"
    });
    return balance; 
}

export const downloadBalance = async (id: number) => {
    const balance = await fetchWithAuth(`tools/balance/${id}/download`);
    return balance; 
}