"use server"

import { fetchFile, fetchWithAuth } from "@/lib/fetch"
import { revalidatePath } from "next/cache"
import { AddAttachmentData } from "./components/training-drawer/attachments-dialog"
import { AbsenceType, Employee } from "./types"
import { redirect } from "next/navigation"

//EMPLOYEE

export const addEmployee = async (formData: FormData) => {

    await fetchWithAuth('employees', { method: 'POST', body: formData }, true)
    revalidatePath('/en/employee-area/home')
}

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

export const createTrainingWithOnboarding = async (employeeId: number, employeeOnboordingId: number) => {
    const response = await fetchWithAuth(`employees/${employeeId}/start-training/${employeeOnboordingId}`, { method: 'POST' })
    revalidatePath('/en/employee-area/home')
    return response;
}

// ✅ New function to refresh the onboarding steps
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

export const createTrainingAttachment = async (userId: number, trainingId: number, trainingSubjectId: number, data: FormData) => {
    return await fetchWithAuth(`trainings/${trainingId}/${trainingSubjectId}/add-attachment`, { method: 'POST', body: data }, true)
}


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
    const response =await fetchFile(`trainings/${trainingId}/download-attachment/${attachmentId}`)
    const header = response.headers.get('Content-Disposition');
    const parts = header!.split(';');
    const filename = parts[1].split('=')[1].replaceAll("\"", "");
    const blob = await response.blob()    
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
    return response;
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
    const response = await fetchWithAuth(`employees/${userId}/omar?appointmentDetailId=${appointmentDetailId}`, { method: 'POST' })
    revalidatePath('/en/employee-area/home')
    return response;
}

export const getOmar = async (omarId: string) => {
    return await fetchWithAuth(`employees/omar/${omarId}`)
}

export const saveOmar = async (omarId: number, data: { objective: string, tool: string, action: string, observation: string, dueDate: Date | undefined, nextAppointment: Date | undefined }) => {
    await fetchWithAuth(`employees/omar/${omarId}/save`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
    revalidatePath('/en/employee-area/home')
}

export const validateOmar = async (omarId: string, data: { objective: string; tool: string; action: string; observation: string; dueDate: Date, nextAppointment: Date }) => {
    const response = await fetchWithAuth(`employees/omar/${omarId}/validate`, { method: 'PUT', body: JSON.stringify(data) }) // ✅ Corrected URL
    revalidatePath('/en/employee-area/home')
    return response;
}
