import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MondayAppointment } from "@/features/employee-area/types"
import { cn } from "@/lib/utils"


type ObjectiveCardProps = {
    appointment: MondayAppointment
}

export const ObjectiveCard = ({ appointment }: ObjectiveCardProps) => {
    return (
        <div>
            <div className="rounded-md border">
            <Table className="text-center">
                <TableHeader className="bg-default-100">
                    <TableRow>
                        <TableHead>Zone</TableHead>
                        <TableHead>Objectif</TableHead>
                        <TableHead>Réalisé</TableHead>
                        <TableHead>Reste à réaliser</TableHead>
                        <TableHead>Jour restant</TableHead>
                        <TableHead>a réaliser par jour</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Magasin</TableCell>
                        <TableCell>{appointment.objective.toLocaleString()} €</TableCell>
                        <TableCell className={cn(appointment.realizedRevenue >= appointment.objective ? "text-green-500" : "text-red-500")}>{appointment.realizedRevenue.toLocaleString()} €</TableCell>
                        <TableCell>{appointment.remainingRevenue >= 0 ? appointment.remainingRevenue.toLocaleString() : 0} €</TableCell>
                        <TableCell>{appointment.remainingDays}</TableCell>
                        <TableCell>{appointment.realizedRevenue >= appointment.objective ? 0 : Math.round((appointment.remainingRevenue) / appointment.remainingDays).toLocaleString()} €</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>OR</TableCell>
                        <TableCell>{appointment.objectiveOr.toLocaleString()} €</TableCell>
                        <TableCell className={cn(appointment.realizedRevenueOr >= appointment.objectiveOr ? "text-green-500" : "text-red-500")}>{appointment.realizedRevenueOr.toLocaleString()} €</TableCell>
                        <TableCell>{appointment.remainingRevenueOr >= 0 ? appointment.remainingRevenueOr.toLocaleString() : 0} €</TableCell>
                        <TableCell>{appointment.remainingDays}</TableCell>
                        <TableCell>{appointment.realizedRevenueOr >= appointment.objectiveOr ? 0 : Math.round((appointment.remainingRevenueOr) / appointment.remainingDays).toLocaleString()} €</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>MODE</TableCell>
                        <TableCell>{appointment.objectiveMode.toLocaleString()} €</TableCell>
                        <TableCell className={cn(appointment.realizedRevenueMode >= appointment.objectiveMode ? "text-green-500" : "text-red-500")}>{appointment.realizedRevenueMode.toLocaleString()} €</TableCell>
                        <TableCell>{appointment.remainingRevenueMode >= 0 ? appointment.remainingRevenueMode.toLocaleString() : 0} €</TableCell>
                        <TableCell>{appointment.remainingDays}</TableCell>
                        <TableCell>{appointment.realizedRevenueMode >= appointment.objectiveMode ? 0 : Math.round((appointment.remainingRevenueMode) / appointment.remainingDays).toLocaleString()}€</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            </div>
            
        </div>
    )
}


