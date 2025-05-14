import { Card } from "@/components/ui/card";
import { CalendarClock, Check, Hourglass, LogIn, Users } from "lucide-react";

type EmployeeStatsProps = {
    employees: Employee[]
}

export const EmployeesStats = ({
    employees
}:EmployeeStatsProps) => {
    interface StatItem {
        id: number;
        name: string;
        count: string;
        icon: React.ReactNode;
        color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'destructive' | 'default' | 'dark'
    }
    

    const stats: StatItem[] = [
        {
            id: 4,
            name: "En attente",
            count: employees.filter(w => w.status === 'PENDING').length.toString(),
            icon: <Hourglass className="w-6 h-6 text-destructive" />,
            color: 'destructive'
        },
        {
            id: 3,
            name: "En attente d'intégration",
            count: employees.filter(w => w.status === 'PENDING_ONBOARDING').length.toString(),
            icon: <CalendarClock className="w-6 h-6 text-warning" />,
            color: 'warning'
        },
        {
            id: 2,
            name: "En cours d'intégration",
            count: employees.filter(w => w.status === 'ONBOARDING').length.toString(),
            icon: <LogIn className="w-6 h-6 text-primary" />,
            color: 'primary'
        },
        {
            id: 1,
            name: "Actif",
            count: employees.filter(w => w.status ===  'ENABLED').length.toString(),
            icon: <Check className="w-6 h-6 text-success" />,
            color: 'success'
        }
    ]

    return <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
        {stats.map(item => (
            <Card key={item.id} className="rounded-lg p-4 xl:p-2 xl:py-6 2xl:p-6  flex flex-col items-center 2xl:min-w-[168px]">
                <div>
                    <span className={`h-12 w-12 rounded-full flex justify-center items-center bg-${item.color}/10`}>
                        {item.icon}
                    </span>
                </div>
                <div className="mt-4 text-center">
                    <div className="text-base font-medium text-default-600">{item.name}</div>
                    <div className={`text-3xl font-semibold text-${item.color} mt-1`}>{item.count}</div>
                </div>
            </Card>
        ))}
    </div>
}