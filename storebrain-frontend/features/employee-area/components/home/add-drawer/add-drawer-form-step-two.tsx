import { RequiredAsterisk } from "@/components/required-asterisk";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn, REQUIRED } from "@/lib/utils";
import { useEmployeeAreaAddFormStore } from "@/store/emloyeeAreaDrawerAddStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form"
import z from "zod"
import { Textarea } from "@/components/ui/textarea"
import { EmployeeAreaAddStepTwoData } from "@/types/employee-area-types";
const stepTwoSchema = z.object({
    address: z.string().min(1, REQUIRED),
    zipCode: z.coerce.number({ message: REQUIRED }).min(1, REQUIRED),
    city: z.string().min(1, REQUIRED)
})


type Props = {
   handleBack: () => void
   handleNext: () => void
}

export default function AddDrawerFormStepTwo({ handleBack, handleNext }: Props) {
    const state = useEmployeeAreaAddFormStore();
    const methods = useForm({
        defaultValues: state.stepTwo,
        resolver: zodResolver(stepTwoSchema)
    });

    const onSubmit = (values: EmployeeAreaAddStepTwoData) => {
        state.setStepTwoData(values)
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
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="mb-2">Adresse <RequiredAsterisk/></FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Entrez l'adresse"

                                            className={cn("", {
                                                "border-destructive focus:border-destructive":
                                                methods.formState.errors.address,
                                            })}
                                            {...field}
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
                            name="zipCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Code postal <RequiredAsterisk/></FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Entrez le code postal"
                                            {...field}
                                            className={cn("", {
                                                "border-destructive focus:border-destructive":
                                                methods.formState.errors.zipCode,
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
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ville <RequiredAsterisk/></FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Entrez la ville"
                                            {...field}
                                            className={cn("", {
                                                "border-destructive focus:border-destructive":
                                                methods.formState.errors.city,
                                            })} />
                                    </FormControl>
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