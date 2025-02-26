"use client"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmployeeActivateDialog } from "./employee-activate-dialog";
import { startEmployeeJobOnboarding } from "../../actions";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

type EmployeeActionsProps = {
    id: number;
    status: Status
}
export const EmployeeActions = ({ id, status }: EmployeeActionsProps) => {
    const router = useRouter()
    const pathname = usePathname()
    if (status === 'PENDING') return (
        <Alert color="warning" className="mb-5">
            <AlertDescription>Le salarié n'est pas encore activé.</AlertDescription>
            <EmployeeActivateDialog id={id} />
        </Alert>
    )
    else if (status === 'PENDING_ONBOARDING') return (
        <Alert color="warning" className="mb-5">
            <AlertDescription>L'intégration pour cet emploi est disponible.</AlertDescription>
            <Button onClick={async () => {
                await startEmployeeJobOnboarding(id)
                router.replace(`${pathname}?tab=onboarding`)
            }}
            >
                Démarrer l'intégration
            </Button>
        </Alert>
    )
    return null;
}