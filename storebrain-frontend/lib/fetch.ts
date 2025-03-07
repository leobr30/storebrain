
import { BlobOptions } from "buffer";
import { auth } from "./auth";


export const fetchWithAuth = async (url: string, options: RequestInit = {}, withFormData?: boolean) => {
    const session = await auth()

    console.log("🔍 Token utilisé :", session?.tokens?.accessToken);

    let  headers:{Authorization: string, "Content-Type"?:string} = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.tokens?.accessToken}`,
    }

    if(withFormData) {
        delete headers["Content-Type"]
    }


    const res = await fetch(`${process.env.API_URL}/${url}`, {
        ...options,
        headers: headers 
    })
    if (!res.ok) {
        console.log(res);
        throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const text = await res.text()
    if(text.length > 0) {
        return await JSON.parse(text)
    }
    return null

}

export const fetchFile = async (url: string, options: RequestInit = {}) => {
    const session = await auth()

    let  headers:{Authorization: string} = {        
        Authorization: `Bearer ${session?.tokens?.accessToken}`,
    }

    const res = await fetch(`${process.env.API_URL}/${url}`, {
        ...options,
        headers: headers 
    })    
    return res;
    
}