"use server"

import { fetchWithAuth } from "@/lib/fetch";

export const saveDoc = async (data) => {
    const response = await fetchWithAuth(`forms`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response;
}