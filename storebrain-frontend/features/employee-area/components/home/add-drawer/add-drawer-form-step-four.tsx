import { useEmployeeAreaAddFormStore } from "@/store/emloyeeAreaDrawerAddStore"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CustomDatePicker } from "@/components/custom-date-picker";
import { RequiredAsterisk } from "@/components/required-asterisk";
import { cn, REQUIRED } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

import Select from "react-select";
import { EmployeeAreaAddStepFourData, Job } from "@/types/employee-area-types";
import { useEffect, useTransition } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ContractSelectProps = {
    form: ReturnType<typeof useForm>;
    jobs: Job[];
};

type Props = {
    handleBack: () => void
    jobs: Job[],
    handleFormSubmit: (formData: FormData) => Promise<{ data: { userId: number } }>;
}


const stepFourSchema = z.object({
    entryDate: z.date({ message: REQUIRED }),
    badgeNumber: z.string(),
    job: z.object({ value: z.number(), label: z.string() }),
    contract: z.object({ value: z.coerce.number(), label: z.string(), type: z.string() }, { message: REQUIRED }),
    endDate: z.date().optional(),
    zone: z.string().min(1, { message: REQUIRED }),
    file: z
        .custom<File>((v) => v instanceof File, {
            message: REQUIRED,
        })
})
    .superRefine((value, ctx) => {
        if (value.contract?.type === 'CDD' && !value.endDate) ctx.addIssue({
            message: REQUIRED,
            code: z.ZodIssueCode.custom,
            path: ['endDate'],
        })
    })


const selectStyles = {
    option: (provided: any, state: any) => ({
        ...provided,
        fontSize: "14px",
    }),
};

const ContractSelect = ({ form, jobs }: ContractSelectProps) => {
    // const [contracts, setContracts] = useState([])

    const allJobs: Job[] = jobs; // passé en props



    const job: Job = useWatch({
        control: form.control,
        name: "job"
    })
    const selectedJob = allJobs.find(j => j.id === job?.value);


    const contract = useWatch({
        control: form.control,
        name: "contract"
    })

    // useEffect(() => {
    //     form.reset('endDate')
    // },[contract])

    useEffect(() => {
        if (job) {
            form.setValue('contract', '')
            form.setValue('endDate', undefined)
            // form.reset('endDate')
        }
    }, [job])
    // useEffect(() => {
    //     form.reset('contract')
    //     form.reset('endDate')
    // }, [job,contract])


    return (
        <>
            <div className="col-span-1">
                <FormField
                    control={form.control}
                    name="contract"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel className="mb-2">Contrat <RequiredAsterisk /></FormLabel>
                            <Select
                                {...field}
                                value={field.value}
                                className="react-select"
                                classNamePrefix="select"
                                options={selectedJob ? selectedJob.jobContracts.map(contract => ({
                                    value: contract.id,
                                    label: `${contract.type} - ${contract.workingHoursPerWeek}H`,
                                    type: contract.type
                                })) : []}

                                isDisabled={job === undefined}
                                placeholder="Choisissez un contrat"
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="col-span-1">
                <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date de fin  {contract?.type === 'CDD' && <RequiredAsterisk />} </FormLabel>
                            <FormControl>
                                <CustomDatePicker
                                    placeholder="Entrez la date de fin"
                                    minDate={new Date()}
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    readonly={contract?.type !== 'CDD'} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            {/* <div className="col-span-1">
                    <FormField
                        control={form.control}
                        name="endOfProbation"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="mb-2">Fin de contrat</FormLabel>
                                <DatePicker
                                    selected={field.value}
                                    customInput={<DatePickerInput />}
                                    {...field} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div> */}

        </>

    )
}

