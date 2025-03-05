import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "../status-badge"
import { Button } from "@/components/ui/button"
import { createTrainingWithOnboarding } from "../../actions"
import { TrainingDrawer } from "../training-drawer/training-drawer"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DocumentForm from "@/features/employee-area/components/employee/document-form";
import { useState } from "react";

type EmployeeOnboardingsProps = {
    id: number,
    steps: EmployeeJobOnboarding[]
}

export const EmployeeOnboardings = ({ steps, id }: EmployeeOnboardingsProps) => {
    const [open, setOpen] = useState(false);

    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()
    const handleViewTraining = (trainingId: number) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('trainingId', trainingId.toString())
        router.push(`${pathName}?${newSearchParams.toString()}`);
    }

    const handleCreateTraining = async (jobOnboardingStepId: number) => {
        const training = await createTrainingWithOnboarding(id, jobOnboardingStepId)
        handleViewTraining(training.id)
    }

    


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
                                <TableHead>
                                    Date butoir
                                </TableHead>
                                <TableHead>
                                    Type
                                </TableHead>
                                <TableHead>
                                    Etape
                                </TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>
                                    Statut
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {steps.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .filter((step) => step.jobOnboardingStep.type === 'TRAINING' ?
                                    (step.appointmentNumber === 1 ||
                                        steps.find((w) => w.jobOnboardingStep.trainingModel?.id === step.jobOnboardingStep.trainingModel?.id && w.status === 'COMPLETED' && w.appointmentNumber < step.appointmentNumber)
                                    ) :
                                    true)
                                .map((step, stepIndex) => (
                                    <TableRow key={step.id}>
                                        <TableCell>{new Date(step.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{step.jobOnboardingStep.type === 'TRAINING' ? 'Formation' : 'Document'}</TableCell>
                                        {step.jobOnboardingStep.type === 'TRAINING' ?
                                            <>
                                                <TableCell>{`RDV N°${step.appointmentNumber} - ${step.jobOnboardingStep.trainingModel?.name}`}</TableCell>
                                                <TableCell>
                                                    {!step.training ? <Button
                                                        onClick={() => handleCreateTraining(step.id)}
                                                        disabled={!!steps.find((w) => w.appointmentNumber < step.appointmentNumber && w.jobOnboardingStep.id === step.jobOnboardingStep.id && !w.status === 'COMPLETED')}
                                                        variant={'ghost'}
                                                    >Débuter la formation</Button>
                                                        : <Button variant={'ghost'} onClick={() => handleViewTraining(step.training.id)}>{step.training.status === 'PENDING' ? 'Continuer' : 'Voir'} la formation</Button>}
                                                </TableCell>
                                                <TableCell><StatusBadge status={step.status} text={
                                                    step.status === 'COMPLETED' && step.training ? `${step.training.subjects.filter((w) => w.state === 'ACQUIRED').length} / ${step.training.subjects.length}` : ''
                                                } /></TableCell>
                                            </>
                                            : null}
                                        {step.jobOnboardingStep.type === 'RESULT_REVIEW' ?
                                            <>
                                                <TableCell>RDV - {step.jobOnboardingStep.jobOnboardingResultReview?.name}</TableCell>
                                                <TableCell><Button variant={'ghost'}>Faire le point</Button></TableCell>
                                                <TableCell><StatusBadge status={step.status} /></TableCell>
                                            </> : null}
                                        {step.jobOnboardingStep.type === "DOCUMENT" ? (
                                            <>
                                                <TableCell>{step.jobOnboardingStep.jobOnboardingDocuments[0].name}</TableCell>
                                                <TableCell>
                                                    <Dialog open={open} onOpenChange={setOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button variant={"ghost"}>Joindre le document</Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-100 w-full">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-2xl font-bold">Remplir le formulaire</DialogTitle>
                                                            </DialogHeader>
                                                            <DocumentForm onClose={() => setOpen(false)} />
                                                        </DialogContent>
                                                    </Dialog>

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
        </Card>
    )
}