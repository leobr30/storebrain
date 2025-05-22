import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RequiredAsterisk } from "@/components/required-asterisk";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createVacation, updateVacation } from "./employee-vacances-action";

const formSchema = z.object({
    startAt: z.date({ required_error: "La date de début est obligatoire" }),
    endAt: z.date({ required_error: "La date de fin est obligatoire" })
}).refine((data) => data.endAt > data.startAt, {
    message: "La date de fin doit être après la date de début",
    path: ["endAt"]
});

type EmployeeVacationDetailProps = {
    employeeId: number;
    vacation?: Absence; // ✅ On passe une vacation existante si on met à jour
    trigger: React.ReactNode;
    onVacationUpdated?: (vacation: Absence) => void; // ✅ Callback pour mise à jour
};

export const EmployeeVacationDetail = ({ employeeId, vacation, trigger, onVacationUpdated }: EmployeeVacationDetailProps) => {
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startAt: vacation ? new Date(vacation.startAt) : new Date(),
            endAt: vacation ? new Date(vacation.endAt) : new Date(),
        }
    });

    useEffect(() => {
        if (vacation) {
            form.reset({
                startAt: new Date(vacation.startAt),
                endAt: new Date(vacation.endAt),
            });
        }
    }, [vacation, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (vacation && vacation.id) { 
            const updatedVacation = await updateVacation(employeeId, vacation.id, values);
            if (updatedVacation && onVacationUpdated) {
                onVacationUpdated(updatedVacation);
            }
        } else {
            const newVacation = await createVacation(employeeId, values);
            if (newVacation && onVacationUpdated) {
                onVacationUpdated(newVacation);
            }
        }
        setOpen(false);
    };
    

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent size="lg">
                <DialogTitle>{vacation ? "Modifier la demande" : "Demande de Vacances"}</DialogTitle>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="col-span-1">
                                <FormField
                                    control={form.control}
                                    name="startAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Début des vacances <RequiredAsterisk /></FormLabel>
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
                                    control={form.control}
                                    name="endAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fin des vacances <RequiredAsterisk /></FormLabel>
                                            <FormControl>
                                                <DateTimePicker value={field.value} onChange={field.onChange} granularity="day" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">{vacation ? "Modifier" : "Envoyer la demande"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
