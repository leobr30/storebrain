"use server"

import { fetchFile, fetchWithAuth } from "@/lib/fetch"
import { revalidatePath } from "next/cache"
import { AddAttachmentData } from "./components/training-drawer/attachments-dialog"
import { AbsenceType, Employee } from "./types"
import { redirect } from "next/navigation"

//EMPLOYEE

export const addEmployee = async (formData: FormData): Promise<{ data: { userId: number } }> => {
    const res = await fetchWithAuth('employees', { method: 'POST', body: formData }, true);
    revalidatePath('/en/employee-area/home');

    // transforme en format attendu
    return { data: { userId: res.userId } };
};




export const fetchEmployees = async (companyId?: string): Promise<Employee[]> => {
    return await fetchWithAuth(`employees?${companyId ? `company=${companyId}` : ''}`)
}

export const useFetchEmployee = async (id: number) => {
    return await fetchWithAuth(`employees/employee/${id}`)
}

export const activateEmployee = async (id: number, values: {}) => {
    await fetchWithAuth(`employees/${id}/activate`, { method: 'POST', body: JSON.stringify(values) })
    revalidatePath('/en/employee-area/home/')
}

//ONBOARDING

export const startEmployeeJobOnboarding = async (id: number) => {
    await fetchWithAuth(`employees/${id}/start-integration`, { method: 'POST' })
    revalidatePath('/en/employee-area/home')
}


export const createTraining = async (
    employeeId: number,
    employeeOnboordingId?: number, // Rendre optionnel
    trainingModelId?: number,
    name: string,
    subjects?: { id: string; name: string; state: "ACQUIRED" | "NOT_ACQUIRED" | "IN_PROGRESS"; }[]
) => {
    const endpoint = employeeOnboordingId
        ? `employees/${employeeId}/start-training/${employeeOnboordingId}` // Formation d'onboarding
        : `employees/${employeeId}/start-general-training`; // Formation générale

    const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify({ trainingModelId, name, subjects })
    });

    revalidatePath('/en/employee-area/home');
    return response;
}

export const refreshSteps = async (employeeId: number) => {
    return await fetchWithAuth(`employees/${employeeId}/onboarding`);
};

export const refreshResponses = async (employeeId: number) => {
    return await fetchWithAuth(`employees/${employeeId}/responses`);
};



//TRAINING

export const getTraining = async (trainingId: number) => {
    return await fetchWithAuth(`trainings/${trainingId}`)
}

export const createTrainingAttachment = async (trainingId: number, trainingSubjectId: number, data: FormData) => {
    return await fetchWithAuth(`trainings/${trainingId}/${trainingSubjectId}/add-attachment`, { method: 'POST', body: data }, true)
}

export const getTrainingModels = async () => {
    return await fetchWithAuth(`trainings/training-models`);
};


export const saveTraining = async (userId: number, trainingId: number, data: any) => {
    await fetchWithAuth(`trainings/${trainingId}/save`, { method: 'PUT', body: JSON.stringify(data) })
}

export const closeTraining = async (userId: number, trainingId: number, data: any) => {
    await fetchWithAuth(`trainings/${trainingId}/validate`, { method: 'PUT', body: JSON.stringify(data) })
    revalidatePath('/en/employee-area/home')
}

export const deleteTrainingAttachment = async (trainingId: number, attachmentId: number) => {
    await fetchWithAuth(`trainings/${trainingId}/delete-attachment/${attachmentId}`, { method: 'DELETE' })
    revalidatePath('/en/employee-area/home')
}

export const downloadTrainingAttachment = async (trainingId: number, attachmentId: number) => {
    const response = await fetchFile(`trainings/${trainingId}/download-attachment/${attachmentId}`)
    const header = response.headers.get('Content-Disposition');
    const parts = header!.split(';');
    const filename = parts[1].split('=')[1].replaceAll("\"", "");
    const blob = await response.blob()
}

export async function getTrainingsForCurrentUser(userId: number) {
    const response = await fetchWithAuth(`trainings/user/${userId}`);
    return response;
}



//ABSENCE
export const createAbsence = async (userId: number) => {
    const absence = await fetchWithAuth(`employees/${userId}/absences`, { method: 'POST' })
    revalidatePath('/en/employee-area/home')
    return absence;
}

export const updateAbsence = async (absenceId: number, data: FormData) => {
    await fetchWithAuth(`employees/absences/${absenceId}`, {
        method: 'PUT',
        body: data
    }, true)
    revalidatePath('/en/employee-area/home')
}

