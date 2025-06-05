// app/api/employees/search-client/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedFetch } from '@/lib/api';

export async function POST(request: NextRequest) {
    try {
        const { query, limit = 20 } = await request.json();

        if (!query || query.length < 2) {
            return NextResponse.json({ employees: [] });
        }

        console.log('🔍 Recherche employé:', query);

        // Utiliser votre fonction d'authentification existante
        const authenticatedFetch = await createAuthenticatedFetch();

        // Appeler votre API NestJS avec authentification
        const data = await authenticatedFetch(
            `/employees/search?q=${encodeURIComponent(query)}&limit=${limit}`,
            'GET'
        );

        console.log('✅ Réponse API:', data);

        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Erreur lors de la recherche d\'employés:', error);

        if (error instanceof Error && error.message.includes('Non autorisé')) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: 'Erreur lors de la recherche', details: error instanceof Error ? error.message : 'Erreur inconnue' },
            { status: 500 }
        );
    }
}