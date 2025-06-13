'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowRight,
    Settings,
    Users,
    Calendar,
    FileText,
    Sparkles,
    Clock,
    CheckCircle,
    Zap,
    ChevronRight,
    Plus,
    Search,
    Filter
} from 'lucide-react';

interface DocumentTypeCard {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    href: string;
    icon: React.ComponentType<any>;
    gradient: string;
    features: string[];
    status: 'active' | 'beta' | 'coming-soon';
}

export default function DocumentsLandingPage() {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const documentTypes: DocumentTypeCard[] = [
        {
            id: 'nouveau-vendeur',
            title: 'Accueil Nouveau Vendeur',
            description: 'Formulaire d\'intégration pour les nouveaux collaborateurs',
            longDescription: 'Créez un processus d\'accueil structuré et personnalisé pour faciliter l\'intégration de vos nouveaux vendeurs et maximiser leur efficacité dès le premier jour.',
            href: '/configuration/formulaire',
            icon: Users,
            gradient: 'from-blue-500 to-cyan-500',
            features: [
                'Formulaires personnalisables',
                'Suivi automatisé',
                'Dashboard d\'analytics'
            ],
            status: 'active'
        },
        {
            id: 'rdv-annuel',
            title: 'Entretien Annuel',
            description: 'Système de gestion des entretiens annuels',
            longDescription: 'Optimisez vos entretiens annuels avec un système complet de questions personnalisables, de suivi de progression et de génération de rapports automatisés.',
            href: '/configuration/RDV_Annuel',
            icon: Calendar,
            gradient: 'from-purple-500 to-pink-500',
            features: [
                'Questions dynamiques',
                'Évaluation 360°',
                'Historique complet'
            ],
            status: 'active'
        },
    ];

    const filteredDocuments = documentTypes.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <CheckCircle size={12} className="mr-1" />
                        Disponible
                    </span>
                );
            case 'beta':
                return (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        <Sparkles size={12} className="mr-1" />
                        Bêta
                    </span>
                );
            case 'coming-soon':
                return (
                    <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                        <Clock size={12} className="mr-1" />
                        Bientôt
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen rounded-xl bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Header avec gradient */}
            <div className="bg-white rounded-xl  text-black">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-black bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                                <Settings size={32} className="text-black" />
                            </div>
                            <h1 className="text-4xl font-bold">
                                Configuration des Documents
                            </h1>
                        </div>
                        <p className="text-xl max-w-3xl mx-auto text-black">
                            Gérez et personnalisez tous vos formulaires et processus documentaires
                            pour optimiser l'expérience de vos collaborateurs
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Barre de recherche et filtres */}
                <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher un type de document..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Grid des cartes de documents */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredDocuments.map((doc) => {
                        const IconComponent = doc.icon;
                        const isHovered = hoveredCard === doc.id;
                        const isClickable = doc.status === 'active';

                        const CardWrapper = isClickable ? Link : 'div';
                        const cardProps = isClickable ? { href: doc.href } : {};

                        return (
                            <CardWrapper
                                key={doc.id}
                                {...cardProps}
                                className={`block ${!isClickable ? 'cursor-not-allowed' : ''}`}
                            >
                                <Card
                                    className={`h-full transition-all duration-300 hover:shadow-2xl border border-gray-200 overflow-hidden group ${isClickable ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-70'
                                        }`}
                                    onMouseEnter={() => setHoveredCard(doc.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    {/* Header avec gradient */}
                                    <div className={`bg-gradient-to-r ${doc.gradient} p-6 text-white relative overflow-hidden`}>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                                    <IconComponent size={24} className="text-white" />
                                                </div>
                                                {getStatusBadge(doc.status)}
                                            </div>
                                            <CardTitle className="text-xl font-bold text-white mb-2">
                                                {doc.title}
                                            </CardTitle>
                                            <p className="text-white text-opacity-90 text-sm">
                                                {doc.description}
                                            </p>
                                        </div>
                                    </div>

                                    <CardContent className="p-6 flex-1 flex flex-col">
                                        {/* Description détaillée */}
                                        <p className="text-gray-600 mb-6 flex-1">
                                            {doc.longDescription}
                                        </p>

                                        {/* Fonctionnalités */}
                                        <div className="mb-6">
                                            <h4 className="font-semibold text-gray-800 mb-3">Fonctionnalités clés</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {doc.features.map((feature, index) => (
                                                    <div key={index} className="flex items-center text-sm text-gray-600">
                                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></div>
                                                        {feature}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Call to action */}
                                        <div className="mt-auto">
                                            {isClickable ? (
                                                <div className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${isHovered ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50 border border-gray-200'
                                                    }`}>
                                                    <span className={`font-medium ${isHovered ? 'text-indigo-700' : 'text-gray-700'}`}>
                                                        Configurer maintenant
                                                    </span>
                                                    <ChevronRight
                                                        size={20}
                                                        className={`transition-transform duration-200 ${isHovered ? 'translate-x-1 text-indigo-600' : 'text-gray-400'
                                                            }`}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                                                    <span className="text-gray-500 font-medium">
                                                        {doc.status === 'beta' ? 'Accès bêta requis' : 'Disponible prochainement'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </CardWrapper>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}