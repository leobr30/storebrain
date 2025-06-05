// lib/actions/search-employees.ts
'use server'

import { fetchWithAuth } from '@/lib/fetch';

export interface SearchEmployeesResult {
    employees: Array<{
        id: number;
        firstName: string;
        lastName: string;
        name?: string;
        email?: string;
        badgeNumber?: string;
        entryDate: string;
        status: string;
        job?: {
            title: string;
            name?: string;
        };
        companies?: Array<{
            company: {
                name: string;
            };
            isDefault: boolean;
        }>;
        zone?: string;
    }>;
    error?: string;
}

export async function searchEmployees(query: string, limit: number = 20): Promise<SearchEmployeesResult> {
    try {
        if (!query || query.length < 2) {
            return { employees: [] };
        }

        console.log('🔍 Server Action - Recherche employé:', query);

        
        const data = await fetchWithAuth(
            `employees/search?q=${encodeURIComponent(query)}&limit=${limit}`,
            { method: 'GET' }
        );

        console.log('✅ Server Action - Réponse API:', data);

        return data;
    } catch (error) {
        console.error('❌ Server Action - Erreur lors de la recherche:', error);

        return {
            employees: [],
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        };
    }
}