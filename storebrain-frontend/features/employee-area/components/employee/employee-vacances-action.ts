'use server';

import { fetchWithAuth } from "@/lib/fetch";

export const createVacation = async (employeeId: number, vacationData: { startAt: Date | string; endAt: Date | string }) => {
    return await fetchWithAuth(`employees/${employeeId}/vacations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            startAt: new Date(vacationData.startAt).toISOString(),
            endAt: new Date(vacationData.endAt).toISOString(),
        }),
    });
};

export const updateVacation = async (employeeId: number, vacationId: number, vacationData: { startAt: Date; endAt: Date }) => {
    return await fetchWithAuth(`employees/${employeeId}/vacations/${vacationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            startAt: vacationData.startAt.toISOString(),
            endAt: vacationData.endAt.toISOString(),
        }),
    });
};


