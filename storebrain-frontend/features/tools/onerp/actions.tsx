"use server"
import { fetchWithAuth } from "@/lib/fetch"

export const generateOnerp = async (onerpType: string, formData: FormData) => {
    const response = await fetchWithAuth(`tools/onerp/${onerpType}`, {
        method: 'POST',
        body: formData,
    }, true);

    console.log(response);
    return response;
}