export const AddDrawerFormStepFour = ({ handleBack, jobs, handleFormSubmit }: Props) => {
    const [isPending, startTransition] = useTransition();
    const state = useEmployeeAreaAddFormStore();
    const methods = useForm({
        defaultValues: state.stepFour,
        resolver: zodResolver(stepFourSchema)
    });

    const onSubmit = (values: EmployeeAreaAddStepFourData) => {
        state.setStepFourData(values)
        console.log('STEP1:', state.stepOne)
        console.log('STEP2:', state.stepTwo)
        console.log('STEP3:', state.stepThree)
        console.log('STEP4:', values)
        const formData = new FormData()
        //StepOne
        formData.set('companyId', state.stepOne!.company!.value.toString())
        formData.set('lastName', state.stepOne!.lastName);
        formData.set('firstName', state.stepOne!.firstName);
        formData.set('maidenName', state.stepOne!.maidenName ?? null)
        formData.set('dateOfBirth', state.stepOne!.dateOfBirth!.toISOString())
        formData.set('placeOfBirth', state.stepOne!.placeOfBirth)
        formData.set('nationality', state.stepOne!.nationality)
        formData.set('socialSecurityNumber', state.stepOne!.socialSecurityNumber)
        formData.set('email', state.stepOne!.email)
        formData.set('cellPhone', state.stepOne!.cellPhone)
        formData.set('familySituation', state.stepOne!.familySituation)
        formData.set('numberOfChildren', state.stepOne!.numberOfChildren.toString())
        //StepTwo
        formData.set('address', state.stepTwo!.address)
        formData.set('zipCode', state.stepTwo!.zipCode.toString())
        formData.set('city', state.stepTwo!.city)
        //StepFour
        formData.set('entryDate', values.entryDate!.toISOString())
        formData.set('badgeNumber', values.badgeNumber ?? null)
        formData.set('jobId', values.job!.value!.toString());
        formData.set('contractId', values.contract!.value!.toString())
        formData.set('endDate', values.endDate ? values.endDate!.toISOString() : null)
        formData.set('zone', values.zone)
        formData.append('file', values.file!);
        //StepThree
        formData.append('cni', state.stepThree!.cni!);
        formData.append('carteVitale', state.stepThree!.carteVitale!);
        formData.append('carteMutuelle', state.stepThree!.carteMutuelle!);
        formData.append('rib', state.stepThree!.rib!);
        formData.append('justificatifDomicile', state.stepThree!.justificatifDomicile!);
        formData.append('casierJudiciaire', state.stepThree!.casierJudiciaire!);
        if (state.stepThree!.titreSejour) {
            formData.append('titreSejour', state.stepThree!.titreSejour!);
        }



        startTransition(async () => {
            const response = await handleFormSubmit(formData);

            if (response?.data?.userId) {
                state.setCreatedUserId(response.data.userId);
            } else {
                console.error("❌ Aucune réponse ou ID utilisateur manquant", response);
            }

        });



    }

    return (
        <>
            <Form {...methods}>
                <form
                    onSubmit={methods.handleSubmit(onSubmit)}
                    className="space-y-8">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2 lg:col-span-1">
                            <FormField
                                control={methods.control}
                                name="entryDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date d'entrée <RequiredAsterisk /></FormLabel>
                                        <FormControl>
                                            <CustomDatePicker
                                                placeholder="Entrez la date d'entrée"
                                                minDate={new Date()}
                                                selected={field.value}
                                                onSelect={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                            <FormField
                                control={methods.control}
                                name="badgeNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Numéro de badge </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Entrez le numéro de badge"
                                                {...field}
                                                className={cn("", {
                                                    "border-destructive focus:border-destructive":
                                                        methods.formState.errors.badgeNumber,
                                                })} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2">
                            <FormField
                                control={methods.control}
                                name="job"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Emploi <RequiredAsterisk /></FormLabel>
                                        <FormControl>
                                            <Select
                                                {...field}
                                                classNamePrefix="select"
                                                defaultValue={[]}
                                                options={
                                                    jobs.map(job => ({
                                                        value: job.id,
                                                        label: job.name,
                                                        contracts: job.jobContracts,
                                                    }))
                                                }
                                                styles={selectStyles}
                                                className={cn("react-select", {
                                                    "border-destructive focus:border-destructive":
                                                        methods.formState.errors.job,
                                                })}
                                                onChange={(selectedOption) => {
                                                    methods.setValue("job", selectedOption as any);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                        </div>
                        <ContractSelect form={methods} jobs={jobs} />
                        <div className="col-span-2 lg:col-span-1">
                            <FormField
                                control={methods.control}
                                name="zone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zone</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <RadioGroupItem value="OR" >Or</RadioGroupItem>
                                                <RadioGroupItem value="MODE" >Mode</RadioGroupItem>
                                                <RadioGroupItem value="LABO" >Labo</RadioGroupItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2">
                            <FormField
                                control={methods.control}
                                name="file"
                                render={({ field: { ref, name, onBlur, onChange } }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="mb-2">CV</FormLabel>
                                        <Input
                                            type="file"
                                            ref={ref}
                                            name={name}
                                            onBlur={onBlur}
                                            onChange={(e) => onChange(e.target.files?.[0])}
                                            className={cn("", {
                                                "border-destructive focus:border-destructive":
                                                    methods.formState.errors.file,
                                            })} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button color={"secondary"} onClick={handleBack} >Retour</Button>
                        <Button color="primary">

                            {isPending ? <>
                                <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                                Enregistrement...
                            </> :
                                <>
                                    Valider
                                    <Check className="w-6 h-6 ml-2  " />
                                </>}

                        </Button>
                    </div>
                </form>
            </Form>
        </>
    )
}
