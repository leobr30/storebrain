import { api } from "@/config/axios.config"

const AddEmployee = async () => {
    const jobs = await api.get('/employees/jobs')
    return <>
    Déclaré
    </>
} 

export default AddEmployee