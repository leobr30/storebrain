import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "../status-badge";
import { Button } from "@/components/ui/button";
import { createTrainingWithOnboarding, refreshSteps } from "../../actions";
import { TrainingDrawer } from "../training-drawer/training-drawer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DocumentForm from "@/features/employee-area/components/employee/document-form";
import { useState, useEffect } from "react";
import { SheetTrigger } from "@/components/ui/sheet";

type EmployeeOnboardingsProps = {
    id: number;
    steps: EmployeeJobOnboarding[];
    onStepUpdated?: (updatedStep: EmployeeJobOnboarding) => void;
};

export const EmployeeOnboardings = ({ steps, id, onStepUpdated }: EmployeeOnboardingsProps) => {
    const router = useRouter();
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const [localSteps, setLocalSteps] = useState<EmployeeJobOnboarding[]>(steps);
    const [open, setOpen] = useState(false);

    const handleViewTraining = (trainingId: number) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("trainingId", trainingId.toString());
        router.push(`${pathName}?${newSearchParams.toString()}`);
    };

    const handleCreateTraining = async (jobOnboardingStepId: number) => {
        const training = await createTrainingWithOnboarding(id, jobOnboardingStepId);
        handleViewTraining(training.id);
    };

    // ✅ Use the refreshSteps function from actions.ts
    const handleRefreshSteps = async () => {
        try {
            const updatedSteps = await refreshSteps(id);
            setLocalSteps(updatedSteps);
        } catch (error) {
            console.error("Error fetching updated steps:", error);
        }
    };

    useEffect(() => {
        handleRefreshSteps();
    }, [steps]);

    const handleTrainingUpdated = () => {
        handleRefreshSteps();
    };

    // ✅ New function to update a specific step
    const updateStep = (updatedStep: EmployeeJobOnboarding) => {
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
                                .filter((step) =>
                                    step.jobOnboardingStep.type === "TRAINING"
                                        ? step.appointmentNumber === 1 ||
                                        localSteps.find(
                                            (w) =>
                                                w.jobOnboardingStep.trainingModel?.id === step.jobOnboardingStep.trainingModel?.id &&
                                                w.status === "COMPLETED" &&
                                                w.appointmentNumber < step.appointmentNumber
                                        )
                                        : true
                                )
                                .map((step, stepIndex) => (
                                    <TableRow key={step.id}>
                                        <TableCell>{new Date(step.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{step.jobOnboardingStep.type === "TRAINING" ? "Formation" : "Document"}</TableCell>
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
                                                            onClick={() => handleViewTraining(step.training.id)}
                                                        >
                                                            {step.training.status === "PENDING" ? "Continuer" : "Voir"} la formation
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
                                                        setOpen={setOpen}
                                                        open={open}
                                                        onSubmitSuccess={(updatedStep) => {
                                                            if (updatedStep) {
                                                                updateStep(updatedStep);
                                                                handleRefreshSteps();
                                                            }
                                                        }}
                                                        employeeId={id}
                                                        stepId={step.id}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={step.status} />
                                                </TableCell>
                                            </>
                                        ) : null}
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <TrainingDrawer userId={id} onTrainingUpdated={handleTrainingUpdated} />
        </Card>
    );
};
