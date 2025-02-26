"use server"
import { createAuthenticatedFetch } from "@/lib/api"
import { auth } from "@/lib/auth"
import { fetchWithAuth } from "@/lib/fetch"

export const useGetTraining =  async (userId: number,trainingId: number) => {
    return await fetchWithAuth(`employees/${userId}/training/${trainingId}`)
}