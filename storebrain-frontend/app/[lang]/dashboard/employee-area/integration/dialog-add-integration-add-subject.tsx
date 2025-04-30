import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"

import { Dispatch, useState } from "react"
import { useForm } from "react-hook-form"
import { integrationAddSubjectSchema, integrationStepSchema } from "./dialog-add-integration"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { z } from 'zod'
import { Textarea } from "@/components/ui/textarea"
export const DialogAddIntegrationAddSubject = ({append}:{append:Dispatch<any>}) => {
    const [open, setOpen] = useState(false)
    const form = useForm<z.infer<typeof integrationAddSubjectSchema>>({
        resolver: zodResolver(integrationAddSubjectSchema),
        defaultValues: {
            name: '',
        }
    })
    const onSubmit = (values:any) => {
        append(values)
        setOpen(false)
    }
    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild>
                <Button
                    size="xs"
                    className="cursor-pointer"
                >
                    Ajouter
                </Button>
            </DialogTrigger>
            <DialogContent overlayClass="z-[9999]" >
                <DialogHeader>
                    <DialogTitle>Ajouter un suject</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Entrez le sujet"
                                            {...field}
                                            className={cn("",
                                                {
                                                    "border-destructive focus:border-destructive": form.formState.errors.name
                                                }
                                            )}
                                        />
                                    </FormControl>
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