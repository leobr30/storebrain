import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"

import { Dispatch, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { z } from 'zod'
import { Textarea } from "@/components/ui/textarea"
import { integrationAddSubjectSchema, integrationStepSchema } from "./dialog-add-integration"
import { DialogAddIntegrationAddSubject } from "./dialog-add-integration-add-subject"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
export const DialogAddIntegrationAddStep = ({ append }: { append: Dispatch<any> }) => {
    const [open, setOpen] = useState(false)
    const form = useForm<z.infer<typeof integrationStepSchema>>({
        resolver: zodResolver(integrationStepSchema),
        defaultValues: {
            name: '',
        }
    })
    const fieldForm = useFieldArray({
        control: form.control,
        name: 'subjects'
    })

    const onSubmit = (values:any) => {
        append(values)
        setOpen(false)
    }
    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild>
                <Button
                    size="xs"
                    className="cursor-pointer"
                >
                    Ajouter
                </Button>
            </DialogTrigger>
            <DialogContent overlayClass="z-[9999]" >
                <DialogHeader>
                    <DialogTitle>Ajouter une étape</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Entrez le nom de l'étape"
                                            {...field}
                                            className={cn("",
                                                {
                                                    "border-destructive focus:border-destructive": form.formState.errors.name
                                                }
                                            )}
                                        />
                                    </FormControl>
                                </FormItem>

                            )}
                        />
                        <FormField
                            control={form.control}
                            name="day"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>J+</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Entrez le j+"
                                            {...field}
                                            className={cn("", {
                                                "border-destructive focus:border-destructive":
                                                    form.formState.errors.day,
                                            })}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-between space-x-3">
                            <FormLabel>Sujet(s)</FormLabel>
                            <DialogAddIntegrationAddSubject append={fieldForm.append} />
                        </div>
                        <Table>
                            <TableBody>
                                {fieldForm.fields.map((field, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{field.name}</TableCell>
                                        <TableCell><Button type="button" variant="outline" color="destructive" onClick={() => fieldForm.remove(index)}>
                                            Supprimer
                                        </Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <FormField
                            control={form.control}
                            name="tool"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Outils</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Entrez les outils"
                                            {...field}
                                            className={cn("",
                                                {
                                                    "border-destructive focus:border-destructive": form.formState.errors.tool
                                                }
                                            )}
                                        />
                                    </FormControl>
                                </FormItem>

                            )}
                        />
                        <div className="flex justify-end space-x-3">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" color="destructive">
                                    Annuler
                                </Button>
                            </DialogClose>

                            <Button type="submit" color="success">Enregistrer</Button>

                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}