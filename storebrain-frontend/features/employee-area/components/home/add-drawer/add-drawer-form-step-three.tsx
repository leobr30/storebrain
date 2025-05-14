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
import { Company } from "@/types/company-types";
import { CustomDatePicker } from "@/components/custom-date-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CleaveInput } from "@/components/ui/cleave";
import { EmployeeAreaAddStepThreeData } from "@/types/employee-area-types";
import { uploadEmployeeDocuments } from "@/features/employee-area/actions";
const stepThreeSchema = z.object({
    cni: z.custom<File | undefined>().optional(),
    carteVitale: z.custom<File | undefined>().optional(),
    carteMutuelle: z.custom<File | undefined>().optional(),
    rib: z.custom<File | undefined>().optional(),
    justificatifDomicile: z.custom<File | undefined>().optional(),
    casierJudiciaire: z.custom<File | undefined>().optional(),
    titreSejour: z.custom<File>().optional(),
})


type Props = {
    handleNext: () => void,
    handleBack: () => void
}

export default function AddDrawerFormStepThree({ handleNext, handleBack }: Props) {

    const state = useEmployeeAreaAddFormStore();
    const methods = useForm({
        defaultValues: state.stepThree,
        resolver: zodResolver(stepThreeSchema)
    });

    const onSubmit = async (values: EmployeeAreaAddStepThreeData) => {
        state.setStepThreeData(values);
        const formData = new FormData();

        formData.append("cni", values.cni);
        formData.append("carteVitale", values.carteVitale);
        formData.append("carteMutuelle", values.carteMutuelle);
        formData.append("rib", values.rib);
        formData.append("justificatifDomicile", values.justificatifDomicile);
        formData.append("casierJudiciaire", values.casierJudiciaire);
        if (values.titreSejour) formData.append("titreSejour", values.titreSejour);

        handleNext();
    };



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
                                name="cni"
                                render={({ field: { ref, name, onBlur, onChange } }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="mb-2">CNI </FormLabel>
                                        <Input
                                            type="file"
                                            ref={ref}
                                            name={name}
                                            onBlur={onBlur}
                                            onChange={(e) => onChange(e.target.files?.[0])}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2">
                            <FormField
                                control={methods.control}
                                name="carteVitale"
                                render={({ field: { ref, name, onBlur, onChange } }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="mb-2">Carte Vitale </FormLabel>
                                        <Input
                                            type="file"
                                            ref={ref}
                                            name={name}
                                            onBlur={onBlur}
                                            onChange={(e) => onChange(e.target.files?.[0])}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2">
                            <FormField
                                control={methods.control}
                                name="carteMutuelle"
                                render={({ field: { ref, name, onBlur, onChange } }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="mb-2">Carte Mutuelle </FormLabel>
                                        <Input
                                            type="file"
                                            ref={ref}
                                            name={name}
                                            onBlur={onBlur}
                                            onChange={(e) => onChange(e.target.files?.[0])}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2">
                            <FormField
                                control={methods.control}
                                name="rib"
                                render={({ field: { ref, name, onBlur, onChange } }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="mb-2">RIB </FormLabel>
                                        <Input
                                            type="file"
                                            ref={ref}
                                            name={name}
                                            onBlur={onBlur}
                                            onChange={(e) => onChange(e.target.files?.[0])}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2">
                            <FormField
                                control={methods.control}
                                name="justificatifDomicile"
                                render={({ field: { ref, name, onBlur, onChange } }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="mb-2">Justificatif de Domicile </FormLabel>
                                        <Input
                                            type="file"
                                            ref={ref}
                                            name={name}
                                            onBlur={onBlur}
                                            onChange={(e) => onChange(e.target.files?.[0])}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2">
                            <FormField
                                control={methods.control}
                                name="casierJudiciaire"
                                render={({ field: { ref, name, onBlur, onChange } }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="mb-2">Extrait de Casier Judiciaire </FormLabel>
                                        <Input
                                            type="file"
                                            ref={ref}
                                            name={name}
                                            onBlur={onBlur}
                                            onChange={(e) => onChange(e.target.files?.[0])}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2">
                            <FormField
                                control={methods.control}
                                name="titreSejour"
                                render={({ field: { ref, name, onBlur, onChange } }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="mb-2">Titre de Séjour (si applicable)</FormLabel>
                                        <Input
                                            type="file"
                                            ref={ref}
                                            name={name}
                                            onBlur={onBlur}
                                            onChange={(e) => onChange(e.target.files?.[0])}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button color={"secondary"} onClick={handleBack} >Retour</Button>
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