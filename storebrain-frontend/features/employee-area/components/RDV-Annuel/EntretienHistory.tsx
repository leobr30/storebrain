'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, User, Building, CheckCircle, Clock, Eye, Filter, Search, Download, MoreVertical, ChevronDown, TrendingUp, X } from 'lucide-react';
import { AnnualReview } from './types';
import { getAnnualReviews } from '../../actions';

interface EntretienHistoryProps {
    companyId?: number;
    employeeId?: number;
    onViewReview?: (review: AnnualReview) => void;
}

export default function EntretienHistory({ companyId, employeeId, onViewReview }: EntretienHistoryProps) {
    const [reviews, setReviews] = useState<AnnualReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        loadReviews();
    }, [companyId, employeeId]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAnnualReviews({
                companyId,
                employeeId
            });
            setReviews(data);
        } catch (err) {
            setError('Erreur lors du chargement des entretiens');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return {
                    label: 'Complété',
                    icon: CheckCircle,
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-800',
                    borderColor: 'border-green-200'
                };
            case 'IN_PROGRESS':
                return {
                    label: 'En cours',
                    icon: Clock,
                    bgColor: 'bg-yellow-100',
                    textColor: 'text-yellow-800',
                    borderColor: 'border-yellow-200'
                };
            default:
                return {
                    label: 'Brouillon',
                    icon: FileText,
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    borderColor: 'border-gray-200'
                };
        }
    };

    const getStatusBadge = (status: string) => {
        const statusInfo = getStatusInfo(status);
        const IconComponent = statusInfo.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                <IconComponent size={12} className="mr-1" />
                {statusInfo.label}
            </span>
        );
    };

    const filteredAndSortedReviews = React.useMemo(() => {
        let filtered = reviews.filter(review => {
            const matchesSearch = searchTerm === '' ||
                review.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.employee.job?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.reviewer.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === '' || review.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'date':
                    comparison = new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime();
                    break;
                case 'name':
                    comparison = a.employee.name.localeCompare(b.employee.name);
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [reviews, searchTerm, statusFilter, sortBy, sortOrder]);

    const getStatusStats = () => {
        const stats = {
            total: reviews.length,
            completed: reviews.filter(r => r.status === 'COMPLETED').length,
            inProgress: reviews.filter(r => r.status === 'IN_PROGRESS').length,
            draft: reviews.filter(r => r.status === 'DRAFT').length
        };
        return stats;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
    };

    const stats = getStatusStats();
    const hasActiveFilters = searchTerm || statusFilter;

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                            <X className="text-red-600" size={20} />
                        </div>
                        <div>
                            <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
                            <p className="text-red-700">{error}</p>
                            <button
                                onClick={loadReviews}
                                className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
                            >
                                Réessayer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header avec gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center">
                            <FileText className="mr-3" size={28} />
                            Historique des entretiens
                        </h3>
                        <p className="text-purple-100 mt-1">
                            Suivi et gestion des entretiens annuels
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <TrendingUp size={48} className="text-purple-200 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600 text-sm font-medium">Total</p>
                                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                            </div>
                            <FileText className="text-blue-500" size={24} />
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-600 text-sm font-medium">Complétés</p>
                                <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
                            </div>
                            <CheckCircle className="text-green-500" size={24} />
                        </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-600 text-sm font-medium">En cours</p>
                                <p className="text-2xl font-bold text-yellow-800">{stats.inProgress}</p>
                            </div>
                            <Clock className="text-yellow-500" size={24} />
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Brouillons</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.draft}</p>
                            </div>
                            <FileText className="text-gray-500" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Recherche */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par employé, poste ou évaluateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Filtres */}
                    <div className="flex gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="COMPLETED">Complétés</option>
                            <option value="IN_PROGRESS">En cours</option>
                            <option value="DRAFT">Brouillons</option>
                        </select>

                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field as 'date' | 'name' | 'status');
                                setSortOrder(order as 'asc' | 'desc');
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        >
                            <option value="date-desc">Plus récent</option>
                            <option value="date-asc">Plus ancien</option>
                            <option value="name-asc">Nom A-Z</option>
                            <option value="name-desc">Nom Z-A</option>
                            <option value="status-asc">Statut A-Z</option>
                        </select>

                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-sm"
                            >
                                <X size={16} className="mr-1" />
                                Effacer
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        {filteredAndSortedReviews.length} entretien{filteredAndSortedReviews.length > 1 ? 's' : ''}
                        {filteredAndSortedReviews.length !== reviews.length && (
                            <span> sur {reviews.length}</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Liste des entretiens */}
            <div className="p-6">
                {filteredAndSortedReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="text-gray-400" size={32} />
                        </div>
                        <h4 className="text-lg font-medium text-gray-800 mb-2">
                            {reviews.length === 0 ? 'Aucun entretien enregistré' : 'Aucun résultat trouvé'}
                        </h4>
                        <p className="text-gray-600 mb-4">
                            {reviews.length === 0
                                ? 'Les entretiens annuels apparaîtront ici une fois créés.'
                                : 'Essayez de modifier vos critères de recherche.'
                            }
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Effacer les filtres
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAndSortedReviews.map(review => (
                            <div
                                key={review.id}
                                className="group border border-gray-200 rounded-lg p-6 hover:border-purple-300 hover:shadow-md transition-all duration-200 bg-white"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Header de la carte */}
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {review.employee.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                                                    {review.employee.name}
                                                </h4>
                                                <p className="text-sm text-gray-600">{review.employee.job?.name}</p>
                                            </div>
                                            {getStatusBadge(review.status)}
                                        </div>

                                        {/* Informations détaillées */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Calendar size={14} className="mr-2 text-gray-400" />
                                                <span>
                                                    {new Date(review.reviewDate).toLocaleDateString('fr-FR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>

                                            <div className="flex items-center">
                                                <User size={14} className="mr-2 text-gray-400" />
                                                <span>Évaluateur: {review.reviewer.name}</span>
                                            </div>

                                            {review.employee.zone && (
                                                <div className="flex items-center">
                                                    <Building size={14} className="mr-2 text-gray-400" />
                                                    <span>Zone: {review.employee.zone}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Progression si en cours */}
                                        {review.status === 'IN_PROGRESS' && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                    <span>Progression</span>
                                                    <span>65%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {onViewReview && (
                                            <button
                                                onClick={() => onViewReview(review)}
                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Voir l'entretien"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        )}

                                        <div className="relative">
                                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                                <MoreVertical size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer avec actions */}
            {filteredAndSortedReviews.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                            <FileText size={16} className="mr-2" />
                            <span>
                                {filteredAndSortedReviews.length} entretien{filteredAndSortedReviews.length > 1 ? 's' : ''} affiché{filteredAndSortedReviews.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        <button className="flex items-center px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium">
                            <Download size={16} className="mr-2" />
                            Exporter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}