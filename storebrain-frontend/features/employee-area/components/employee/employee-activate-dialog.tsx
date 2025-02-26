"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn, REQUIRED } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from 'zod'
import { activateEmployee } from "../../actions"
import { Loader2 } from "lucide-react"
const schema = z.object({
    username: z.string().min(4, REQUIRED),
    password: z.string().min(4, REQUIRED)
})

export const EmployeeActivateDialog = ({ id }: { id: number }) => {
    const [open, setOpen] = useState(false)
    const [loading, startLoadingTransition] = useTransition()
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            username: '',
            password: ''
        }
    })

    const onSubmit = async (data: z.infer<typeof schema>) => {
        await activateEmployee(id, data);
        setOpen(false)
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                >
                    Activer
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Activer le salarié</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Code vendeur</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Entrez le code vendeur"
                                            {...field}
                                            className={cn("", {
                                                "border-destructive focus:border-destructive":
                                                    form.formState.errors.username,
                                            })} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mot de passe</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Entrez le mot de passe"
                                            {...field}
                                            className={cn("", {
                                                "border-destructive focus:border-destructive":
                                                    form.formState.errors.password,
                                            })} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end space-x-3">
                            <DialogClose asChild>
                                <Button type="button" disabled={loading} color='secondary'>
                                    Annuler
                                </Button>
                            </DialogClose>
                            <Button disabled={loading} type="submit" >{loading ? <>
                                <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                                Enregistrement...</> : 'Enregistrer'} </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}