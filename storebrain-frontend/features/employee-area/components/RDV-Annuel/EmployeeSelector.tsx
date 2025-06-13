'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, User, Search, Loader2, Users, MapPin, Briefcase, Hash, Filter, X } from 'lucide-react';
import { Employee } from '../../types';
import { fetchEmployees } from '../../actions';

interface EmployeeSelectorProps {
    onSelectEmployee: (employee: Employee) => void;
    selectedCompanyId?: number;
}

export default function EmployeeSelector({ onSelectEmployee, selectedCompanyId }: EmployeeSelectorProps) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedZone, setSelectedZone] = useState<string>('');
    const [selectedJobType, setSelectedJobType] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        loadEmployees();
    }, [selectedCompanyId]);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchEmployees(selectedCompanyId?.toString());
            setEmployees(data);
        } catch (err) {
            setError('Erreur lors du chargement des employés');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const getUniqueZones = () => {
        const zones = employees
            .map(emp => emp.zone)
            .filter(zone => zone && zone.trim() !== '')
            .filter((zone, index, self) => self.indexOf(zone) === index);
        return zones.sort();
    };

    const getUniqueJobTypes = () => {
        const jobTypes = employees
            .map(emp => emp.job?.name)
            .filter(job => job && job.trim() !== '')
            .filter((job, index, self) => self.indexOf(job) === index);
        return jobTypes.sort();
    };

    const filteredEmployees = employees.filter(employee => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
            employee.name?.toLowerCase().includes(searchLower) ||
            employee.zone?.toLowerCase().includes(searchLower) ||
            employee.job?.name?.toLowerCase().includes(searchLower) ||
            employee.badgeNumber?.toString().includes(searchLower)
        );

        const matchesZone = !selectedZone || employee.zone === selectedZone;
        const matchesJob = !selectedJobType || employee.job?.name === selectedJobType;

        return matchesSearch && matchesZone && matchesJob;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedZone('');
        setSelectedJobType('');
    };

    const hasActiveFilters = searchTerm || selectedZone || selectedJobType;

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                    <div className="text-center">
                        <h3 className="font-semibold text-gray-800">Chargement des employés</h3>
                        <p className="text-gray-600 text-sm">Veuillez patienter...</p>
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
                                onClick={loadEmployees}
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
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center">
                            <Users className="mr-3" size={28} />
                            Sélectionner un employé
                        </h2>
                        <p className="text-blue-100 mt-1">
                            {employees.length} employé{employees.length > 1 ? 's' : ''} disponible{employees.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <User size={48} className="text-blue-200 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="space-y-4">
                    {/* Barre de recherche */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, zone, poste ou badge..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-48">
                            <select
                                value={selectedZone}
                                onChange={(e) => setSelectedZone(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">Toutes les zones</option>
                                {getUniqueZones().map(zone => (
                                    <option key={zone} value={zone}>{zone}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-w-48">
                            <select
                                value={selectedJobType}
                                onChange={(e) => setSelectedJobType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">Tous les postes</option>
                                {getUniqueJobTypes().map(job => (
                                    <option key={job} value={job}>{job}</option>
                                ))}
                            </select>
                        </div>

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

                    {/* Statistiques et mode d'affichage */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {filteredEmployees.length} résultat{filteredEmployees.length > 1 ? 's' : ''}
                            {hasActiveFilters && filteredEmployees.length !== employees.length && (
                                <span> sur {employees.length}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des employés */}
            <div className="p-6">
                {filteredEmployees.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun employé trouvé</h3>
                        <p className="text-gray-600 mb-4">
                            {hasActiveFilters
                                ? "Essayez de modifier vos critères de recherche"
                                : "Aucun employé n'est disponible pour le moment"
                            }
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Effacer les filtres
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredEmployees.map(employee => (
                            <div
                                key={employee.id}
                                onClick={() => onSelectEmployee(employee)}
                                className="group relative border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white hover:bg-blue-50"
                            >
                                {/* Barre latérale colorée */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 group-hover:bg-blue-400 rounded-l-lg transition-colors duration-200"></div>

                                <div className="flex items-start justify-between">
                                    <div className="flex-1 ml-3">
                                        {/* Nom et avatar */}
                                        <div className="flex items-center mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                                                {employee.name?.charAt(0)?.toUpperCase() || 'E'}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                                                    {employee.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">ID: {employee.id}</p>
                                            </div>
                                        </div>

                                        {/* Informations */}
                                        <div className="space-y-2">
                                            {employee.job?.name && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Briefcase size={14} className="mr-2 text-gray-400" />
                                                    <span>{employee.job.name}</span>
                                                </div>
                                            )}

                                            {employee.zone && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <MapPin size={14} className="mr-2 text-gray-400" />
                                                    <span>{employee.zone}</span>
                                                </div>
                                            )}

                                            {employee.badgeNumber && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Hash size={14} className="mr-2 text-gray-400" />
                                                    <span>Badge: {employee.badgeNumber}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {employee.contract?.type && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {employee.contract.type}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Icône de flèche */}
                                    <ChevronRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 mt-2" size={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}