import { RequiredAsterisk } from "@/components/required-asterisk";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn, REQUIRED } from "@/lib/utils";
import { useEmployeeAreaAddFormStore } from "@/store/emloyeeAreaDrawerAddStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form"
import z from "zod"
import Select from "react-select"
import { Company } from "@/types/company-types";
import { CustomDatePicker } from "@/components/custom-date-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CleaveInput } from "@/components/ui/cleave";
import { EmployeeAreaAddStepOneData } from "@/types/employee-area-types";
const stepOneSchema = z.object({
    company:  z.object({
        value: z.number(),
        label: z.string(),
      },{message:REQUIRED}),
    lastName: z.string().min(1, REQUIRED),
    firstName: z.string().min(1, REQUIRED),
    maidenName: z.string(),
    dateOfBirth: z.date({ message: REQUIRED }),
    placeOfBirth: z.string().min(1, REQUIRED),
    nationality: z.string().min(1,{message:REQUIRED}),
    socialSecurityNumber: z.string().min(1, REQUIRED),
    email: z.string().email({ message: 'Email invalid.' }).min(1, REQUIRED),
    cellPhone: z.string().min(1, REQUIRED),
    familySituation: z.string({ message: REQUIRED }).min(1, REQUIRED),
    numberOfChildren: z.coerce.number({message:REQUIRED}),
})


type Props = {
    companies: Company[],
    handleNext: () => void
}

export default function AddDrawerFormStepOne({ companies, handleNext }: Props) {

    const state = useEmployeeAreaAddFormStore();
    const methods = useForm({
        defaultValues: state.stepOne,
        resolver: zodResolver(stepOneSchema)
    });

    const onSubmit = (values: EmployeeAreaAddStepOneData) => {
        state.setStepOneData(values)
        handleNext()
    }
    
    return (
        <>
            <Form {...methods}>
                <form
                    onSubmit={methods.handleSubmit(onSubmit)}
                    className="space-y-8">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2">
                            <FormField
                                control={methods.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Société <RequiredAsterisk /></FormLabel>
                                        <FormControl>
                                            <Select
                                                {...field}
                                                className="react-select"
                                                classNamePrefix="select"
                                                options={companies.map(company => ({ value: company.id, label: company.name }))}
                                                placeholder="Choisissez une société"
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
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom <RequiredAsterisk /></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Entrez le nom du salarié"
                                                {...field}
                                                className={cn("", {
                                                    "border-destructive focus:border-destructive":
                                                        methods.formState.errors.lastName,
                                                })} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                            <FormField
                                control={methods.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prénom <RequiredAsterisk /></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Entrez le prénom du salarié"
                                                {...field}
                                                className={cn("", {
                                                    "border-destructive focus:border-destructive":
                                                        methods.formState.errors.firstName,
                                                })} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                            <FormField
                                control={methods.control}
                                name="maidenName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom de jeune fille </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Entrez le prénom du salarié"
                                                {...field}
                                                className={cn("", {
                                                    "border-destructive focus:border-destructive":
                                                        methods.formState.errors.maidenName,
                                                })} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                            <FormField
                                control={methods.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date de naissance <RequiredAsterisk /></FormLabel>
                                        <FormControl>
                                            <CustomDatePicker
                                                placeholder="Entrez la date de naissance"
                                                maxDate={new Date()}
                                                selected={field.value}
                                                onSelect={field.onChange} />

                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                            <FormField
                                control={methods.control}
                                name="placeOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lieu de naissance <RequiredAsterisk /></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Entrez le lieu de naissance"
                                                {...field}
                                                className={cn("", {
                                                    "border-destructive focus:border-destructive":
                                                        methods.formState.errors.placeOfBirth,
                                                })} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                            <FormField
                                control={methods.control}
                                name="nationality"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nationalité <RequiredAsterisk /></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Entrez la nationalité"
                                                {...field}
                                                className={cn("", {
                                                    "border-destructive focus:border-destructive":
                                                        methods.formState.errors.nationality,
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
                            name="socialSecurityNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Numéro de Sécurité sociale <RequiredAsterisk/></FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Entrez le numéro de Sécurité sociale "
                                            {...field}
                                            className={cn("", {
                                                "border-destructive focus:border-destructive":
                                                    methods.formState.errors.socialSecurityNumber,
                                            })} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                        <div className="col-span-2 lg:col-span-1">
                            <FormField
                                control={methods.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Adresse mail <RequiredAsterisk /></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Entrez l'email"
                                                {...field}
                                                className={cn("", {
                                                    "border-destructive focus:border-destructive":
                                                        methods.formState.errors.email,
                                                })} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                            <FormField
                                control={methods.control}
                                name="cellPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Numéro de téléphone <RequiredAsterisk /></FormLabel>
                                        <FormControl>
                                            <CleaveInput
                                            {...field}
                                           placeholder="Entrez le numéro de téléphone"
                                           options={{phone: true, phoneRegionCode: 'FR'}}></CleaveInput>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                        <FormField
                            control={methods.control}
                            name="familySituation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Situation familiale <RequiredAsterisk/></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <RadioGroupItem value="SINGLE" >Célibataire</RadioGroupItem>
                                            <RadioGroupItem value="MARRIED" >Marié(e)</RadioGroupItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-2 lg:col-span-1">
                        <FormField
                            control={methods.control}
                            name="numberOfChildren"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre d'enfants <RequiredAsterisk/></FormLabel>
                                    <FormControl>
                                        <Input
                                            type='text'
                                            placeholder="Entrez le nombre d'enfants"
                                            {...field}
                                            className={cn("", {
                                                "border-destructive focus:border-destructive":
                                                    methods.formState.errors.numberOfChildren,
                                            })} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button color={"secondary"} >Annuler</Button>
                        <Button color="primary">
                            Suivant
                            <ArrowRight className="w-6 h-6 ml-2  " />
                        </Button>
                    </div>
                </form>
            </Form>

        </>

    )
}