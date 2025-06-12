import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Icon } from "@iconify/react"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { contractSchema } from "./dialog-add-job"



type Props = {
    append:any
}

export const DialogAddJobContract = ({append}:Props) => {

    const [open, setOpen] = useState(false)

    const onSubmit = (values:any) => {
        append(values)
        setOpen(false)
    }
    useEffect(() => {
        if(open) form.reset({})
    },[open])

    const form = useForm({
        resolver: zodResolver(contractSchema),
        defaultValues:{
            type:'',
            workingHoursPerWeek:'',
            lengthOfTrialPeriod:''
        }
    })
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>

                <Button size="icon" className=" rounded-full" >
                    <Icon icon="heroicons:plus-20-solid" className=" h-6 w-6 " />

                </Button>
            </DialogTrigger>
            <DialogContent size='lg'>
                <DialogHeader>
                    <DialogTitle>Ajouter un contrat</DialogTitle>

                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-5 pt-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <RadioGroupItem value="CDD" id="r_2">
                                                CDD
                                            </RadioGroupItem>
                                            <RadioGroupItem value="CDI" id="r_1">
                                                CDI
                                            </RadioGroupItem>

                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage className="bg-destructive/90 text-primary-foreground text-[10px] inline-flex justify-center items-center font-base h-[22px] px-2 rounded-sm " />
                                </FormItem>
                            )}
                        />
                        <div>


                        </div>
                        <FormField
                            control={form.control}
                            name="workingHoursPerWeek"
                            render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre d'heures</FormLabel>
                                        <FormControl>
                                            <Input
                                            type='number'
                                                placeholder="Entrer le nombre d'heures"
                                                {...field}
                                                className={cn("", {
                                                    "border-destructive focus:border-destructive":
                                                        form.formState.errors.workingHoursPerWeek,
                                                })}
                                            />
                                        </FormControl>
                                        <FormMessage className="bg-destructive/90 text-primary-foreground text-[10px] inline-flex justify-center items-center font-base h-[22px] px-2 rounded-sm " />
                                    </FormItem>
                                )}
                        />
                        <FormField
                            control={form.control}
                            name="lengthOfTrialPeriod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Durée periode d'essai</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Entrer la durée de la periode d'essai"
                                            {...field}
                                            className={cn("", {
                                                "border-destructive focus:border-destructive":
                                                    form.formState.errors.lengthOfTrialPeriod,
                                            })}
                                        />
                                    </FormControl>
                                    <FormMessage className="bg-destructive/90 text-primary-foreground text-[10px] inline-flex justify-center items-center font-base h-[22px] px-2 rounded-sm " />
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