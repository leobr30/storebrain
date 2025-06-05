// components/search/employee-search-modal.tsx
"use client";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, X, User, Mail, Calendar, Badge, Command, Users, Building, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEmployeeSearch, useEmployeeSearchShortcuts } from "@/hooks/use-employee-search";

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    name?: string;
    email?: string;
    badgeNumber?: string;
    entryDate: string;
    job?: {
        title: string;
        department?: string;
    };
    companies?: Array<{
        company: {
            name: string;
        };
        isDefault: boolean;
    }>;
    status: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'PENDING_ONBOARDING' | 'ONBOARDING';
}

interface EmployeeSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EmployeeSearchModal: React.FC<EmployeeSearchModalProps> = ({ isOpen, onClose }) => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const {
        query,
        setQuery,
        employees,
        loading,
        error,
        selectedIndex,
        handleKeyDown: handleSearchKeyDown,
        handleEmployeeSelect,
        clearSearch
    } = useEmployeeSearch({
        onSelect: (employee) => {
            onClose();
            window.location.href = `/employee-area/home/${employee.id}`;
        }
    });

    useEmployeeSearchShortcuts(() => {
        if (!isOpen) {
            // Ouvrir la modal si elle n'est pas déjà ouverte
        }
    });

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Appliquer le flou uniquement à l'élément __next
            const appElement = document.getElementById('__next');
            if (appElement) {
                appElement.style.filter = 'blur(8px)';
                appElement.style.transition = 'filter 0.3s ease-out';
            }
        } else {
            document.body.style.overflow = 'unset';
            // Retirer le flou
            const appElement = document.getElementById('__next');
            if (appElement) {
                appElement.style.filter = 'none';
            }
        }

        return () => {
            document.body.style.overflow = 'unset';
            const appElement = document.getElementById('__next');
            if (appElement) {
                appElement.style.filter = 'none';
            }
        };
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }
        handleSearchKeyDown(e);
    };

    const handleClose = () => {
        clearSearch();
        onClose();
    };

    const getEmployeeFullName = (employee: Employee) => {
        if (employee.name) return employee.name;
        return `${employee.firstName} ${employee.lastName}`.trim() || 'Nom non défini';
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return {
                    color: 'text-emerald-600',
                    background: 'bg-emerald-50',
                    border: 'border-emerald-200',
                    dot: 'bg-emerald-500',
                    label: 'Actif'
                };
            case 'PENDING':
                return {
                    color: 'text-amber-600',
                    background: 'bg-amber-50',
                    border: 'border-amber-200',
                    dot: 'bg-amber-500',
                    label: 'En attente'
                };
            case 'PENDING_ONBOARDING':
                return {
                    color: 'text-blue-600',
                    background: 'bg-blue-50',
                    border: 'border-blue-200',
                    dot: 'bg-blue-500',
                    label: 'En attente d\'intégration'
                };
            case 'ONBOARDING':
                return {
                    color: 'text-purple-600',
                    background: 'bg-purple-50',
                    border: 'border-purple-200',
                    dot: 'bg-purple-500',
                    label: 'En cours d\'intégration'
                };
            case 'INACTIVE':
                return {
                    color: 'text-red-600',
                    background: 'bg-red-50',
                    border: 'border-red-200',
                    dot: 'bg-red-500',
                    label: 'Inactif'
                };
            default:
                return {
                    color: 'text-gray-600',
                    background: 'bg-gray-50',
                    border: 'border-gray-200',
                    dot: 'bg-gray-500',
                    label: status
                };
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (!isOpen) return null;

    const modalContent = (
        <>
            {/* Backdrop avec effet glassmorphism */}
            <div
                className="fixed inset-0 z-[9999] backdrop-blur-sm transition-all duration-300"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0.4) 100%)',
                    animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={handleClose}
            />

            {/* Modal container */}
            <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[8vh] p-4 pointer-events-none">
                <div
                    className="relative w-full max-w-3xl pointer-events-auto"
                    style={{
                        animation: 'modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Modal principale avec glassmorphism avancé */}
                    <div
                        className="relative bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
                            boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        {/* Header avec gradient subtil */}
                        <div className="relative p-6 border-b border-gray-100/80 bg-gradient-to-r from-slate-50/80 to-blue-50/80">
                            <div className="flex items-center gap-4">
                                {/* Icône de recherche avec animation */}
                                <div className="relative">
                                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
                                        <Search className="h-6 w-6 text-white" />
                                    </div>
                                    {query && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                                    )}
                                </div>

                                {/* Input de recherche amélioré */}
                                <div className="flex-1 relative">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Rechercher un employé..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="w-full bg-transparent text-xl font-medium text-gray-900 placeholder:text-gray-400 outline-none"
                                    />
                                    <div className="mt-1 text-sm text-gray-500 font-medium">
                                        Nom, prénom, email ou numéro de badge
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 border border-gray-200/60 backdrop-blur-sm">
                                        <Command className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-600">K</span>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="p-3 rounded-2xl bg-white/60 border border-gray-200/60 backdrop-blur-sm transition-all duration-200 hover:bg-white/80 hover:scale-105 active:scale-95"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Contenu scrollable avec scroll personnalisé */}
                        <div
                            ref={resultsRef}
                            className="flex-1 overflow-y-auto min-h-0 p-2"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent',
                                maxHeight: 'calc(85vh - 140px)'
                            }}
                        >
                            {/* Loading state amélioré */}
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="relative mb-6">
                                        <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
                                        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-300 animate-ping opacity-75" />
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Sparkles className="h-4 w-4 animate-pulse" />
                                        <span className="font-medium">Recherche en cours...</span>
                                    </div>
                                </div>
                            )}

                            {/* Error state */}
                            {error && (
                                <div className="text-center py-16 px-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-red-50 border border-red-100 mb-6">
                                        <X className="h-8 w-8 text-red-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de recherche</h3>
                                    <p className="text-gray-600">{error}</p>
                                </div>
                            )}

                            {/* Empty state - no query */}
                            {!loading && !error && query.length === 0 && (
                                <div className="text-center py-16 px-6">
                                    <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl opacity-10 animate-pulse" />
                                        <Users className="h-10 w-10 text-blue-600 relative z-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Trouvez votre collègue</h3>
                                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                                        Commencez à taper pour rechercher parmi tous les employés
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                        <span className="text-sm font-medium text-blue-700">Minimum 2 caractères</span>
                                    </div>
                                </div>
                            )}

                            {/* No results */}
                            {!loading && !error && query.length > 0 && employees.length === 0 && (
                                <div className="text-center py-16 px-6">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100 mb-8">
                                        <User className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun résultat</h3>
                                    <p className="text-gray-600 mb-4">
                                        Aucun employé ne correspond à <span className="font-semibold">"{query}"</span>
                                    </p>
                                    <div className="text-sm text-gray-500">
                                        Essayez avec un autre terme de recherche
                                    </div>
                                </div>
                            )}

                            {/* Results list */}
                            {!loading && !error && employees.length > 0 && (
                                <div className="space-y-2 p-2">
                                    {employees.map((employee, index) => {
                                        const statusConfig = getStatusConfig(employee.status);
                                        const isSelected = index === selectedIndex;

                                        return (
                                            <button
                                                key={employee.id}
                                                onClick={() => handleEmployeeSelect(employee)}
                                                className={cn(
                                                    "w-full text-left p-5 rounded-2xl transition-all duration-300 focus:outline-none group relative overflow-hidden border",
                                                    isSelected
                                                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg shadow-blue-500/10 scale-[1.02]"
                                                        : "border-gray-100 hover:bg-gray-50/80 hover:border-gray-200 hover:shadow-md"
                                                )}
                                                style={{
                                                    transform: isSelected ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)'
                                                }}
                                            >
                                                {/* Gradient overlay pour l'item sélectionné */}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl" />
                                                )}

                                                <div className="flex items-center gap-5 relative z-10">
                                                    {/* Avatar amélioré */}
                                                    <div className="relative flex-shrink-0">
                                                        <div
                                                            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/50 relative overflow-hidden"
                                                            style={{
                                                                background: isSelected
                                                                    ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                                                                    : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                                                            }}
                                                        >
                                                            <span className="text-white font-bold text-lg">
                                                                {getInitials(getEmployeeFullName(employee))}
                                                            </span>
                                                        </div>

                                                        {/* Status indicator */}
                                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-white">
                                                            <div className={cn("w-3 h-3 rounded-full", statusConfig.dot)} />
                                                        </div>
                                                    </div>

                                                    {/* Employee info */}
                                                    <div className="flex-1 min-w-0">
                                                        {/* Name and status */}
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                                                            <h4 className="font-bold text-gray-900 text-lg truncate">
                                                                {getEmployeeFullName(employee)}
                                                            </h4>
                                                            <span className={cn(
                                                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border self-start",
                                                                statusConfig.background,
                                                                statusConfig.color,
                                                                statusConfig.border
                                                            )}>
                                                                <div className={cn("w-2 h-2 rounded-full", statusConfig.dot)} />
                                                                {statusConfig.label}
                                                            </span>
                                                        </div>

                                                        {/* Details */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                            {employee.email && (
                                                                <div className="flex items-center gap-2 text-gray-600">
                                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                                    <span className="truncate font-medium">{employee.email}</span>
                                                                </div>
                                                            )}

                                                            {employee.badgeNumber && (
                                                                <div className="flex items-center gap-2 text-gray-600">
                                                                    <Badge className="h-4 w-4 text-gray-400" />
                                                                    <span className="font-medium">#{employee.badgeNumber}</span>
                                                                </div>
                                                            )}

                                                            {employee.job?.title && (
                                                                <div className="flex items-center gap-2 text-gray-600">
                                                                    <User className="h-4 w-4 text-gray-400" />
                                                                    <span className="truncate font-medium">{employee.job.title}</span>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                                <span className="font-medium">
                                                                    {new Date(employee.entryDate).toLocaleDateString('fr-FR')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Company */}
                                                        {employee.companies && employee.companies.length > 0 && (
                                                            <div className="mt-3">
                                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/60 border border-gray-200/60 backdrop-blur-sm">
                                                                    <Building className="h-3.5 w-3.5 text-gray-500" />
                                                                    <span className="text-xs font-medium text-gray-700">
                                                                        {employee.companies.find(c => c.isDefault)?.company.name ||
                                                                            employee.companies[0]?.company.name}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer avec shortcuts */}
                        {employees.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-100/80 bg-gradient-to-r from-gray-50/80 to-slate-50/80">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-6 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <kbd className="px-2 py-1 bg-white/80 border border-gray-200 rounded-lg text-xs font-medium shadow-sm">↑</kbd>
                                                <kbd className="px-2 py-1 bg-white/80 border border-gray-200 rounded-lg text-xs font-medium shadow-sm">↓</kbd>
                                            </div>
                                            <span className="hidden sm:inline font-medium">Naviguer</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <kbd className="px-2 py-1 bg-white/80 border border-gray-200 rounded-lg text-xs font-medium shadow-sm">↵</kbd>
                                            <span className="hidden sm:inline font-medium">Sélectionner</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <kbd className="px-2 py-1 bg-white/80 border border-gray-200 rounded-lg text-xs font-medium shadow-sm">Esc</kbd>
                                        <span className="hidden sm:inline font-medium">Fermer</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { 
                        opacity: 0; 
                    }
                    to { 
                        opacity: 1; 
                    }
                }
                
                @keyframes modalSlideIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(-40px) scale(0.9); 
                        filter: blur(10px);
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                        filter: blur(0px);
                    }
                }

                /* Custom scrollbar */
                div::-webkit-scrollbar {
                    width: 6px;
                }

                div::-webkit-scrollbar-track {
                    background: transparent;
                }

                div::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.3);
                    border-radius: 3px;
                }

                div::-webkit-scrollbar-thumb:hover {
                    background: rgba(156, 163, 175, 0.5);
                }
            `}</style>
        </>
    );

    // Utiliser un portail pour rendre la modal directement dans le body
    return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default EmployeeSearchModal;