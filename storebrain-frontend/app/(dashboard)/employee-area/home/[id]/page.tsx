
import { useFetchEmployee } from "@/features/employee-area/actions";
import { EmployeeView } from "@/features/employee-area/components/employee/employee-view";
import { SessionProvider } from "next-auth/react";



const EmployeePage = async ({params}:{params:{id: number}}) => {
    const employee = await useFetchEmployee(params.id);
    console.log(employee)
    return <SessionProvider>
        <EmployeeView employee={employee}/>
    </SessionProvider>
}

export default EmployeePage