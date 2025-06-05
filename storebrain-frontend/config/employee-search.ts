// config/employee-search.ts
import { UserStatus } from '@/types/employee';

export const SEARCH_CONFIG = {
    // Délai de debounce pour la recherche en temps réel (ms)
    DEBOUNCE_DELAY: 300,

    // Nombre minimum de caractères pour déclencher une recherche
    MIN_SEARCH_LENGTH: 2,

    // Nombre maximum de résultats à afficher
    MAX_RESULTS: 20,

    // Raccourci clavier pour ouvrir la recherche
    KEYBOARD_SHORTCUT: {
        key: 'k',
        metaKey: true, // Cmd sur Mac, Ctrl sur PC
    },

    // Champs sur lesquels effectuer la recherche
    SEARCH_FIELDS: [
        'firstName',
        'lastName',
        'name',
        'information.email',
        'badgeNumber',
        'username'
    ],

    // Ordre de tri des résultats
    SORT_ORDER: [
        { field: 'status', direction: 'asc' }, // ACTIVE en premier
        { field: 'firstName', direction: 'asc' },
        { field: 'lastName', direction: 'asc' },
    ],

    // Mapping des statuts pour l'affichage (selon votre modèle Prisma)
    STATUS_LABELS: {
        'ACTIVE': {
            label: 'Actif',
            color: 'bg-green-100 text-green-800',
            priority: 1
        },
        'PENDING': {
            label: 'En attente',
            color: 'bg-yellow-100 text-yellow-800',
            priority: 2
        },
        'PENDING_ONBOARDING': {
            label: 'En attente d\'intégration',
            color: 'bg-blue-100 text-blue-800',
            priority: 3
        },
        'ONBOARDING': {
            label: 'En cours d\'intégration',
            color: 'bg-purple-100 text-purple-800',
            priority: 4
        },
        'INACTIVE': {
            label: 'Inactif',
            color: 'bg-red-100 text-red-800',
            priority: 5
        }
    } as Record<UserStatus, { label: string; color: string; priority: number }>,

    // URLs de redirection (adaptées à votre structure)
    ROUTES: {
        EMPLOYEE_PROFILE: '/employees/employee/{id}',
        EMPLOYEE_EDIT: '/employees/{id}/edit',
        EMPLOYEE_LIST: '/employees',
    },

    // Messages d'erreur personnalisés
    ERROR_MESSAGES: {
        SEARCH_FAILED: 'Erreur lors de la recherche des employés',
        NO_RESULTS: 'Aucun employé trouvé',
        NETWORK_ERROR: 'Problème de connexion, veuillez réessayer',
        SERVER_ERROR: 'Erreur serveur, contactez l\'administrateur',
    },

    // Textes d'interface
    UI_TEXTS: {
        SEARCH_PLACEHOLDER: 'Rechercher un employé (nom, prénom, email, badge...)',
        SEARCH_BUTTON: 'Rechercher un employé...',
        LOADING_TEXT: 'Recherche...',
        EMPTY_STATE_TITLE: 'Commencez à taper pour rechercher',
        EMPTY_STATE_SUBTITLE: 'Minimum 2 caractères',
        NO_RESULTS_TITLE: 'Aucun employé trouvé',
        NO_RESULTS_SUBTITLE: 'Essayez avec un nom, prénom, email ou numéro de badge',
    },

    // Configuration des animations
    ANIMATIONS: {
        MODAL_DURATION: 200,
        RESULTS_DELAY: 100,
        HIGHLIGHT_DURATION: 150,
    }
} as const;

// Fonction utilitaire pour générer l'URL du profil (adaptée à votre structure)
export const getEmployeeProfileUrl = (employeeId: number): string => {
    return SEARCH_CONFIG.ROUTES.EMPLOYEE_PROFILE.replace('{id}', employeeId.toString());
};

// Fonction utilitaire pour obtenir le libellé et la couleur du statut
export const getStatusDisplay = (status: UserStatus) => {
    return SEARCH_CONFIG.STATUS_LABELS[status] || {
        label: status,
        color: 'bg-gray-100 text-gray-800',
        priority: 999
    };
};

// Fonction pour formater le nom complet d'un employé
export const getEmployeeDisplayName = (employee: {
    firstName: string;
    lastName: string;
    name?: string;
}): string => {
    if (employee.name) return employee.name;
    return `${employee.firstName} ${employee.lastName}`.trim() || 'Nom non défini';
};

// Fonction pour générer les initiales d'un employé
export const getEmployeeInitials = (employee: {
    firstName: string;
    lastName: string;
    name?: string;
}): string => {
    const fullName = getEmployeeDisplayName(employee);
    return fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};