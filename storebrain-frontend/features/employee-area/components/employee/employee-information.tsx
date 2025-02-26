import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlarmCheck, AlarmClock, Briefcase, CalendarDays, Clock7, Hourglass, IdCard, Layers, Send } from "lucide-react"
import { StatusBadge } from "../status-badge"


type EmployeeInformationProps = {
    employee: Employee
}

export const EmployeeInformation = ({ employee }: EmployeeInformationProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Information:</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-5">
                    <li
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2.5">
                            <Layers className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Statut:</span>
                        </div>
                        <StatusBadge status={employee.status}/>

                    </li>
                    <li
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2.5">
                            <CalendarDays className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Date d'entrée:</span>
                        </div>
                        <span className="text-sm text-default-700">{new Date(employee.entryDate).toLocaleDateString()}</span>

                    </li>
                    <li
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2.5">
                            <Hourglass className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Fin de période d'essai:</span>
                        </div>
                        <span className="text-sm text-default-700">-</span>

                    </li>
                    <li
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2.5">
                            <Briefcase className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Emploi:</span>
                        </div>
                        <span className="text-sm text-default-700">{employee.job.name}</span>

                    </li>
                    <li
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2.5">
                            <Clock7 className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Contrat:</span>
                        </div>
                        <span className="text-sm text-default-700">{employee.contract.type} ({employee.contract.workingHoursPerWeek}h)</span>

                    </li>
                    <li
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2.5">
                            <Send className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Zone:</span>
                        </div>
                        <span className="text-sm text-default-700">{employee.zone}</span>

                    </li>
                    <li
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2.5">
                        
                            <IdCard className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Badge:</span>
                        </div>
                        <span className="text-sm text-default-700">{employee.badge}</span>

                    </li>
                    <li
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2.5">
                        
                            <AlarmClock className="text-primary-500" />
                            <span className="text-sm font-medium text-default-900">Date de fin:</span>
                        </div>
                        <span className="text-sm text-default-700">-</span>

                    </li>
                </ul>
            </CardContent>
        </Card>
    )
}