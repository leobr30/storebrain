"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn, REQUIRED } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from 'zod'
import { activateEmployee, checkUsernameAvailability } from "../../actions"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDebounce } from 'use-debounce'

const schema = z.object({
    username: z.string().min(4, REQUIRED),
    password: z.string().min(4, REQUIRED)
})

export const EmployeeActivateDialog = ({ id, onActivateSuccess }: {
    id: number,
    onActivateSuccess?: () => void
}) => {
    const [open, setOpen] = useState(false)
    const [loading, startLoadingTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [checkingUsername, setCheckingUsername] = useState(false)
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            username: '',
            password: ''
        }
    })

    const username = form.watch('username')
    const [debouncedUsername] = useDebounce(username, 500)

    // Vérifier la disponibilité du username en temps réel
    useEffect(() => {
        const checkUsername = async () => {
            // Réinitialiser les états si le champ est vide ou trop court
            if (!debouncedUsername || debouncedUsername.length < 4) {
                setUsernameAvailable(null)
                return
            }

            setCheckingUsername(true)

            try {
                const isAvailable = await checkUsernameAvailability(debouncedUsername, id)
                setUsernameAvailable(isAvailable)
            } catch (error) {
                console.error("Erreur lors de la vérification:", error)
                // En cas d'erreur, on ne bloque pas l'utilisateur
                setUsernameAvailable(null)
            } finally {
                setCheckingUsername(false)
            }
        }

        checkUsername()
    }, [debouncedUsername, id])

    const onSubmit = async (data: z.infer<typeof schema>) => {
        setError(null)

        // Vérification finale avant soumission
        if (usernameAvailable === false) {
            setError("Ce code vendeur est déjà utilisé")
            form.setFocus("username")
            return
        }

        startLoadingTransition(async () => {
            try {
                await activateEmployee(id, data)
                setOpen(false)
                form.reset()
                if (onActivateSuccess) {
                    onActivateSuccess()
                }
            } catch (error: any) {
                console.error("Erreur lors de l'activation:", error)

                // Gestion spécifique de l'erreur de username déjà pris
                if (error.message?.includes("déjà utilisé")) {
                    setError(error.message)
                    setUsernameAvailable(false)
                    form.setFocus("username")
                } else {
                    setError("Une erreur est survenue lors de l'activation. Veuillez réessayer.")
                }
            }
        })
    }

    // Réinitialiser l'erreur et les états quand on ferme le dialogue
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            setError(null)
            setUsernameAvailable(null)
            form.reset()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    Activer
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Activer le salarié</DialogTitle>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Code vendeur</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="Entrez le code vendeur"
                                                {...field}
                                                className={cn("pr-10", {
                                                    "border-destructive focus:border-destructive":
                                                        form.formState.errors.username || usernameAvailable === false,
                                                    "border-green-500 focus:border-green-500":
                                                        usernameAvailable === true && field.value.length >= 4,
                                                })}
                                            />
                                            <div className="absolute right-3 top-3">
                                                {checkingUsername && (
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                )}
                                                {!checkingUsername && usernameAvailable === true && field.value.length >= 4 && (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                )}
                                                {!checkingUsername && usernameAvailable === false && (
                                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                                )}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    {!form.formState.errors.username && usernameAvailable === false && (
                                        <p className="text-sm text-destructive mt-1">
                                            Ce code vendeur est déjà utilisé
                                        </p>
                                    )}
                                    {!form.formState.errors.username && usernameAvailable === true && field.value.length >= 4 && (
                                        <p className="text-sm text-green-600 mt-1">
                                            Ce code vendeur est disponible
                                        </p>
                                    )}
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
                                            })}
                                        />
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
                            <Button
                                disabled={loading || usernameAvailable === false || checkingUsername}
                                type="submit"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    'Enregistrer'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}