"use client"

import { ReactNode, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { checkCredentials } from "@/action/actions"
import { Alert } from "./ui/alert"

const formSchema = z.object({
  username: z.string().min(1, {
    message: "Le nom d'utilisateur est requis",
  }),
  password: z.string().min(4, {
    message: "Le mot de passe doit contenir au moins 4caractères",
  }),
})

type LoginDialogProps = {
    title: string,
    userId: number,
    open?: boolean,
    setOpen?: (open: boolean) => void,
    onSuccess: () => void
    withTrigger?: ReactNode
}

export default function LoginDialog( {title, userId, open, setOpen, onSuccess, withTrigger}: LoginDialogProps ) {
  const [error, setError] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(open)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(false)
    try {
         await checkCredentials(userId, values)    
         onSuccess()
    } catch (error) {
        setError(true)
    }
    // setOpen(false)
  }

  useEffect(() => setDialogOpen(open),[open])
  useEffect(() => setOpen?.(dialogOpen),[dialogOpen])
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {withTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Entrez vos identifiants pour signer.
          </DialogDescription>
        </DialogHeader>
        {error && <Alert variant={"soft"} color="destructive">Identifiant ou mot de passe incorrect</Alert>}   
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code vendeur</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez votre nom d'utilisateur" {...field} />
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
                    <Input type="password" placeholder="Entrez votre mot de passe" {...field} />
                  </FormControl>                  
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Signer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}