"use client"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmployeeActivateDialog } from "./employee-activate-dialog";
import { startEmployeeJobOnboarding, refreshSteps } from "../../actions";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Status } from "@prisma/client";
import { documentTypeLabels, DocumentType } from "../../types";




type EmployeeActionsProps = {
    id: number;
    status: Status
    hasAllDocuments: boolean;
    missingDocuments: DocumentType[]
}
export const EmployeeActions = ({ id, status, hasAllDocuments, missingDocuments }: EmployeeActionsProps) => {
    const router = useRouter()
    const pathname = usePathname()
    const handleRefreshSteps = async () => {
        try {
            await refreshSteps(id);
        } catch (error) {
            console.error("Error refreshing steps:", error);
        }
    };
    if (status === 'PENDING') {
        return (
            <Alert color="warning" className="mb-5 space-y-3">
                <AlertDescription className="text-sm leading-relaxed space-y-2">
                    {hasAllDocuments ? (
                        "Le salarié n'est pas encore activé."
                    ) : (
                        <>
                            <p className="font-medium">
                                Le salarié ne peut pas être activé.
                            </p>
                            <p className="text-sm">
                                Les documents suivants sont requis :
                            </p>
                            <ul className="list-disc list-inside text-sm text-white inline-block text-left">
                                {missingDocuments.map((docType) => (
                                    <li key={docType}>{documentTypeLabels[docType]}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </AlertDescription>

                {hasAllDocuments && (
                    <div className="flex justify-center">
                        <EmployeeActivateDialog id={id} onActivateSuccess={handleRefreshSteps} />
                    </div>
                )}
            </Alert>
        );
    }



    else if (status === 'PENDING_ONBOARDING') {
        return (
            <Alert color="warning" className="mb-5">
                <AlertDescription>L'intégration pour cet emploi est disponible.</AlertDescription>
                <Button
                    onClick={async () => {
                        await startEmployeeJobOnboarding(id);
                        await handleRefreshSteps();
                        router.replace(`${pathname}?tab=onboarding`);
                    }}
                >
                    Démarrer l'intégration
                </Button>
            </Alert>
        );
    }



    return null;
}
