import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo, useState } from "react"
import { TableWithHeader } from "../table-with-header"
import { EmployeeAbsenceDetail } from "./employee-absence-detail"
import { StatusBadge } from "../status-badge"
import { formatDate } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { createAbsence } from "../../actions"
import { Absence, AbsenceType } from "../../types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type EmployeeAbsenceProps = {
    absences: Absence[]
    employeeId: number
}

export const EmployeeAbsence = ({employeeId, absences}: EmployeeAbsenceProps) => {

    const searchParams = useSearchParams()
    const router = useRouter()
    const pathName = usePathname()

    const handleAbsenceClick = (absenceId: number) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('absenceId', absenceId.toString())
        router.replace(`${pathName}?${newSearchParams.toString()}`  )
    }
    
    
    const columns = useMemo<ColumnDef<Absence>[]>(() => [
        // {
        //     accessorKey: 'createdAt',
        //     header: 'Date de création',
        //     cell: ({row}) => {
        //         return <span>{formatDate(row.original.createdAt, 'dd/MM/yyyy')}</span>
        //     },
        // },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => {
                const absenceType = row.original.type;
                switch (absenceType) {
                    case AbsenceType.UNJUSTIFIED_ABSENCE:
                        return "Absence injustifiée";
                    case AbsenceType.DELAY:
                        return "Retard";
                    case AbsenceType.MEDICAL:
                        return "Maladie";
                    case AbsenceType.SICK_CHILDREN:
                        return "Enfant malade";
                        case AbsenceType.DEATH:
                            return "Décès";
                        case AbsenceType.ACCIDENT_AT_WORK:
                            return "Accident du travail";
                        case AbsenceType.TRANSPORT_ACCIDENT:
                            return "Accident de transport";
                    default:                        
                        return absenceType;
                }
            },
        },
        {
            accessorKey: 'startAt',
            header: 'En arret depuis',
            cell: ({row}) => {
                return <span>{formatDate(row.original.startAt, 'dd/MM/yyyy HH:mm')}</span>
            },
        },
        {
            accessorKey: 'endAt',
            header: 'A repris le',
            cell: ({row}) => {
                return <span>{row.original.endAt ? formatDate(row.original.endAt, 'dd/MM/yyyy HH:mm') : '-'}</span>
            },
        },        
        {
            accessorKey: 'status',
            cell: ({row}) => {
                return <StatusBadge status={row.original.status} />
            },
            header: 'Statut',
        },  
        {
            accessorKey: 'actions',
            cell: ({row}) => {
                return row.original.status !== 'COMPLETED' ? <Button variant='ghost' onClick={() => handleAbsenceClick(row.original.id)}>Mettre à jour</Button> : <span>Renseigné par {row.original.createdBy.name}</span>
            },
            header: 'Actions',
        }             
    ], [])

    const vacationColumns = useMemo<ColumnDef<Absence>[]>(() => [
        // {
        //     accessorKey: 'createdAt',
        //     header: 'Date de création',
        //     cell: ({row}) => {
        //         return <span>{formatDate(row.original.createdAt, 'dd/MM/yyyy')}</span>
        //     },
        // },       
        {
            accessorKey: 'date de demande',
            header: 'Date',
            cell: ({row}) => {
                return <span>{formatDate(row.original.startAt, 'dd/MM/yyyy HH:mm')}</span>
            },
        },
        {
            accessorKey: 'startAt',
            header: 'Date début',
            cell: ({row}) => {
                return <span>{formatDate(row.original.startAt, 'dd/MM/yyyy HH:mm')}</span>
            },
        },
        {
            accessorKey: 'endAt',
            header: 'Date fin',
            cell: ({row}) => {
                return <span>{row.original.endAt ? formatDate(row.original.endAt, 'dd/MM/yyyy HH:mm') : '-'}</span>
            },
        },        
        {
            accessorKey: 'status',
            cell: ({row}) => {
                return <StatusBadge status={row.original.status} />
            },
            header: 'Statut',
        },  
        {
            accessorKey: 'actions',
            cell: ({row}) => {
                return row.original.status === 'IN_PROGRESS' ? <EmployeeAbsenceDetail employeeId={employeeId} formType="update" absence={row.original} trigger={<Button>Mettre à jour</Button>} /> : <span>Renseigné par {row.original.createdBy.name}</span>
            },
            header: 'Actions',
        }             
    ], [])
    const handleCreateAbsence = async () => {
        const absence = await createAbsence(employeeId)
        router.replace(`${pathName}?absenceId=${absence.id}`)        
    }
    return (
        <div className="space-y-4">
        <Card>
            <CardHeader className="flex-row justify-between items-center ">
                <CardTitle>Absences</CardTitle>
                <Button onClick={handleCreateAbsence}>Ajouter une absence</Button>
            </CardHeader>
            <CardContent>
                <TableWithHeader columns={columns} data={absences}/>            
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex-row justify-between items-center ">
                <CardTitle>Vacances</CardTitle>                
                <EmployeeAbsenceDetail employeeId={employeeId} formType="create" trigger={<Button>Ajouter des vacances</Button>} />
            </CardHeader>
            <CardContent>
                <TableWithHeader columns={vacationColumns} data={[]}/>            
            </CardContent>
        </Card>
        </div>
        
        
    )
}