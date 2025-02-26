"use client";
import { DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
    realizedLabel: z.number({coerce: true}).min(0),
});

export const ClosingDayCloseDialog = ({ closingDayId }: { closingDayId: number }) => {
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setOpen(false);
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Clôturer</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Clôturer la journée</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Êtes-vous sûr de vouloir clôturer la journée ?
                </DialogDescription>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="realizedLabel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Etiquetages réalisés</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <Button type="submit">Clôturer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}