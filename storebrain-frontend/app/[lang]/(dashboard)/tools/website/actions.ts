'use server';

import { auth } from '@/lib/auth';
import { Session } from 'next-auth';

// Étendre le type Session pour inclure les tokens
interface CustomSession extends Session {
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// Définition du type pour les données de tracking
export interface TrackingItem {
  produitId: number;
  fournisseurId: number;
  reference: string;
  groupe: string;
  famille: string;
  stockTotal: number;
  stockSas: number;
  prestaState: 'NOT_FOUND' | 'OFFLINE' | 'ONLINE';
  hasPhotos: boolean;
  hasProductSheet: boolean;
}

// Server action pour récupérer les données de tracking
export async function fetchTrackingData(): Promise<TrackingItem[]> {
  try {
    // Récupérer la session d'authentification
    const session = await auth() as CustomSession;
    
    if (!session?.tokens?.accessToken) {
      throw new Error('Non authentifié - Veuillez vous connecter');
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/website/tracking`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.tokens.accessToken}`,
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch tracking data:', error);
    throw error;
  }
}

// Server action pour mettre à jour le statut des photos et fiches produit
export async function updateProductTrackingStatus(
  produitId: number,
  hasPhotos: boolean,
  hasProductSheet: boolean
): Promise<any> {
  try {
    // Récupérer la session d'authentification
    const session = await auth() as CustomSession;
    
    if (!session?.tokens?.accessToken) {
      throw new Error('Non authentifié - Veuillez vous connecter');
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/website/tracking/${produitId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.tokens.accessToken}`,
      },
      body: JSON.stringify({ hasPhotos, hasProductSheet }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to update product tracking status:', error);
    throw error;
  }
} 