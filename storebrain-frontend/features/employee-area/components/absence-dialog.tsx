"use client"
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getAbsence, updateAbsence } from "../actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Absence, AbsenceType } from "../types"
import { cn, REQUIRED } from "@/lib/utils"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Control, useForm, useWatch
} from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RequiredAsterisk } from "@/components/required-asterisk"
import { DateTimePicker, TimePicker } from "@/components/ui/datetime-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AlertDescription } from "@/components/ui/alert"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"


type AbsenceDialogProps = {
    employeeId: number
}

const formSchema = z.object({
    startAt: z.date(),
    type: z.string(),
    endAt: z.date().optional(),
    sicknessStartDate: z.date().optional(),
    sicknessEndDate: z.date().optional(),
    file: z.custom<File>((v) => v instanceof File, {
        message: REQUIRED,
    }).optional(),
    familyRelationShip: z.string().optional(),
    timeOfAccident: z.date().optional(),
    placeOfAccident: z.string().optional(),
    circumstances: z.string().optional(),
    injuries: z.string().optional(),
    schedule: z.date().optional(),
}).superRefine((data, ctx) => {
    if (data.type === AbsenceType.DELAY) {
        if (!data.endAt) {
            ctx.addIssue({
                path: ['endAt'],
                code: z.ZodIssueCode.custom,
                message: REQUIRED,
            })
        }
    } else if (data.type === AbsenceType.MEDICAL) {
        if (!data.file) {
            ctx.addIssue({
                path: ['file'],
                code: z.ZodIssueCode.custom,
                message: REQUIRED
            })
        }
        if (!data.sicknessStartDate) {
            ctx.addIssue({
                path: ['sicknessEndDate'],
                code: z.ZodIssueCode.invalid_date,
                message: REQUIRED,
            })
        }
        if (!data.sicknessEndDate) {
            ctx.addIssue({
                path: ['sicknessEndDate'],
                code: z.ZodIssueCode.invalid_date,
                message: REQUIRED,

            })
        }
    } else if (data.type === AbsenceType.SICK_CHILDREN) {
        if (!data.file) {
            ctx.addIssue({
                path: ['file'],
                code: z.ZodIssueCode.custom,
                message: REQUIRED
            })
        }
    } else if (data.type === AbsenceType.DEATH) {
        console.log(data)
        if (!data.file) {
            ctx.addIssue({
                path: ['file'],
                code: z.ZodIssueCode.custom,
                message: REQUIRED
            })
        }
        if (!data.familyRelationShip) {
            ctx.addIssue({
                path: ['familyRelationShip'],
                code: z.ZodIssueCode.custom,
                message: REQUIRED
            })
        }
    } else if (data.type === AbsenceType.TRANSPORT_ACCIDENT || data.type === AbsenceType.ACCIDENT_AT_WORK) {
        if (!data.timeOfAccident) {
            ctx.addIssue({ path: ['timeOfAccident'], code: z.ZodIssueCode.custom, message: REQUIRED })
        }
        if (!data.placeOfAccident) {
            ctx.addIssue({ path: ['placeOfAccident'], code: z.ZodIssueCode.custom, message: REQUIRED })
        }
        if (!data.circumstances) {
            ctx.addIssue({ path: ['circumstances'], code: z.ZodIssueCode.custom, message: REQUIRED })
        }
        if (!data.injuries) {
            ctx.addIssue({ path: ['injuries'], code: z.ZodIssueCode.custom, message: REQUIRED })
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
                            name="sicknessStartDate"
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
                            name="sicknessEndDate"
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
                            name="familyRelationShip"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="mb-2">Lien de parenté<RequiredAsterisk /></FormLabel>
                                    <Input
                                        {...field}
                                        type="text"
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
            {absenceType === AbsenceType.TRANSPORT_ACCIDENT || absenceType === AbsenceType.ACCIDENT_AT_WORK ? (
                <>
                    <div className="col-span-1">
                        <FormField
                            control={control}
                            name="timeOfAccident"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Heure de l'accident<RequiredAsterisk /></FormLabel>
                                    <FormControl>
                                        <TimePicker date={field.value} onChange={field.onChange} granularity="minute" />
                                        {/* <DateTimePicker value={field.value} onChange={field.onChange} granularity="day" /> */}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-1">
                        <FormField
                            control={control}
                            name="schedule"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Horaire sur le planning<RequiredAsterisk /></FormLabel>
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
                            control={control}
                            name="placeOfAccident"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lieu de l'accident<RequiredAsterisk /></FormLabel>
                                    <FormControl>
                                        <Input {...field} type="text" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-2">
                        <FormField
                            control={control}
                            name="circumstances"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Circonstances de l'accident<RequiredAsterisk /></FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-2">
                        <FormField
                            control={control}
                            name="injuries"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lésions<RequiredAsterisk /></FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
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
                            <div className="col-span-2 transition ease-in duration-1000">
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

export const AbsenceDialog = ({ employeeId }: AbsenceDialogProps) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [absence, setAbsence] = useState<Absence | null>(null)
    const [withReprise, setWithReprise] = useState<boolean>(false)
    const searchParams = useSearchParams()
    const absenceId = searchParams.get('absenceId')
    const router = useRouter()
    const pathName = usePathname()
    useEffect(() => {
        if (absenceId) {
            setOpen(true)
            fetchAbsence(parseInt(absenceId))
        }
    }, [absenceId])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startAt: new Date(),
            type: AbsenceType.UNJUSTIFIED_ABSENCE,
            endAt: undefined,
            sicknessStartDate: undefined,
            sicknessEndDate: undefined,
            familyRelationShip: '',
            timeOfAccident: undefined,
            schedule: undefined,
            placeOfAccident: '',
            circumstances: '',
            injuries: ''
        },
    })

    console.log('ERROR', form.formState.errors)

    const fetchAbsence = async (id: number) => {
        setLoading(true)
        try {
            const data = await getAbsence(id)
            console.log(data)
            form.reset({
                startAt: new Date(data.startAt),
                type: data.type,
                endAt: data.endAt ? new Date(data.endAt) : undefined,
                sicknessStartDate: data.sicknessStartDate ? new Date(data.sicknessStartDate) : undefined,
                sicknessEndDate: data.sicknessEndDate ? new Date(data.sicknessEndDate) : undefined,
                familyRelationShip: data.familyRelationShip ?? '',
                timeOfAccident: data.timeOfAccident ? new Date(data.timeOfAccident) : undefined,
                schedule: data.schedule ? new Date(data.schedule) : undefined,
                placeOfAccident: data.placeOfAccident ?? '',
                circumstances: data.circumstances ?? '',
                injuries: data.injuries ?? ''
            })
            setAbsence(data)
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'absence:', error)
        } finally {
            setLoading(false)
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()
        formData.append('startAt', values.startAt.toISOString())
        formData.append('type', values.type)
        //
        if (withReprise || values.type === AbsenceType.DELAY) formData.append('endAt', values.endAt?.toISOString() || '')

        if (values.type === AbsenceType.MEDICAL) {
            formData.append('file', values.file || '')
            formData.append('sicknessStartDate', values.sicknessStartDate?.toISOString() || '')
            formData.append('sicknessEndDate', values.sicknessEndDate?.toISOString() || '')
        } else if (values.type === AbsenceType.SICK_CHILDREN) {
            formData.append('file', values.file || '')
        } else if (values.type === AbsenceType.DEATH) {
            formData.append('familyRelationShip', values.familyRelationShip || '')
            formData.append('file', values.file || '')
        } else if (values.type === AbsenceType.ACCIDENT_AT_WORK || values.type === AbsenceType.TRANSPORT_ACCIDENT) {
            formData.append('timeOfAccident', values.timeOfAccident?.toISOString() || '')
            formData.append('schedule', values.schedule?.toISOString() || '')
            formData.append('placeOfAccident', values.placeOfAccident || '')
            formData.append('circumstances', values.circumstances || '')
            formData.append('injuries', values.injuries || '')
        }
        await updateAbsence(absence!.id, formData)
        // setOpen(false)
    }

    const handleClose = () => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('absenceId')
        router.replace(`${pathName}?${newSearchParams.toString()}`  )
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                    </div>
                ) :
                    (
                        <>
                            <DialogTitle>Absence: {absence?.user.name}</DialogTitle>
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
                        </>


                    )}
            </DialogContent>

        </Dialog>
    )
}