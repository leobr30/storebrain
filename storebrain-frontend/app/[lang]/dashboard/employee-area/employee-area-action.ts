"use server"
import {z} from 'zod'
import { jobSchema } from "./job/dialog-add-job";
import { revalidatePath } from "next/cache";
import { fetchWithAuth } from "@/lib/fetch";
import { Company } from '@/types/company-types';


export const startTraining = async(id:number, userIntegrationId: number) => {
    const training =  await fetchWithAuth(`employees/${id}/start-training/${userIntegrationId}`,{method:'POST'})
    console.log(training)
    revalidatePath('/en/employee-area/view')
    
    return training
}

export const getTraining = async(id:number, trainingId: number) => {
    const training =  await fetchWithAuth(`employees/${id}/training/${trainingId}`,{method:'GET'})
    console.log(training)    
    return training
}

//TODO MOVE TO JOBS

export const getJobs = async () => {
    return await fetchWithAuth('jobs')
 }
export const createJob = async (values:z.infer<typeof jobSchema> ) => {
    await fetchWithAuth('jobs',{
        method:'POST',
         body:JSON.stringify(values)
        })
    revalidatePath('/en/employee-area/job')
}

export const editJob = async (id:number,values:z.infer<typeof jobSchema> ) => {
    await fetchWithAuth(`jobs/${id}`,{
        method:'PUT',
        body:JSON.stringify(values)
    })
    revalidatePath('/en/employee-area/job')
}

//TODO MOVE TO COMPANIES
export const getCompanies = async(companyId?:string):Promise<Company[]> => {
    return await fetchWithAuth('companies')
}

//TODO Move to integrations

export const getIntegrations = async() => {
 return await fetchWithAuth('integrations');
}

export const createIntegration = async (values:any) => {
    const request = {jobId: values.job.value,
        steps:values.steps
    }     
    await fetchWithAuth(`integrations`,{
        method:'POST',
         body:JSON.stringify(request)
        })
    revalidatePath('/en/employee-area/integration')
}