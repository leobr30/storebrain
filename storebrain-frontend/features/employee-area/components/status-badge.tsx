import { Badge } from "@/components/ui/badge"
import { CalendarClock, Check, Hourglass, LogIn } from "lucide-react"

export const StatusBadge = ({status,text}:{status:Status,text?:string}) => {
    if(status === 'ENABLED') return (<Badge
        variant="soft"
        color={"success"}
        className=" capitalize"
    >    
        Actif
    </Badge>)
    if(status === 'ONBOARDING') return (<Badge
        variant="soft"
        
        className=" capitalize"
    >
        En cours d'integration
    </Badge>)
    if(status === 'PENDING_ONBOARDING') return (<Badge
        variant="soft"
        color={"warning"}
        className=" capitalize"
    >
        En attente d'integration
    </Badge>)
    if (status === 'PENDING') return (<Badge
        variant="soft"
        color={"destructive"}
        className=" capitalize"
    >        
        En attente        
    </Badge>)
    if(status === 'IN_PROGRESS') return (<Badge
        variant="soft"
        color={"warning"}
        className=" capitalize"
    >
        En cours
    </Badge>)
    if(status === 'COMPLETED') return (<Badge
        variant="soft"
        color={"success"}
        className=" capitalize"
    >
        Complété {text ? `- ${text}` : ''}
    </Badge>)
    if(status === 'DRAFT') return (<Badge
        variant="soft"
        color={"secondary"}
        className=" capitalize"
    >
    En brouillon
    </Badge>)
    return status
}