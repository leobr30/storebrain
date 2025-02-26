import { getCompanies, getJobs } from "../employee-area-action"
import { Company } from "@/types/company-types"
import { Job } from "@/types/employee-area-types"
import { HomePageView } from "@/features/employee-area/components/home/home-view"
import { fetchEmployees } from "@/features/employee-area/actions"
import { useGetEmployees } from "@/features/employee-area/api/use-get-employees"
import { Employee } from "@/features/employee-area/types"

const EmployeeArea = async ({searchParams}:{searchParams?:{company:string}}) => {
    console.log(searchParams)
    const jobs: Job[] = await getJobs()
    const [companies, employees] = await Promise.all([
        getCompanies(),
        fetchEmployees(searchParams?.company)
    ])    
    const { data } = await useGetEmployees()
    console.log("data", data)
    return <HomePageView
        employees={employees}
        companies={companies}
        jobs={jobs} />
}

export default EmployeeArea