export const getAbsence = async (absenceId: number) => {
    return await fetchWithAuth(`employees/absences/${absenceId}`)
}

//APPOINTMENT

export const createAppointment = async (data: { date: Date, companyId: number }) => {
    const response = await fetchWithAuth(`employees/appointments`, {
        method: 'POST',
        body: JSON.stringify(data)
    })
    revalidatePath('/en/employee-area/home')
    const appointment = await response
    return appointment.data;
}

export const getAppointment = async (appointmentId: number) => {
    return await fetchWithAuth(`employees/appointments/${appointmentId}`)
}

export const getAppointments = async () => {
    return await fetchWithAuth(`employees/appointments`)
}

export const signMondayAppointmentDetail = async (appointmentDetailId: number) => {
    const response = await fetchWithAuth(`employees/appointments/details/${appointmentDetailId}/sign`, {
        method: 'PUT'
    })
    revalidatePath('/en/employee-area/home')
    return response;
}

//OMAR

export const createOmar = async (userId: number, appointmentDetailId?: number) => {
    const response = await fetchWithAuth(
        `employees/${userId}/omar?appointmentDetailId=${appointmentDetailId}`,
        { method: 'POST' }
    );

    const omar = response?.data;

    console.log("✅ OMAR extrait :", omar);

    if (!omar || !omar.id) {
        console.error("❌ OMAR manquant ou invalide :", omar);
        throw new Error("L'objet OMAR retourné est invalide.");
    }

    revalidatePath('/en/employee-area/home');
    return omar;
};


export const getOmar = async (omarId: string) => {
    return await fetchWithAuth(`employees/omar/${omarId}`)
}

export const getAllOmars = async () => {
    return await fetchWithAuth('employees/omar');
};




export const saveOmar = async (omarId: number, data: { objective: string, tool: string, action: string, observation: string, dueDate: Date | undefined, nextAppointment: Date | undefined }) => {
    await fetchWithAuth(`employees/omar/${omarId}/save`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
    revalidatePath('/en/employee-area/home')
}

export const validateOmar = async (omarId: string, data: { objective: string; tool: string; action: string; observation: string; dueDate: Date, nextAppointment: Date, result?: string; }) => {
    const response = await fetchWithAuth(`employees/omar/${omarId}/validate`, { method: 'PUT', body: JSON.stringify(data) })
    revalidatePath('/en/employee-area/home')
    return response;
}

export const updateMondayAppointmentDetail = async (
    onerpId: number,
    value: string
) => {
    await fetchWithAuth(`employees/appointments/details/${onerpId}/update-remaining-days`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remainingDays: value }),
    });
}

// RDV

export const sendMondayAppointmentSummary = async (appointmentId: number, email: string) => {
    try {
        const res = await fetchWithAuth(`employees/${appointmentId}/send-summary`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });


        return res;
    } catch (error) {
        console.error("❌ Erreur dans sendMondayAppointmentSummary :", error);
        throw new Error('Erreur lors de l’envoi du résumé');
    }
};

// Documents

export const uploadDocument = async (formData: FormData) => {
    await fetchWithAuth('documents/upload', {
        method: 'POST',
        body: formData,
    }, true);
    revalidatePath('/en/employee-area/documents');
};

