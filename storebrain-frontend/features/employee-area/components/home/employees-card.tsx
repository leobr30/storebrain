"use client"
import EmployeeAreaAddDrawer from "@/features/employee-area/components/home/add-drawer/add-drawer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Company } from "@/types/company-types"
import { Job } from "@/types/employee-area-types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TableWithHeader } from "../table-with-header"
import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { getInitials } from "@/lib/utils"
import { StatusBadge } from "../status-badge"

interface EmployeesCardProps {
    employees: any[]
    jobs: Job[]
    companies: Company[]
}



export const EmployeesCard = ({ employees, companies, jobs }: EmployeesCardProps) => {

    const columns = useMemo<ColumnDef<Employee, any>[]>(() => [       
        {
            accessorKey: 'name',
            header:'Nom',
            cell: info => <div className="flex gap-3 items-center">
                <Avatar className="rounded-lg">
                    <AvatarImage src={''} />
                    <AvatarFallback className="text-primary">{getInitials(info.getValue())}</AvatarFallback>
                </Avatar>
                <Link 
                className="hover:bg-transparent bg-transparent text-primary hover:text-primary/80  hover:underline"
                href={`home/${info.row.original.id}`}>{info.getValue()}</Link>
                {/* <span className="text-sm  text-default-600">
                    
                </span> */}
            </div>
        },
        {
            accessorKey:'zone'
        },        
        {
            header:'Poste',
            accessorKey:'job.name'
        },
        {
            header:'Contrat',
            accessorFn: row => row.contract ? `${row.contract.type} - ${row.contract.workingHoursPerWeek}H` : ''
        },
        {
            header:'Statut',
            accessorKey:'status',
            cell:info => <StatusBadge status={info.getValue()}/>
        },
        
    ], [])

    return (
        <Card>
            <CardHeader className="flex-row justify-between items-center ">
                <CardTitle>Liste des salariés</CardTitle>
                <EmployeeAreaAddDrawer companies={companies} jobs={jobs} />
            </CardHeader>
            <CardContent>
            <TableWithHeader
                tabs={[
                    { text: 'Tous', value: "" },
                    { text: 'Actif', value: "ENABLED" },
                    { text: "En cours d'intégration", value: "INT" },
                    { text: "En Attente d'intégration", value: "INT_TEMP" },
                    { text: "En Attente", value: "WAITING" },
                ]}
                columns={columns}
                data={employees}
                columnFilterName="name"
            />
            </CardContent>
            
        </Card>
    )
}