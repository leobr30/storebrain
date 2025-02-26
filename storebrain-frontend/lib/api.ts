'use server'

import { auth } from "./auth"



type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

async function getAuthToken() {
  const session = await auth()
  return session?.accessToken
}

export async function createAuthenticatedFetch() {
  return async function authenticatedFetch(
    path: string,
    method: HttpMethod = 'GET',
    body?: any
  ) {
    const token = await getAuthToken()

    if (!token) {
      throw new Error("Non autorisé : Token non disponible")
    }

    const url = `${process.env.API_URL}${path}`
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    const options: RequestInit = {
      method,
      headers,
      cache: 'no-store'
    }

    if (body && (method !== 'GET' && method !== 'HEAD')) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`)
    }

    return response.json()
  }
}