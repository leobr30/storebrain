import { RequiredAsterisk } from "@/components/required-asterisk";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button"
import { DateTimePicker, TimePicker } from "@/components/ui/datetime-picker";
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Control, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AbsenceType } from "../../types";
import { createAbsence, updateAbsence } from "../../actions";
import { cn, REQUIRED } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";




const formSchema = z.object({
    startAt: z.date(),
    type: z.string(),
    endAt: z.date().optional(),
    medicalStartAt: z.date().optional(),
    medicalEndAt: z.date().optional(),
    file: z.custom<File>((v) => v instanceof File, {
        message: REQUIRED,
    }).optional(),
    familyRelationship: z.string().optional(),

}).superRefine((data, ctx) => {
    if (data.type === AbsenceType.DELAY) {
        if (!data.endAt) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: REQUIRED,
            })
        }
    }
})



function AbsenceTypeWatched({ control, withReprise, setWithReprise }: { control: Control<z.infer<typeof formSchema>>, withReprise: boolean, setWithReprise: (value: boolean) => void }) {
    const absenceType = useWatch({
        control,
        name: "type", // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
        defaultValue: undefined, // default value before the render
    })
    if (absenceType) {
        return <>
            {absenceType === AbsenceType.UNJUSTIFIED_ABSENCE ? (
                <div className="col-span-2">
                    <Alert variant={'soft'}>

                        <AlertDescription>
                            Toute absence sans justificatif sera comptabilisée comme une absence injustifiée.
                        </AlertDescription>
                    </Alert>
                </div>
            ) : null}
            {absenceType === AbsenceType.DELAY ? (
                <div className="col-span-2">
                    <FormField
                        control={control}
                        name="endAt"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Arrivée a <RequiredAsterisk /></FormLabel>
                                <FormControl>
                                    <TimePicker date={field.value} onChange={field.onChange} granularity="minute" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            ) : null}
            {absenceType === AbsenceType.MEDICAL ? (
                <>
                    <div className="col-span-2">
                        <FormField
                            control={control}
                            name="file"
                            render={({ field: { ref, name, onBlur, onChange } }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="mb-2">Joindre l'arrêt maladie<RequiredAsterisk /></FormLabel>
                                    <Input
                                        type="file"
                                        ref={ref}
                                        name={name}
                                        onBlur={onBlur}
                                        onChange={(e) => onChange(e.target.files?.[0])}
                                        className={cn("", {
                                            "border-destructive focus:border-destructive":
                                                false,
                                        })} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-1">
                        <FormField
                            control={control}
                            name="medicalStartAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Du<RequiredAsterisk /></FormLabel>
                                    <FormControl>
                                        <DateTimePicker value={field.value} onChange={field.onChange} granularity="day" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-1">
                        <FormField
                            control={control}
                            name="medicalEndAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Au<RequiredAsterisk /></FormLabel>
                                    <FormControl>
                                        <DateTimePicker value={field.value} onChange={field.onChange} granularity="day" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </>

            ) : null}
            {absenceType === AbsenceType.SICK_CHILDREN ? (
                <>
                    <div className="col-span-2">
                        <FormField
                            control={control}
                            name="file"
                            render={({ field: { ref, name, onBlur, onChange } }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="mb-2">Joindre le certificat médical<RequiredAsterisk /></FormLabel>
                                    <Input
                                        type="file"
                                        ref={ref}
                                        name={name}
                                        onBlur={onBlur}
                                        onChange={(e) => onChange(e.target.files?.[0])}
                                        className={cn("", {
                                            "border-destructive focus:border-destructive":
                                                false,
                                        })} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </>
            ) : null}
            {absenceType === AbsenceType.DEATH ? (
                <>
                    <div className="col-span-2">
                        <FormField
                            control={control}
                            name="familyRelationship"
                            render={({ field: { ref, name, onBlur, onChange } }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="mb-2">Lien de parenté<RequiredAsterisk /></FormLabel>
                                    <Input
                                        type="tecxt"
                                        ref={ref}
                                        name={name}
                                        onBlur={onBlur}
                                        onChange={(e) => onChange(e.target.files?.[0])}
                                        className={cn("", {
                                            "border-destructive focus:border-destructive":
                                                false,
                                        })} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-2">
                        <FormField
                            control={control}
                            name="file"
                            render={({ field: { ref, name, onBlur, onChange } }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="mb-2">Joindre le certificat de décès<RequiredAsterisk /></FormLabel>
                                    <Input
                                        type="file"
                                        ref={ref}
                                        name={name}
                                        onBlur={onBlur}
                                        onChange={(e) => onChange(e.target.files?.[0])}
                                        className={cn("", {
                                            "border-destructive focus:border-destructive":
                                                false,
                                        })} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </>
            ) : null}
            {absenceType !== AbsenceType.DELAY ? (
                <>
                    <div className="col-span-2">
                        <Checkbox id="default_1" checked={withReprise} onCheckedChange={() => setWithReprise(!withReprise)}>
                            <Label className="ml-2 font-medium">A repris le {withReprise ? <RequiredAsterisk /> : null} </Label>
                        </Checkbox>
                    </div>
                    {withReprise ? (
                        <>
                            <div className="col-span-2">
                                <FormField
                                    control={control}
                                    name="endAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <DateTimePicker
                                                    value={field.value}
                                                    onChange={(date) => field.onChange(date)}
                                                    granularity="day"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="col-span-2">
                                <FormField
                                    control={control}
                                    name="endAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>A<RequiredAsterisk /></FormLabel>
                                            <FormControl>
                                                <TimePicker date={field.value} onChange={field.onChange} granularity="minute" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </>
                    ) : null}
                </>


            ) : null
            }
        </>
    } else return null
}

type EmployeeAbsenceDetailProps = {
    employeeId: number
    formType: 'create' | 'update'
    trigger: React.ReactNode
    absence?: Absence
}

export const EmployeeAbsenceDetail = ({ employeeId, formType, trigger, absence }: EmployeeAbsenceDetailProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const [withReprise, setWithReprise] = useState<boolean>(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startAt: formType === 'create' ? new Date() : new Date(absence?.startAt),
            type: formType === 'create' ? AbsenceType.UNJUSTIFIED_ABSENCE : absence?.type,
            endAt: formType === 'create' || !absence?.endAt ? new Date() : new Date(absence?.endAt),
        },
    })
    function onSubmit(values: z.infer<typeof formSchema>) {
        if (values.type !== AbsenceType.DELAY && !withReprise) {
            delete values.endAt
        }
        if (formType === 'create') {
            createAbsence(employeeId, values)
        } else {
            updateAbsence(employeeId, absence?.id, values)
        }
        setOpen(false)
    }
    useEffect(() => {

        if (open) {
            form.reset({
                startAt: formType === 'create' ? new Date() : new Date(absence?.startAt),
                type: formType === 'create' ? AbsenceType.UNJUSTIFIED_ABSENCE : absence?.type,
                endAt: formType === 'create' || !absence?.endAt ? new Date() : new Date(absence?.endAt),
            })
        }

    }, [open, absence])
    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent size={'lg'}>
                <DialogTitle>{formType === 'create' ? 'Ajouter une absence' : 'Modifier une absence'}</DialogTitle>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name="startAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Absent depuis le<RequiredAsterisk /></FormLabel>
                                            <FormControl>
                                                <DateTimePicker value={field.value} onChange={field.onChange} granularity="day" />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name="startAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>A<RequiredAsterisk /></FormLabel>
                                            <FormControl>
                                                <TimePicker date={field.value} onChange={field.onChange} granularity="minute" />
                                            </FormControl>
                                            <FormMessage />

                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type d'absence <RequiredAsterisk /></FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Choisir un type d'absence" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={AbsenceType.UNJUSTIFIED_ABSENCE}>Absence injustifiée</SelectItem>
                                                        <SelectItem value={AbsenceType.DELAY}>Retard</SelectItem>
                                                        <SelectItem value={AbsenceType.MEDICAL}>Maladie</SelectItem>
                                                        <SelectItem value={AbsenceType.SICK_CHILDREN}>Enfant malade</SelectItem>
                                                        <SelectItem value={AbsenceType.DEATH}>Décès</SelectItem>
                                                        <SelectItem value={AbsenceType.TRANSPORT_ACCIDENT}>Accident de transport</SelectItem>
                                                        <SelectItem value={AbsenceType.ACCIDENT_AT_WORK}>Accident au travail</SelectItem>                                                        
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <AbsenceTypeWatched control={form.control} withReprise={withReprise} setWithReprise={setWithReprise} />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}