"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo } from "react"
import toast from "react-hot-toast"
import { createAppointment } from "../../actions"
import { MondayAppointment } from "../../types"
import { id } from "date-fns/locale"
import { TableWithHeader } from "../table-with-header"
import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"

type AppointmentsCardProps = {
    appointments: MondayAppointment[]
}

export const AppointmentsCard = ({ appointments }: AppointmentsCardProps) => {

    const searchParams = useSearchParams()
    const pathname = usePathname();
    const { replace } = useRouter();
    const handleCreateAppointmentClick = async () => {
        const companyId = searchParams.get('company'); // Get companyId from searchParams
        if (!companyId) {
            toast.error("Veuillez sélectionner une entreprise")
            return;
        }
        try {
            const appointment = await createAppointment({ date: new Date(), companyId: parseInt(companyId) }) // Use the correct companyId
            const newSearchParams = new URLSearchParams(searchParams)
            newSearchParams.set('appointmentId', appointment.id.toString())
            replace(`${pathname}?${newSearchParams.toString()}`);
        } catch (error) {
            console.error("Erreur lors de la création du rendez-vous :", error);
            toast.error("Une erreur est survenue lors de la création du rendez-vous.");
        }
    }

    const columns = useMemo<ColumnDef<MondayAppointment>[]>(() => [
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => {
                return <span>{format(row.original.date, 'dd/MM/yyyy')}</span>
            }
        },
        {
            accessorKey: "company",
            header: "Entreprise",
            cell: ({ row }) => {
                return <span>{row.original.company.name}</span>
            }
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return <Button onClick={() => {
                    const newSearchParams = new URLSearchParams(searchParams)
                    newSearchParams.set('appointmentId', row.original.id.toString())
                    replace(`${pathname}?${newSearchParams.toString()}`);
                }}>                    Voir
                </Button>
            }
        }
    ], [searchParams, pathname, replace])
    return (
        <div>
            <Card>
                <CardHeader className="flex-row justify-between items-center ">
                    <CardTitle>Liste des rendez-vous</CardTitle>
                    <Button onClick={handleCreateAppointmentClick}>
                        <PlusIcon /> Créer un rendez-vous
                    </Button>
                </CardHeader>
                <CardContent>
                    <TableWithHeader columns={columns} data={appointments} />
                </CardContent>
            </Card>
        </div>
    )
}
