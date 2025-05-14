"use server"

import { fetchWithAuth } from "@/lib/fetch"
import { addYears } from "date-fns"


// export const getAnalyze1 = async() => {
//     return await fetchWithAuth('analyze',{method:'POST'})
// }

export const getAnalyze1 = async(supplierId: string | null) => {
    const body =  JSON.stringify({
        storeIds:[],
        supplierIds:supplierId ? [supplierId] : [],
        departments:['OR'],
        startDate:addYears(new Date(), -1) ,
        endDate:new Date(),
    })
    console.log(body)
    return await fetchWithAuth('analyze/analyze1',{method:'POST', body:body})
}