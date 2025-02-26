"use client"
import { Job } from "@/types/employee-area-types"
import { CompanySelect } from "../company-select"
import { EmployeesCard } from "./employees-card"
import { EmployeesStats } from "./employees-stats"
import { Company } from "@/types/company-types"

type HomePageViewProps = {
    employees: Employee[]
    jobs: Job[]
    companies: Company[]
}

export const HomePageView = ({
    employees,
    jobs,
    companies
}: HomePageViewProps) => {
    return (
        <div className="space-y-5">
            <div className="flex items-center flex-wrap justify-between gap-4">
                <div className="text-2xl font-medium text-default-800 ">
                    Espace Salariés
                </div>
                <CompanySelect companies={companies} />
            </div>
            <EmployeesStats employees={employees} />
            <EmployeesCard
                employees={employees}
                jobs={jobs}
                companies={companies} />
        </div>

    )
}