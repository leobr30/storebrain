"use server";
import { fetchWithAuth } from "@/lib/fetch";
import { ClosingDay } from "./types";
import { revalidatePath } from "next/cache";
export const getClosingDay = async (): Promise<ClosingDay> => {
    const response = await fetchWithAuth('closing-day', {
        method: 'GET',
        });
        return response;
}

export const createComment = async (id: number, comment: any) => {
    const response = await fetchWithAuth(`closing-day/${id}/comment`, {
        method: 'PUT',
        body: JSON.stringify(comment),
    });
    revalidatePath('/closing-day');
    return response;
}