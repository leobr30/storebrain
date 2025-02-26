"use client"

import axiosInstance from "@/lib/axios-instance";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const useAxios = () => {
    const {data: session} = useSession()    
    
    useEffect(() => {
        const requestIntercept =axiosInstance.interceptors.request.use((config) => {
            if(!config.headers['Authorization']) {
                config.headers['Authorization'] = `Bearer ${session?.user.accessToken}`;
            }
            return config
        });

        return () => {
            axiosInstance.interceptors.request.eject(requestIntercept)
        }
    },[session])
    
    return axiosInstance;
}

export default useAxios