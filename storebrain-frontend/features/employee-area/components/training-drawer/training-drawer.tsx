"use client"
import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { closeTraining, deleteTrainingAttachment, getTraining, saveTraining } from "../../actions";

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { X } from "lucide-react"
import { REQUIRED } from "@/lib/utils"
import { AttachmentsDialog } from "./attachments-dialog"
import toast from "react-hot-toast"
import LoginDialog from "@/components/login-dialog"
import { TextareaSkeleton } from "@/components/skeletons/textarea-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { Training, TrainingSubject, TrainingSubjectFile } from "../../types"
import { useSession } from "next-auth/react"
import { HelpCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"





type TrainingDrawerProps = {
    userId: number;
}

const statusOptions = [{ value: 'ACQUIRED', label: 'Acquis' }, { value: 'IN_PROGRESS', label: "En cours d'acquisition" }, { value: 'NOT_ACQUIRED', label: "Non acquis" }]

const subjectEvaluationSchema = z.object({
    subject: z.string(),
    status: z.enum(['ACQUIRED', 'IN_PROGRESS', 'NOT_ACQUIRED']),
    subjectId: z.number(),
    files: z.array(z.object({ fileId: z.number(), fileName: z.string(), createdAt: z.date() }))
})

const formSchema = z.object({
    subjects: z.array(subjectEvaluationSchema),
    comment: z.string().trim().min(1, REQUIRED),
    tool: z.string().trim().min(1, REQUIRED),
    exercise: z.string().trim().min(1, REQUIRED)
})



export const TrainingDrawer = ({ userId }: TrainingDrawerProps) => {
    const { data: session } = useSession()

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [training, setTraining] = useState<Training | undefined>()
    const [loginDialogOpen, setLoginDialogOpen] = useState(false)
    const [selectedSubject, setSelectedSubject] = useState<TrainingSubject | undefined>()
    const router = useRouter()
    const pathName = usePathname()
    const searchParams = useSearchParams()
    const trainingId = searchParams.get('trainingId')

    useEffect(() => {
        if (trainingId) {
            handleOpenChange(true)
        } else {
            setOpen(false)
        }
    }, [trainingId])

    const handleOpenChange = async (open: boolean) => {
        setOpen(open);
        if (open) {
            setLoading(true)
            try {
                const data: Training = await getTraining(parseInt(trainingId!))
                console.log(data)
                setTraining(data)
                console.log(training?.subjects.map(s => ({ id: s.id, name: s.name, aide: s.aide })))

            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }
        } else setTraining(undefined);
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            subjects: [],
            comment: '',
            tool: '',
            exercise: '',
        },
        values: {
            tool: training?.tool ?? '',
            comment: training?.comment ?? '',
            exercise: training?.exercise ?? '',
            subjects: training?.subjects.map(subject => ({ subject: subject.name, status: subject.state, subjectId: subject.id, files: subject.files.map(file => ({ fileId: file.id, fileName: file.fileName, createdAt: file.createdAt })) })) ?? []
        }
    })

    const { fields } = useFieldArray({
        control: form.control,
        name: "subjects",
    })

    const addAttachment = async (file: TrainingSubjectFile) => {
        form.setValue("subjects", form.getValues('subjects').map(subject => subject.subjectId === file.trainingSubjectId ?
            ({ ...subject, files: [...subject.files, { fileId: file.id, fileName: file.fileName, createdAt: file.createdAt }] }) : subject))
        setSelectedSubject({ ...selectedSubject!, files: [...selectedSubject!.files, file] })
        toast.success("Pièce jointe ajoutée")
    }

    const onSubmit = async () => {
        setLoginDialogOpen(true)

    }

    const handleLoginSuccess = async () => {

        await closeTraining(userId, parseInt(trainingId!), {
            comment: form.getValues('comment'),
            tool: form.getValues('tool'),
            exercise: form.getValues('exercise'),
            subjects: form.getValues('subjects').map(subject => ({ subjectId: subject.subjectId, assessment: subject.status }))
        })
        handleCloseTraining()

    }


    const handleCloseTraining = async () => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('trainingId')
        router.push(`${pathName}?${newSearchParams.toString()}`);
    }

    const handleSaveTraining = async () => {
        await saveTraining(userId, parseInt(trainingId!), {
            comment: form.getValues('comment'),
            tool: form.getValues('tool'),
            exercise: form.getValues('exercise'),
            subjects: form.getValues('subjects').map(subject => ({ subjectId: subject.subjectId, assessment: subject.status }))
        })
        toast.success("Formation enregistrée")
        handleCloseTraining()
    }

    const handleFileDelete = async (attachmentId: number) => {
        await deleteTrainingAttachment(parseInt(trainingId!), attachmentId)
        form.setValue("subjects", form.getValues('subjects').map(subject => ({ ...subject, files: subject.files.filter(file => file.fileId !== attachmentId) })))
        setSelectedSubject({ ...selectedSubject!, files: selectedSubject!.files.filter(file => file.id !== attachmentId) })
        toast.success("Pièce jointe supprimée")
    }



    const handleDownloadAttachment = async (attachmentId: number) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/files/trainings/${trainingId}/${attachmentId}`)
        const fileBlob = await response.blob()

        const header = response.headers.get('Content-Disposition');
        const parts = header!.split(';');
        const filename = parts[1].split('=')[1].replaceAll("\"", "");

        var link = document.createElement('a')
        link.href = window.URL.createObjectURL(fileBlob)
        link.download = filename
        link.click()
        link.remove();
    }

    const handleAttachmentsDialogClose = () => {
        setSelectedSubject(undefined)
    }

    const handleUpdateFileName = (fileId: number, newName: string) => {
        form.setValue("subjects", form.getValues('subjects').map(subject => ({ ...subject, files: subject.files.map(file => file.fileId === fileId ? ({ ...file, fileName: newName }) : file) })))
        setSelectedSubject({ ...selectedSubject!, files: selectedSubject!.files.map(file => file.id === fileId ? ({ ...file, fileName: newName }) : file) })
        toast.success("Nom du fichier modifié")
    }

    const [helpText, setHelpText] = useState<string | null>(null);


    return (
        <Sheet open={open} onOpenChange={handleCloseTraining} >
            <SheetContent
                closeIcon={<X className="h-5 w-5 relative" />}
                className="h-[90vh] flex flex-col p-0" side={'bottom'}>
                {loading ? (
                    <>
                        <SheetHeader>
                            <SheetTitle className="p-3 border-b border-default-200"><Skeleton className="h-5 w-40" /></SheetTitle>
                        </SheetHeader>
                        <div className="p-4 grid grid-cols-2 gap-4">
                            <div className="col-span-2"><Skeleton className="h-[300px] w-full" /></div>
                            <div className="col-span-2"><TextareaSkeleton fullWidth /></div>
                            <div className="col-span-1"><TextareaSkeleton fullWidth /></div>
                            <div className="col-span-1"><TextareaSkeleton fullWidth /></div>
                        </div>
                    </>
                ) : (
                    <>
                        <SheetHeader>
                            <SheetTitle className="p-3 border-b border-default-200">Formation: {training?.trainingModel?.name || training?.name} - {training?.user.name}</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="flex-grow p-4">
                            <Form {...form} >
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="col-span-2">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Sujet</TableHead>
                                                        <TableHead>Evaluation</TableHead>
                                                        <TableHead>Pièces jointes</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody className="text-center">
                                                    {fields.map((item, index) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="flex items-center gap-2">
                                                                {item.subject}
                                                                {training?.subjects.find(s => s.id === item.subjectId)?.aide && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        className="p-1 h-auto"
                                                                        onClick={() =>
                                                                            setHelpText(training?.subjects.find(s => s.id === item.subjectId)?.aide ?? null)
                                                                        }
                                                                    >
                                                                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                                                    </Button>
                                                                )}
                                                            </TableCell>

                                                            <TableCell>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`subjects.${index}.status`}
                                                                    render={({ field }) => (
                                                                        <FormItem className="flex justify-center">
                                                                            <FormControl>
                                                                                <RadioGroup
                                                                                    onValueChange={field.onChange}
                                                                                    defaultValue={field.value}
                                                                                    className="flex flex-col space-y-1"
                                                                                    disabled={training?.status !== 'PENDING'}
                                                                                >
                                                                                    {statusOptions.map((option) => (
                                                                                        <div key={option.value} className="flex items-center space-x-2">
                                                                                            <RadioGroupItem

                                                                                                value={option.value} id={`${item.subject}-${option.value}`} />
                                                                                            <Label htmlFor={`${item.subject}-${option.value}`}>{option.label}</Label>
                                                                                        </div>
                                                                                    ))}
                                                                                </RadioGroup>
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col gap-5">
                                                                    {item.files.length === 0 ? <p>Aucune pièce jointe</p> : <p>{item.files.length} pièces jointes</p>}
                                                                    <Button variant={'ghost'} type="button" onClick={() => setSelectedSubject(training?.subjects.find(subject => subject.id === item.subjectId))}>Voir</Button>


                                                                </div>

                                                            </TableCell>
                                                        </TableRow>


                                                    ))}
                                                </TableBody>
                                            </Table>
                                            <Separator />
                                        </div>

                                        <div className="col-span-2">
                                            <FormField
                                                control={form.control}
                                                name="comment"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Commentaire - Autres</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                readOnly={training?.status !== 'PENDING'}
                                                                placeholder="Commentaire..."
                                                                className="resize-none"
                                                                rows={8}
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e)

                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-2 lg:col-span-1">
                                            <FormField
                                                control={form.control}
                                                name="tool"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Outils</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                readOnly={training?.status !== 'PENDING'}
                                                                placeholder="Outils..."
                                                                className="resize-none"
                                                                rows={8}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-2  lg:col-span-1">
                                            <FormField
                                                control={form.control}
                                                name="exercise"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Exercice:</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                readOnly={training?.status !== 'PENDING'}
                                                                placeholder="Exercice..."
                                                                className="resize-none"
                                                                rows={8}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>


                                </form>
                            </Form>
                        </ScrollArea>
                    </>

                )}
                <SheetFooter className="pb-4 pr-4">
                    <SheetClose asChild>
                        <Button color="secondary" >Annuler</Button>
                    </SheetClose>
                    {training?.status === 'PENDING' && <Button variant={'soft'} onClick={handleSaveTraining}>Enregister</Button>}
                    {training?.status === 'PENDING' && <Button onClick={() => setLoginDialogOpen(true)}>Validation</Button>
                    }
                </SheetFooter>
                <LoginDialog title={`Signature requise de ${training?.user.name}`} userId={userId} open={loginDialogOpen} setOpen={setLoginDialogOpen} onSuccess={handleLoginSuccess} />
                <AttachmentsDialog trainingId={parseInt(trainingId!)} status={training?.status} userId={userId} selectedSubject={selectedSubject} addAttachment={addAttachment} onClose={handleAttachmentsDialogClose} onDownload={handleDownloadAttachment} onDelete={handleFileDelete} onUpdateFileName={handleUpdateFileName} />
                <Dialog open={!!helpText} onOpenChange={() => setHelpText(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Aide</DialogTitle>
                            <DialogDescription className="whitespace-pre-wrap">
                                {helpText}
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </SheetContent>
        </Sheet>
    )
} 
