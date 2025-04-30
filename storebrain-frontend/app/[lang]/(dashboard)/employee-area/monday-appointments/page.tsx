import MondayAppointmentsView from "@/features/employee-area/components/monday-appointments/view"
import { getCompanies } from "../employee-area-action"
import { getAppointments } from "@/features/employee-area/actions"
import { MondayAppointment } from "@/features/employee-area/types"

const MondayAppointmentsPage = async () => {
    const companies: Company[] = await getCompanies()
    const appointments:MondayAppointment[] = await getAppointments()
    return <MondayAppointmentsView companies={companies} appointments={appointments} />
}

export default MondayAppointmentsPage   
