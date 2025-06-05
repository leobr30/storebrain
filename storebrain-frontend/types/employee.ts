// types/employee.ts
export type UserStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'PENDING_ONBOARDING' | 'ONBOARDING';

export interface Job {
    id?: number;
    title: string;
    name?: string; // Pour correspondre à votre modèle qui utilise "name"
}

export interface Company {
    id: number;
    name: string;
}

export interface UserCompany {
    company: Company;
    isDefault: boolean;
}

export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    name?: string;
    email?: string;
    username?: string;
    badgeNumber?: string;
    entryDate: string;
    status: UserStatus;
    job?: Job;
    companies?: UserCompany[];
    zone?: string;
}

export interface EmployeeSearchResponse {
    employees: Employee[];
    total?: number;
    hasMore?: boolean;
}

export interface EmployeeSearchFilters {
    status?: UserStatus[];
    jobIds?: number[];
    companyIds?: number[];
    entryDateFrom?: string;
    entryDateTo?: string;
}

// Hook personnalisé pour la recherche d'employés
export interface UseEmployeeSearchProps {
    initialQuery?: string;
    filters?: EmployeeSearchFilters;
    limit?: number;
    onSelect?: (employee: Employee) => void;
}

export interface UseEmployeeSearchReturn {
    query: string;
    setQuery: (query: string) => void;
    employees: Employee[];
    loading: boolean;
    error: string | null;
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    handleEmployeeSelect: (employee: Employee) => void;
    clearSearch: () => void;
}