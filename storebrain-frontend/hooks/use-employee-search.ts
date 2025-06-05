// hooks/use-employee-search.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Employee, UseEmployeeSearchProps, UseEmployeeSearchReturn } from '@/types/employee';
import { searchEmployees as searchEmployeesAction } from '../lib/action/search-employees'

export const useEmployeeSearch = ({
    initialQuery = '',
    limit = 20,
    onSelect,
}: UseEmployeeSearchProps = {}): UseEmployeeSearchReturn => {
    const [query, setQuery] = useState(initialQuery);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    // Fonction de recherche utilisant la Server Action
    const searchEmployees = useCallback(async (searchTerm: string) => {
        if (searchTerm.length < 2) {
            setEmployees([]);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('🔍 Hook - Recherche pour:', searchTerm);

            // Appel de la Server Action
            const result = await searchEmployeesAction(searchTerm, limit);

            console.log('📊 Hook - Résultat reçu:', result);

            if (result.error) {
                setError(result.error);
                setEmployees([]);
            } else {
                setEmployees(result.employees || []);
            }
        } catch (err) {
            console.error('❌ Hook - Erreur lors de la recherche:', err);
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    // Effet pour la recherche en temps réel
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            searchEmployees(query);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query, searchEmployees]);

    // Reset de l'index sélectionné quand les résultats changent
    useEffect(() => {
        setSelectedIndex(-1);
    }, [employees]);

    // Gestion des touches du clavier
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < employees.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && employees[selectedIndex]) {
                    handleEmployeeSelect(employees[selectedIndex]);
                }
                break;
            case 'Escape':
                clearSearch();
                break;
        }
    }, [selectedIndex, employees]);

    // Sélection d'un employé
    const handleEmployeeSelect = useCallback((employee: Employee) => {
        if (onSelect) {
            onSelect(employee);
        } else {
            // Redirection par défaut vers le profil employé
            window.location.href = `/employees/employee/${employee.id}`;
        }
    }, [onSelect]);

    // Effacer la recherche
    const clearSearch = useCallback(() => {
        setQuery('');
        setEmployees([]);
        setSelectedIndex(-1);
        setError(null);
    }, []);

    return {
        query,
        setQuery,
        employees,
        loading,
        error,
        selectedIndex,
        setSelectedIndex,
        handleKeyDown,
        handleEmployeeSelect,
        clearSearch,
    };
};

// Hook pour les raccourcis clavier globaux
export const useEmployeeSearchShortcuts = (
    onOpenSearch: () => void
) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Éviter d'ouvrir la recherche si on est dans un input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Ctrl+K ou Cmd+K pour ouvrir la recherche
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                onOpenSearch();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onOpenSearch]);
};