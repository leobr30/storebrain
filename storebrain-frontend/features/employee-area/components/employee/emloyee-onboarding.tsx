
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "../status-badge";
import { Button } from "@/components/ui/button";
import { refreshSteps, createTraining } from "../../actions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DocumentForm from "@/features/employee-area/components/employee/document-form";
import { useState } from "react";
import { EmployeeQuizzWrapper } from "./employee-quizz-wrapper";
import { EmployeeResultReviewWrapper } from "./Employee-Result-Review-Wrapper";
import { EmployeeJobOnboarding } from "../../types";
import { toast } from "sonner";

type EmployeeOnboardingsProps = {
    id: number;
    steps: EmployeeJobOnboarding[];
    onStepUpdated?: (updatedStep: EmployeeJobOnboarding) => void;
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

    const handleCreateTraining = async (stepId: number) => {
        console.log("🚀 ~ handleCreateTraining ~ stepId:", stepId);
        try {
            const step = localSteps.find(s => s.id === stepId);
            if (!step) {
                console.error("❌ Étape non trouvée pour stepId:", stepId);
                return;
            }

            const trainingModelId = step.jobOnboardingStep.trainingModel?.id;
            const trainingName = step.jobOnboardingStep.trainingModel?.name || "Formation";

            await createTraining(
                id, // employeeId
                stepId, // employeeOnboordingId
                trainingModelId,
                `RDV N°${step.appointmentNumber} - ${trainingName}`
            );

            toast.success("Formation créée", {
                description: "La formation a été créée avec succès.",
            });

            await handleRefreshSteps(stepId);
        } catch (error) {
            console.error("❌ Erreur lors de la création de la formation:", error);
            toast.error("Erreur lors de la création de la formation");
        }
    };

    const [localSteps, setLocalSteps] = useState<EmployeeJobOnboarding[]>(steps);
    const [isDocumentOpen, setIsDocumentOpen] = useState(false);
    const [isQuizzOpen, setIsQuizzOpen] = useState(false);
    // ✅ État séparé pour chaque bilan avec son stepId
    const [openReviewStepId, setOpenReviewStepId] = useState<number | null>(null);

    const handleRefreshSteps = async (stepId: number) => {
        console.log("🚀 ~ handleRefreshSteps ~ stepId:", stepId);
        try {
            const updatedSteps = await refreshSteps(id);
            console.log("🚀 ~ handleRefreshSteps ~ updatedSteps:", updatedSteps);
            if (updatedSteps && Array.isArray(updatedSteps)) {
                setLocalSteps(updatedSteps);

                const updatedStep = updatedSteps.find(step => step.id === stepId);
                console.log("🚀 ~ handleRefreshSteps ~ updatedStep:", updatedStep);
                if (updatedStep && onStepUpdated) {
                    onStepUpdated(updatedStep);
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

    const updateStep = (updatedStep: EmployeeJobOnboarding) => {
        console.log("🚀 ~ updateStep ~ updatedStep:", updatedStep);
        setLocalSteps((prevSteps) =>
            prevSteps.map((step) => (step.id === updatedStep.id ? updatedStep : step))
        );
        if (onStepUpdated) {
            onStepUpdated(updatedStep);
        }
    };

    // ✅ Fonction pour déterminer le numéro de RDV basé sur la date
    const getMonthNumber = (stepDate: string, allSteps: EmployeeJobOnboarding[], reviewName: string) => {
        // Filtrer les étapes du même type de bilan
        const sameReviewSteps = allSteps
            .filter(s =>
                s.jobOnboardingStep?.type === "RESULT_REVIEW" &&
                s.jobOnboardingStep?.jobOnboardingResultReview?.name === reviewName
            )
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Trouver l'index de l'étape courante
        const currentIndex = sameReviewSteps.findIndex(s => s.date === stepDate);

        // Retourner le numéro du RDV (1-based)
        return currentIndex + 1;
    };

    const seenQuizzIds = new Set<number>();

    const uniqueSteps = localSteps.filter((step) => {
        if (step.jobOnboardingStep?.type !== "QUIZZ") return true;

        const quizzId = step.jobOnboardingStep?.jobOnboardingQuizz?.id;
        if (!quizzId) return true;

        if (seenQuizzIds.has(quizzId)) {
            return false;
        } else {
            seenQuizzIds.add(quizzId);
            return true;
        }
    });

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
                            {uniqueSteps
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .filter((step) => step?.jobOnboardingStep)
                                .map((step, stepIndex) => {
                                    return (
                                        <TableRow key={step.id}>
                                            <TableCell>{new Date(step.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {step.jobOnboardingStep.type === "TRAINING" ? "Formation" :
                                                    step.jobOnboardingStep.type === "QUIZZ" ? "Quizz" :
                                                        step.jobOnboardingStep.type === "RESULT_REVIEW" ? "Bilan" : "Document"}
                                            </TableCell>

                                            {step.jobOnboardingStep.type === "TRAINING" ? (
                                                <>
                                                    <TableCell>{`RDV N°${step.appointmentNumber} - ${step.jobOnboardingStep.trainingModel?.name}`}</TableCell>
                                                    <TableCell>
                                                        {!step.training || step.training.length === 0 ? (
                                                            <Button
                                                                onClick={() => handleCreateTraining(step.id)}
                                                                disabled={
                                                                    !!localSteps.find(
                                                                        (w) =>
                                                                            w.appointmentNumber < step.appointmentNumber &&
                                                                            w.jobOnboardingStep.id === step.jobOnboardingStep.id &&
                                                                            w.status !== "COMPLETED"
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
                                                                step.status === "COMPLETED" && step.training && step.training[0]?.subjects
                                                                    ? `${step.training[0].subjects.filter((w) => w.state === "ACQUIRED").length} / ${step.training[0].subjects.length}`
                                                                    : ""
                                                            }
                                                        />
                                                    </TableCell>
                                                </>
                                            ) : null}

                                            {step.jobOnboardingStep.type === "RESULT_REVIEW" ? (
                                                <>
                                                    <TableCell>
                                                        {/* ✅ Affichage simplifié avec numéro de RDV */}
                                                        {(() => {
                                                            const reviewName = step.jobOnboardingStep.jobOnboardingResultReview?.name || "Bilan";
                                                            const rdvNumber = getMonthNumber(step.date, localSteps, reviewName);
                                                            return `RDV ${rdvNumber} - ${reviewName}`;
                                                        })()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <EmployeeResultReviewWrapper
                                                            stepId={step.id}
                                                            setOpen={(open) => setOpenReviewStepId(open ? step.id : null)}
                                                            open={openReviewStepId === step.id}
                                                            status={step.status}
                                                            onSubmitSuccess={async (updatedStep) => {
                                                                if (updatedStep) {
                                                                    await handleRefreshSteps(step.id);
                                                                    updateStep(updatedStep);
                                                                } else {
                                                                    await handleRefreshSteps(step.id);
                                                                }
                                                                // ✅ Fermer le modal après succès
                                                                setOpenReviewStepId(null);
                                                            }}
                                                            responseId={step.responseId}
                                                            reviewName={step.jobOnboardingStep.jobOnboardingResultReview?.name || "Bilan"}
                                                            appointmentNumber={getMonthNumber(step.date, localSteps, step.jobOnboardingStep.jobOnboardingResultReview?.name || "Bilan")}
                                                        />
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
                                                            setOpen={setIsDocumentOpen}
                                                            open={isDocumentOpen}
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
                                                                responseId={step.responseId}
                                                                setResponseId={(responseId: string) => {
                                                                    setLocalSteps(prevSteps =>
                                                                        prevSteps.map(s =>
                                                                            s.id === step.id
                                                                                ? { ...s, responseId }
                                                                                : s
                                                                        )
                                                                    );
                                                                }}
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
                                    );
                                })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};