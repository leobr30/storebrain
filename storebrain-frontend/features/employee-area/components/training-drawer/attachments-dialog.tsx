import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn, REQUIRED } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z, ZodType } from "zod";
import { createTrainingAttachment } from "../../actions";
import { useEffect, useState, useTransition } from "react";
import { Download, LoaderCircle, Trash } from "lucide-react";
import { TrainingSubject, TrainingSubjectFile } from "../../types";
import { FileButton } from "../file-button";
import { Separator } from "@/components/ui/separator";
import { TableBody, TableCell, TableHead, TableHeader, Table } from "@/components/ui/table";
import { TableRow } from "@/components/ui/table";
import { AlertDialogAttachment } from "./alert-dialog-attachement";
import { toast } from "sonner";


export type AddAttachmentData = {
    fileName: string;
    file: File
}

const AddAttachmentSchema: ZodType<AddAttachmentData> = z.object({
    fileName: z.string().min(3, REQUIRED),
    file: z.instanceof(File, { message: REQUIRED })
})



type AddAttachmentProps = {
    trainingId: number;
    status: TrainingStatus,
    userId: number;
    addAttachment: (file: TrainingSubjectFile) => void,
    selectedSubject: TrainingSubject | undefined,
    onClose: () => void,
    onDownload: (attachmentId: number) => void,
    onDelete: (attachmentId: number) => void
    onUpdateFileName: (fileId: number, newName: string) => void;
}

export const AttachmentsDialog = ({
    trainingId,
    status,
    userId,
    addAttachment,
    selectedSubject,
    onClose,
    onDownload,
    onDelete,
    onUpdateFileName
}: AddAttachmentProps) => {

    const [open, setOpen] = useState<boolean>(false)
    const [loading, startTransition] = useTransition()

    const form = useForm<AddAttachmentData>({
        resolver: zodResolver(AddAttachmentSchema),
        defaultValues: {
            fileName: '',
            file: undefined
        }
    })

    const onSubmit = async (data: AddAttachmentData) => {
        startTransition(async () => {
            const formData = new FormData()
            formData.set('fileName', data.fileName)
            formData.append('file', data.file)
            const file = await createTrainingAttachment(selectedSubject!.trainingId, selectedSubject!.id, formData)
            addAttachment(file)
            form.reset()
        })

    }

    useEffect(() => {
        if (selectedSubject) {
            setOpen(true)
        } else {
            setOpen(false)
        }
    }, [selectedSubject])




    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent size={'2xl'}>
                <DialogHeader>
                    <DialogTitle>Pièces jointes</DialogTitle>
                </DialogHeader>
                {status === 'PENDING' ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-3 gap-4 py-4">
                                <div className="grid grid-cols-1 items-center gap-4">
                                    <FormField
                                        control={form.control}
                                        name="file"
                                        render={({ field: { ref, name, onBlur, onChange } }) => (
                                            <FormItem>
                                                <FormLabel>Fichier</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        ref={ref}
                                                        name={name}
                                                        onBlur={onBlur}
                                                        onChange={(e) => onChange(e.target.files?.[0])}
                                                        className={cn("", {
                                                            "border-destructive focus:border-destructive":
                                                                form.formState.errors.file,
                                                        })} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 items-center gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fileName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nom du fichier</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className={cn("", {
                                                            "border-destructive focus:border-destructive":
                                                                form.formState.errors.fileName,
                                                        })}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 items-end gap-4">
                                    <Button disabled={loading} type="submit">{loading ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Ajout...</> : "Ajouter"}</Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                ) : null}
                <Separator />
                <div className="flex flex-col gap-5">
                    {selectedSubject?.files.length && selectedSubject.files.length > 0 ? <Table className="text-center">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedSubject.files.map(file => (
                                <TableRow key={file.id}>
                                    <TableCell>
                                        {status === 'PENDING' ? (
                                            <Input
                                                className="font-semibold text-lg"
                                                defaultValue={file.fileName}
                                                onBlur={(e) => onUpdateFileName(file.id, e.target.value)}
                                            />
                                        ) : (
                                            file.fileName
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(file.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-2">
                                            <Button variant={'soft'} color="default" size="icon" onClick={() => onDownload(file.id)}>
                                                <Download />
                                            </Button>
                                            {status === 'PENDING' ? (
                                                <AlertDialogAttachment id={file.id} onDelete={() => {
                                                    onDelete(file.id)
                                                    selectedSubject!.files = selectedSubject!.files.filter(f => f.id !== file.id)
                                                }} />
                                            ) : null}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table> : <p className="text-center">Aucune pièce jointe</p>}
                </div>
            </DialogContent>
        </Dialog>
    )
}
