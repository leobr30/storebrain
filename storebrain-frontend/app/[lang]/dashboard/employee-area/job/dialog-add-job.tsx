import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createJob } from "../employee-area-action"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from 'zod'
import { Label } from "@/components/ui/label"
import { DialogAddJobContract } from "./dialog-add-job-contract"
import { Icon } from "@iconify/react"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useState, useEffect } from "react"

export const contractSchema = z.object({
    type: z.string(),
    workingHoursPerWeek: z.coerce.number().int(),
    lengthOfTrialPeriod: z.coerce.number().int().min(3)
})

export const jobSchema = z.object({
    name: z.string().min(1, { message: 'Vous devez entrer un nom' }),
    qualification: z.enum(['employee', 'supervisor', 'executive']),
    contracts: contractSchema.array().nonempty()

})

export const DialogAddJob = () => {
    const [open, setOpen] = useState(false)

    const form = useForm<z.infer<typeof jobSchema>>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            name: '',
            qualification: 'employee',
            contracts: []
        }
    })


    const fieldForm = useFieldArray<z.infer<typeof contractSchema>>({
        control: form.control,
        name: 'contracts'
    })

    useEffect(() => {
        if (open) {
            fieldForm.fields.map((field, index) => fieldForm.remove(index))
            form.reset({})
        }

    }, [open])

    const onSubmit = async (values: z.infer<typeof jobSchema>) => {
        await createJob(values)
        setOpen(false)
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
                    <DialogTitle>Ajouter un emploi</DialogTitle>
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
                                                <RadioGroupItem value="employee" id="employee">Employé ou ouvrier </RadioGroupItem>
                                                <RadioGroupItem value="supervisor" id="supervisor">Agent de maîtrise ou technicien </RadioGroupItem>
                                                <RadioGroupItem value="executive" id="executive">Cadre </RadioGroupItem>
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
                                {form.formState.errors.contracts?.type === 'too_small' &&
                                    <Alert color="destructive" variant="soft">
                                        <AlertDescription>
                                            Il faut au moins un contract.
                                        </AlertDescription>
                                    </Alert>}
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
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}