import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { contractSchema, jobSchema } from "./dialog-add-job"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { z } from 'zod'
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DialogAddJobContract } from "./dialog-add-job-contract"
import { Icon } from "@iconify/react"
import { editJob } from "../employee-area-action"
type Props = {
    job: z.infer<typeof jobSchema>
}

export const DialogEditJob = ({ job }: Props) => {
    const [open, setOpen] = useState(false)
    const form = useForm<z.infer<typeof jobSchema>>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            name: job.name,
            qualification: job.qualification,
            contracts: job.jobContracts.map(contract => contract)
        }
    })
    const fieldForm = useFieldArray<z.infer<typeof contractSchema>>({
        control: form.control,
        name: 'contracts'
    })

    const onSubmit = async (values: z.infer<typeof jobSchema>) => {
        await editJob(job.id,values)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="p-0 h-auto hover:bg-transparent bg-transparent text-primary hover:text-primary/80  hover:underline">
                    Modifier
                </Button>
            </DialogTrigger>
            <DialogContent size='lg'>
                <DialogHeader>
                    <DialogTitle>Modifier un emploi</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Entrer le nom de l'emploi"
                                            {...field}
                                            className={cn("", {
                                                "border-destructive focus:border-destructive":
                                                    form.formState.errors.name,
                                            })} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="qualification"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Qualification</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            className="flex flex-row gap-6"
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <RadioGroupItem value="employee" >Employé ou ouvrier</RadioGroupItem>
                                            <RadioGroupItem value="supervisor" >Agent de maîtrise ou technicien</RadioGroupItem>
                                            <RadioGroupItem value="executive">Cadre</RadioGroupItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div>
                            <Label className="mb-2">
                                Contrats
                            </Label>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Contract</TableHead>
                                        <TableHead>Nb heure</TableHead>
                                        <TableHead>durée periode essai</TableHead>
                                        <TableHead><DialogAddJobContract append={fieldForm.append} /></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                {fieldForm.fields.map((field, index) => {
                                            return (
                                                <TableRow key={field.id}>
                                                    <TableCell>{field.type}</TableCell>
                                                    <TableCell>{field.workingHoursPerWeek}</TableCell>
                                                    <TableCell>{field.lengthOfTrialPeriod}J</TableCell>
                                                    <TableCell><Button size="icon" color="destructive" onClick={() => fieldForm.remove(index)}><Icon icon="heroicons:trash-20-solid" className=" h-6 w-6 " /></Button></TableCell>
                                                </TableRow>
                                            )
                                        })}
                                </TableBody>
                            </Table>
                        </div>
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