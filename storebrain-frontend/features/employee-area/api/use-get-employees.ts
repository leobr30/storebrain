import useAxios from "@/hooks/use-axios"
import axiosInstance from "@/lib/axios-instance";
import { fetchWithAuth } from "@/lib/fetch";


export const useGetEmployees = async () => {
    return await fetchWithAuth('employees');
}