"use client"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmployeeActivateDialog } from "./employee-activate-dialog";
import { startEmployeeJobOnboarding, refreshSteps } from "../../actions";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Status } from "@prisma/client";
import { EmployeeJobOnboarding } from "../types";
type EmployeeActionsProps = {
    id: number;
    status: Status
}
export const EmployeeActions = ({ id, status }: EmployeeActionsProps) => {
    const router = useRouter()
    const pathname = usePathname()
    const handleRefreshSteps = async () => {
        try {
            await refreshSteps(id);
        } catch (error) {
            console.error("Error refreshing steps:", error);
        }
    };
    if (status === 'PENDING') return (
        <Alert color="warning" className="mb-5">
            <AlertDescription>Le salarié n'est pas encore activé.</AlertDescription>
            <EmployeeActivateDialog id={id} onActivateSuccess={handleRefreshSteps} />
        </Alert>
    )
    else if (status === 'PENDING_ONBOARDING') return (
        <Alert color="warning" className="mb-5">
            <AlertDescription>L'intégration pour cet emploi est disponible.</AlertDescription>
            <Button onClick={async () => {
                await startEmployeeJobOnboarding(id)
                await handleRefreshSteps()
                router.replace(`${pathname}?tab=onboarding`)
            }}
            >
                Démarrer l'intégration
            </Button>
        </Alert>
    )
    return null;
}
