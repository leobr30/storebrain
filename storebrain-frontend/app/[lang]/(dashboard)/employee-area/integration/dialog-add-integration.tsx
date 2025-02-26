import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn, REQUIRED } from "@/lib/utils"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import Select from "react-select"
import { createIntegration } from "../employee-area-action"
import { DialogAddIntegrationAddStep } from "./dialog-add-integration-add-step"
import { zodResolver } from "@hookform/resolvers/zod"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Job } from "@/types/employee-area-types"



export const integrationAddSubjectSchema = z.object({
    name:z.string().min(1,{message:REQUIRED})
})

export const integrationStepSchema = z.object({
    day: z.coerce.number({ message: REQUIRED }),
    name: z.string().min(1, { message: REQUIRED }),
    subjects: integrationAddSubjectSchema.array().nonempty(REQUIRED),
    tool: z.string().min(1, { message: REQUIRED })
})



export const integrationAddSchema = z.object({
    job: z.object({ value: z.coerce.number(), label: z.string() }),
    steps: integrationStepSchema.array().nonempty()
})



export const DialogAddIntegration = ({
    jobs
}:{jobs:Job[]}) => {
    const [open, setOpen] = useState(false)

    const form = useForm<z.infer<typeof integrationAddSchema>>({
        resolver: zodResolver(integrationAddSchema)
    })

    const fieldForm = useFieldArray({
        control: form.control,
        name: 'steps'
    })

    const onSubmit = async (values:any) => {
        await createIntegration(values)
        setOpen(false);
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                >
                    Ajouter
                </Button>
            </DialogTrigger>
            <DialogContent size='lg'>
                <DialogHeader>
                    <DialogTitle>Ajouter une intégration</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <div className="space-y-8">
                        <FormField
                            control={form.control}
                            name="job"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Emploi</FormLabel>
                                    <Select
                                        {...field}
                                        className="react-select"
                                        classNamePrefix="select"
                                        options={jobs.map(job => ({ value: job.id, label: job.name }))}
                                        placeholder="Choisissez un emploi"
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <hr className="-mx-6" />
                        <div className="flex justify-between space-x-3">
                            <p className="text-xl">Etapes</p>
                            <DialogAddIntegrationAddStep append={fieldForm.append} />
                        </div>
                        <Accordion type="single" collapsible className="w-full space-y-3.5">
                            {fieldForm.fields.map((field, index) => (
                                <AccordionItem value={index.toString()}>
                                    <AccordionTrigger>
                                        <div className="flex flex-col text-start">
                                            <div>J+{field.day} - {field.name}</div>
                                            <div className=" text-xs  text-default-600  mt-1">
                                                Appuyer pour agrandir
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-5">
                                        <div className="text-sm text-default-600">Sujet:</div>
                                        {/* <div className="mb-1">{field.subjects.map(subject => subject.name).join(', ')}</div> */}
                                        <div className="text-sm text-default-600">Outils:</div>
                                        <div className="mb-1">{field.tool}</div>
                                        <div className="flex justify-end pt-5 space-x-3">
                                            <Button type="button" variant="outline" color="destructive" onClick={() => fieldForm.remove(index)}>
                                                Supprimer
                                            </Button>
                                            <Button>Modifier</Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                        <div className="flex justify-end space-x-3">

                        <DialogClose asChild>
                                <Button type="button" variant="outline" color="destructive">
                                    Annuler
                                </Button>
                            </DialogClose>
                            <Button
                                
                                color="success"
                                className="cursor-pointer"
                                onClick={form.handleSubmit(onSubmit)}
                            >
                                Enregistrer
                            </Button>

                        </div>
                    </div>
                </Form>
            </DialogContent>
        </Dialog>
    )
}