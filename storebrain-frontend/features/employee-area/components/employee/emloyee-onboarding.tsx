// features/employee-area/components/employee/emloyee-onboarding.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "../status-badge";
import { Button } from "@/components/ui/button";
import { refreshResponses, refreshSteps } from "../../actions";
import { TrainingDrawer } from "../training-drawer/training-drawer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DocumentForm from "@/features/employee-area/components/employee/document-form";
import { useState, useEffect } from "react";
import { SheetTrigger } from "@/components/ui/sheet";
import { EmployeeQuizzWrapper } from "./employee-quizz-wrapper";

type EmployeeOnboardingsProps = {
    id: number;
    steps: EmployeeJobOnboarding[];
    onStepUpdated?: (updatedStep: EmployeeJobOnboarding) => void;
    //jobOnboardingId: number | null;
};

export const EmployeeOnboardings = ({ steps, id, onStepUpdated }: EmployeeOnboardingsProps) => {
    const router = useRouter();
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const handleViewTraining = (trainingId: number | undefined) => {
        console.log("🚀 ~ handleViewTraining ~ trainingId:", trainingId);
        if (trainingId === undefined) {
            console.error("trainingId est undefined");
            return;
        }
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('trainingId', trainingId.toString());
        router.push(`${pathName}?${newSearchParams.toString()}`);
    };




    const [localSteps, setLocalSteps] = useState<EmployeeJobOnboarding[]>(steps);
    const [isDocumentOpen, setIsDocumentOpen] = useState(false); // ✅ Nouvelle variable pour le document
    const [isQuizzOpen, setIsQuizzOpen] = useState(false); // ✅ Nouvelle variable pour le quizz


    const handleCreateTraining = async (jobOnboardingStepId: number) => {
        console.log("🚀 ~ handleCreateTraining ~ jobOnboardingStepId:", jobOnboardingStepId);
        const training = await createTrainingWithOnboarding(id, jobOnboardingStepId);
        handleViewTraining(training.id);
    };

    const handleRefreshSteps = async (stepId: number) => {
        console.log("🚀 ~ handleRefreshSteps ~ stepId:", stepId);
        try {
            const updatedSteps = await refreshSteps(id);
            console.log("🚀 ~ handleRefreshSteps ~ updatedSteps:", updatedSteps);
            if (updatedSteps && Array.isArray(updatedSteps)) {
                const updatedStep = updatedSteps.find(step => step.id === stepId);
                console.log("🚀 ~ handleRefreshSteps ~ updatedStep:", updatedStep);
                if (updatedStep) {
                    updateStep(updatedStep); // ✅ Call updateStep with the updated step

                } else {
                    console.log("❌ Aucun updatedStep trouvé pour stepId:", stepId);
                }
            } else {
                console.error("❌ Données reçues invalides :", updatedSteps);

            }
        } catch (error) {
            console.error("❌ Error fetching updated steps:", error);
        }
        console.log("🚀 Fin de handleRefreshSteps");
    };





    const handleTrainingUpdated = () => {
        handleRefreshSteps();
    };


    const updateStep = (updatedStep: EmployeeJobOnboarding) => {
        console.log("🚀 ~ updateStep ~ updatedStep:", updatedStep);
        setLocalSteps((prevSteps) =>
            prevSteps.map((step) => (step.id === updatedStep.id ? updatedStep : step))
        );
        if (onStepUpdated) {
            onStepUpdated(updatedStep);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Intégration</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table wrapperClass="h-[500px] overflow-auto custom-scrollbar">
                        <TableHeader className="bg-default-100 sticky top-0">
                            <TableRow>
                                <TableHead>Date butoir</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Etape</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {localSteps
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .filter((step) => step?.jobOnboardingStep)
                                .map((step, stepIndex) => {
                                    console.log("🚀 ~ .map ~ step:", step);
                                    // Add this line to inspect jobOnboardingStep
                                    console.log("🚀 ~ .map ~ step.jobOnboardingStep:", step.jobOnboardingStep);
                                    return (
                                        <TableRow key={step.id}>
                                            <TableCell>{new Date(step.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{step.jobOnboardingStep.type === "TRAINING" ? "Formation" : step.jobOnboardingStep.type === "QUIZZ" ? "Quizz" : "Document"}</TableCell>
                                            {step.jobOnboardingStep.type === "TRAINING" ? (
                                                <>
                                                    <TableCell>{`RDV N°${step.appointmentNumber} - ${step.jobOnboardingStep.trainingModel?.name}`}</TableCell>
                                                    <TableCell>
                                                        {!step.training ? (
                                                            <Button
                                                                onClick={() => handleCreateTraining(step.id)}
                                                                disabled={
                                                                    !!localSteps.find(
                                                                        (w) =>
                                                                            w.appointmentNumber < step.appointmentNumber &&
                                                                            w.jobOnboardingStep.id === step.jobOnboardingStep.id &&
                                                                            !w.status === "COMPLETED"
                                                                    )
                                                                }
                                                                variant={"ghost"}
                                                            >
                                                                Débuter la formation
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant={"ghost"}
                                                                onClick={() => {
                                                                    if (step.training && step.training.length > 0 && step.training[0].id) {
                                                                        handleViewTraining(step.training[0].id);
                                                                    } else {
                                                                        console.error("Erreur : step.training est vide ou step.training[0].id est undefined", { step });
                                                                    }
                                                                }}
                                                            >
                                                                {step.training && step.training.length > 0 && step.training[0].status === "PENDING" ? "Continuer" : "Voir"} la formation
                                                            </Button>




                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            status={step.status}
                                                            text={
                                                                step.status === "COMPLETED" && step.training
                                                                    ? `${step.training.subjects.filter((w) => w.state === "ACQUIRED").length
                                                                    } / ${step.training.subjects.length}`
                                                                    : ""
                                                            }
                                                        />
                                                    </TableCell>
                                                </>
                                            ) : null}
                                            {step.jobOnboardingStep.type === "RESULT_REVIEW" ? (
                                                <>
                                                    <TableCell>RDV - {step.jobOnboardingStep.jobOnboardingResultReview?.name}</TableCell>
                                                    <TableCell>
                                                        <Button variant={"ghost"}>Faire le point</Button>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={step.status} />
                                                    </TableCell>
                                                </>
                                            ) : null}
                                            {step.jobOnboardingStep.type === "DOCUMENT" ? (
                                                <>
                                                    <TableCell>{step.jobOnboardingStep.jobOnboardingDocuments[0].name}</TableCell>
                                                    <TableCell>
                                                        <DocumentForm
                                                            stepId={step.id}
                                                            setOpen={setIsDocumentOpen} // ✅ Utilisation de setIsDocumentOpen
                                                            open={isDocumentOpen} // ✅ Utilisation de isDocumentOpen
                                                            status={step.status}
                                                            onSubmitSuccess={async (updatedStep) => {
                                                                if (updatedStep) {
                                                                    await handleRefreshSteps(step.id);
                                                                    updateStep(updatedStep);
                                                                }
                                                            }}
                                                            employeeId={id}
                                                            responseId={step.responseId}

                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={step.status} />
                                                    </TableCell>
                                                </>
                                            ) : null}

                                            {step.jobOnboardingStep.type === "QUIZZ" ? (
                                                step.jobOnboardingStep.jobOnboardingQuizz &&
                                                    step.jobOnboardingStep.jobOnboardingQuizz.id &&
                                                    step.jobOnboardingStep.jobOnboardingQuizz.title ? (
                                                    <>
                                                        <TableCell>{step.jobOnboardingStep.jobOnboardingQuizz.title}</TableCell>
                                                        <TableCell>
                                                            <EmployeeQuizzWrapper
                                                                stepId={step.id}
                                                                setOpen={setIsQuizzOpen}
                                                                open={isQuizzOpen}
                                                                status={step.status}
                                                                quizzId={step.jobOnboardingStep.jobOnboardingQuizz.id}
                                                                onSubmitSuccess={async (updatedStep) => {
                                                                    if (updatedStep) {
                                                                        await handleRefreshSteps(step.id);
                                                                        updateStep(updatedStep);
                                                                    }
                                                                }}
                                                                responseId={step.responseId} // ✅ On passe le responseId
                                                            />

                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge status={step.status} />
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell>Quizz non configuré</TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" disabled>
                                                                Indisponible
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge status={step.status} />
                                                        </TableCell>
                                                    </>
                                                )
                                            ) : null}

                                        </TableRow>
                                    )
                                })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
