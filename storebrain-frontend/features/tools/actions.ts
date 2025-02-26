"use server"
import { fetchWithAuth } from "@/lib/fetch";

export const sendFile = async (formData: FormData) => {
    const response = await fetchWithAuth('tools/update-prices', {
        method: 'POST',
        body: formData,
    }, true);

    return response;
}

export const getLastPriceUpdate = async () => {
    const response = await fetchWithAuth('tools/last-price-update', {
        method: 'GET',
    }, true);

    return response;
}

export const deletePriceUpdateRow = async (id: number) => {
    const response = await fetchWithAuth(`tools/price-update-row/${id}`, {
        method: 'DELETE',
    });
    return response;
}

export const deletePriceUpdateRowArticle = async (id: number) => {
    const response = await fetchWithAuth(`tools/price-update-row-article/${id}`, {
        method: 'DELETE',
    }, true);
    return response;
}

export const updatePriceUpdateRowArticle = async (id: number, updateData: { newSalePrice: number }) => {
    const response = await fetchWithAuth(`tools/price-update-row-article/${id}`, {
        method: 'PUT',        
        body: JSON.stringify(updateData),
    });
    return response;
}

export const updatePriceUpdateRowStatus = async (id: number) => {
    const response = await fetchWithAuth(`tools/price-update-row/${id}/status`, {
            method: 'PUT',
    });
    return response;
}

export const getOrderDownload = async (id: number) => {
    const response = await fetchWithAuth(`tools/order-download/${id}`, {
        method: 'GET',
    });
    return response;
}
