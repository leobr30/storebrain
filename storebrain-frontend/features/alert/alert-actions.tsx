"use server"
import { fetchWithAuth } from "@/lib/fetch";

export const getAlerts = async (): Promise<Alert[]> => {
    const response = await fetchWithAuth('alerts', {
        method: 'GET',
    });
    return response;
}

export const lunchAlert = async (id: number) => {
    const response = await fetchWithAuth(`alerts/lunch/${id}`, {
        method: 'PUT',
    });
    return response;
}