export const getDocumentsForUser = async (userId: number) => {
    const url = `documents/${userId}`;
    console.log("Fetching documents from:", url);
    try {
        const response = await fetchWithAuth(url);
        return response;
    } catch (error) {
        console.error("Erreur lors de la récupération des documents:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        throw error;
    }
};

export const deleteDocument = async (documentId: number) => {
    await fetchWithAuth(`documents/${documentId}`, {
        method: 'DELETE',
    });
    revalidatePath('/en/employee-area/documents');
};


export const downloadDocument = async (documentId: number) => {
    const response = await fetchFile(`documents/download/${documentId}`);
    const header = response.headers.get('Content-Disposition');
    const parts = header!.split(';');
    const filename = parts[1].split('=')[1].replaceAll("\"", "");
    const blob = await response.blob();

    return { blob, filename };
};

// QUIZZ

// Récupérer un quizz complet
export const getQuizzById = async (quizzId: number) => {
    return await fetchWithAuth(`quizz/${quizzId}`);
};

// Soumettre les réponses à un quizz
export const submitQuizzAnswers = async (quizzId: number, data: {
    userId: number;
    answers: {
        questionId: number;
        answer: string;
    }[];
}) => {
    try {
        console.log("📤 Soumission des réponses:", { quizzId, data });
        const response = await fetchWithAuth(`quizz/${quizzId}/submit`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log("✅ Réponse de soumission:", response);
        return response;
    } catch (error) {
        console.error("❌ Erreur lors de la soumission:", error);
        throw error;
    }
};

export const getAssignedQuizz = async (quizzId: number, userId: number) => {
    return await fetchWithAuth(`quizz/${quizzId}`);
};

export const getQuizzWithResponse = async (responseId: string) => {
    try {
        const response = await fetchWithAuth(`quizz/response/${responseId}`, {
            method: "GET",
        });
        return response;
    } catch (error) {
        console.error("❌ Erreur dans getQuizzWithResponse :", error);
        throw error;
    }
};

export const markQuizzAsCompleted = async (
    employeeId: number,
    stepId: number,
    responseId: string
) => {
    try {
        console.log(`🔄 Marquage comme complété - Employee: ${employeeId}, Step: ${stepId}, Response: ${responseId}`);
        const response = await fetchWithAuth(
            `employees/${employeeId}/onboarding/${stepId}/complete`,
            {
                method: "PATCH",
                body: JSON.stringify({ responseId }),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response) throw new Error("Réponse vide de l'API");
        console.log("✅ Statut mis à jour :", response);
        return response;
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du statut :", error);
        throw error;
    }
};

export const getQuizzAnswersByUserId = async (quizzId: number, userId: string) => {
    try {
        console.log(`🔍 getQuizzAnswersByUserId - QuizzId: ${quizzId}, UserId: ${userId}`);
        const response = await fetchWithAuth(`quizz/${quizzId}/answers/${userId}`);
        console.log("📦 Réponse brute de l'API:", response);

        // Vérifier si response.data existe et a la bonne structure
        if (response && response.data) {
            console.log("✅ Données trouvées:", response.data);
            return response.data;
        } else if (response && response.answers) {
            // Au cas où la structure serait différente
            console.log("✅ Données trouvées (structure alternative):", response);
            return response;
        } else {
            console.log("⚠️ Aucune donnée trouvée dans la réponse");
            return { answers: [] };
        }
    } catch (error) {
        console.error('❌ Erreur dans getQuizzAnswersByUserId:', error);
        return { answers: [] }; // Retourner une structure vide plutôt que null
    }
};

export const getQuizzResponse = async (responseId: string) => {
    try {
        console.log(`🔍 getQuizzResponse - ResponseId: ${responseId}`);
        const response = await fetchWithAuth(`quizz/response/${responseId}`);
        console.log("📦 Réponse getQuizzResponse:", response);

        if (response && response.data) {
            return response.data;
        } else if (response) {
            return response;
        } else {
            console.log("⚠️ Aucune donnée trouvée pour le responseId");
            return { answers: [] };
        }
    } catch (error) {
        console.error('❌ Erreur dans getQuizzResponse:', error);
        return { answers: [] };
    }
};

export const uploadEmployeeDocuments = async (userId: number, formData: FormData) => {
    await fetchWithAuth(`employees/upload-documents/${userId}`, {
        method: 'POST',
        body: formData,
    }, true);
};

export const getEmployeeDocumentStatus = async (userId: number): Promise<{
    hasAllDocuments: boolean;
    missingDocuments: DocumentType[];
}> => {
    return await fetchWithAuth(`employees/${userId}/document-status`);
};

export const sendUnsignedDocuments = async (userId: number) => {
    return await fetchWithAuth(`employees/${userId}/send-unsigned-documents`, {
        method: 'POST',
    });
};

export const checkQuizzAvailability = async (quizzId: number) => {
    try {
        const result = await fetchWithAuth(`quizz/${quizzId}/check-availability`);
        return {
            hasQuizz: result.hasQuizz,
            message: result.message,
            quizz: result.data
        };
    } catch (error) {
        console.error("Erreur lors de la vérification du quizz :", error);
        return {
            hasQuizz: false,
            message: "Erreur de connexion",
            quizz: null
        };
    }
};

export async function getOnboardingTrainingsForCurrentUser(userId: number) {
    const response = await fetchWithAuth(`trainings/user/${userId}/onboarding`);
    return response;
};

export const createGeneralTraining = async (
    employeeId: number,
    trainingModelId?: number,
    name: string,
    subjects?: { id: string; name: string; state: "ACQUIRED" | "NOT_ACQUIRED" | "IN_PROGRESS"; }[]
) => {
    const response = await fetchWithAuth(`employees/${employeeId}/start-general-training`, {
        method: 'POST',
        body: JSON.stringify({ trainingModelId, name, subjects })
    });

    revalidatePath('/en/employee-area/home');
    return response;
};

// ✅ Actions frontend corrigées pour les bilans (actions.ts)

// ✅ Sauvegarder un bilan (corrigé)
export const saveResultReview = async (
    stepId: number,
    reviewData: {
        objectif?: string;
        realise?: string;
        magasin?: string;
        vendeuse?: string;
        commentaire?: string;
    }
) => {
    try {
        const response = await fetchWithAuth(`employees/step/${stepId}/save-result-review`, {
            method: 'POST',
            body: JSON.stringify(reviewData), // ✅ Pas besoin de headers ici, fetchWithAuth s'en charge
        });

        return response; // ✅ fetchWithAuth retourne déjà le JSON parsé
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du bilan:', error);
        throw error;
    }
};

// ✅ Récupérer un bilan existant (corrigé)
export const getResultReview = async (stepId: number) => {
    try {
        const response = await fetchWithAuth(`employees/step/${stepId}/result-review`);
        return response; // ✅ fetchWithAuth gère déjà les erreurs 404
    } catch (error) {
        console.error('Erreur lors de la récupération du bilan:', error);
        // ✅ Retourner null si pas de données au lieu de throw
        return null;
    }
};

// ✅ Marquer un bilan comme complété (corrigé)
export const markResultReviewAsCompleted = async (stepId: number, responseId: string) => {
    try {
        const response = await fetchWithAuth(`employees/step/${stepId}/complete-result-review`, {
            method: 'POST',
            body: JSON.stringify({ responseId }),
        });

        return response;
    } catch (error) {
        console.error('Erreur lors de la validation du bilan:', error);
        throw error;
    }
};

// ✅ Action combinée pour sauvegarder ET compléter un bilan (corrigée)
export const submitResultReview = async (
    stepId: number,
    reviewData: {
        objectif?: string;
        realise?: string;
        magasin?: string;
        vendeuse?: string;
        commentaire?: string;
    }
) => {
    try {
        // 1. Sauvegarder le bilan
        const saveResponse = await saveResultReview(stepId, reviewData);

        // 2. Marquer comme complété
        const completeResponse = await markResultReviewAsCompleted(stepId, saveResponse.responseId);

        // ✅ Revalider la page pour rafraîchir les données
        revalidatePath('/en/employee-area/home');

        return completeResponse;
    } catch (error) {
        console.error('Erreur lors de la soumission du bilan:', error);
        throw error;
    }

};

// Ajouter ces actions dans votre fichier actions.ts

// RDV ANNUEL

export const getAnnualReviewSections = async () => {
    return await fetchWithAuth('annual-reviews/sections');
};

export const createAnnualReview = async (data: {
    employeeId: number;
    companyId: number;
}) => {
    const response = await fetchWithAuth('annual-reviews', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    revalidatePath('/en/employee-area/rdv-annuel');
    return response;
};

export const updateAnnualReview = async (reviewId: number, data: {
    responses: { questionId: number; answer: string }[];
}) => {
    const response = await fetchWithAuth(`annual-reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    revalidatePath('/en/employee-area/rdv-annuel');
    return response;
};

export const getAnnualReview = async (reviewId: number) => {
    return await fetchWithAuth(`annual-reviews/${reviewId}`);
};

export const getAnnualReviews = async (filters?: {
    employeeId?: number;
    reviewerId?: number;
    companyId?: number;
    status?: string;
}) => {
    const params = new URLSearchParams();
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) params.append(key, value.toString());
        });
    }
    const queryString = params.toString();
    return await fetchWithAuth(`annual-reviews${queryString ? `?${queryString}` : ''}`);
};

export const submitAnnualReview = async (reviewId: number) => {
    const response = await fetchWithAuth(`annual-reviews/${reviewId}/submit`, {
        method: 'POST'
    });
    revalidatePath('/en/employee-area/rdv-annuel');
    return response;
};

export const saveAnnualReviewResponse = async (reviewId: number, questionId: number, answer: string) => {
    const response = await fetchWithAuth(`annual-reviews/${reviewId}/responses`, {
        method: 'POST',
        body: JSON.stringify({ questionId, answer })
    });
    return response;
};






