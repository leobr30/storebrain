"use client"
import { Company } from "@/types/company-types"
import { MondayAppointment } from "../../types"
import { CompanySelect } from "../company-select"
import { AppointmentsCard } from "./appointments-card"
import { AppointmentSheet } from "./view/appointment-sheet"
import { OmarDialog } from "./view/omar-dialog"

type MondayAppointmentsViewProps = {
    companies: Company[]
    appointments: MondayAppointment[]
}

const MondayAppointmentsView = ({ companies, appointments }: MondayAppointmentsViewProps) => {
    return (
        <>
        <AppointmentSheet/>        
        <div className="space-y-5">
            <div className="flex items-center flex-wrap justify-between gap-4">
                <div className="text-2xl font-medium text-default-800 ">
                    RDV du lundi
                </div>
                <CompanySelect companies={companies} />
            </div>
            <AppointmentsCard appointments={appointments} />
        </div>
        </>
        
    )
}

export default MondayAppointmentsView