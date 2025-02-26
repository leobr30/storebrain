"use server"
import { fetchWithAuth } from "@/lib/fetch";

export const checkCredentials = async (userId: number, dto:{username: string, password: string}) => {
    const response = await fetchWithAuth(`employees/${userId}/check-credentials`, {
        method: 'POST',
        body: JSON.stringify(dto),
    });
    return response;
}

