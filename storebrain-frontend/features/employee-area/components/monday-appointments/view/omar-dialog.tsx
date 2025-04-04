import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { getOmar, saveOmar, validateOmar } from "@/features/employee-area/actions"
import { useRouter, useSearchParams } from "next/navigation"
import { TextareaSkeleton } from "@/components/skeletons/textarea-skeleton"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Omar } from "@/features/employee-area/types"
import toast from "react-hot-toast"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { RequiredAsterisk } from "@/components/required-asterisk"
import { REQUIRED } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { InputSkeleton } from "@/components/skeletons/input-skeleton"
import { addDays } from "date-fns"

const omarFormSchema = z.object({
  observation: z.string().min(1, "Champ requis"),
  objective: z.string().min(1, "Champ requis"),
  tool: z.string().min(1, "Champ requis"),
  action: z.string().min(1, "Champ requis"),
  dueDate: z.date({ message: REQUIRED }),
  nextAppointment: z.date({ message: REQUIRED }),
})

type OmarFormValues = z.infer<typeof omarFormSchema>

type OmarDialogProps = {
  onOmarValidate?: (omar: Omar) => void
}

export const OmarDialog = ({ onOmarValidate }: OmarDialogProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const omarId = searchParams.get("omarId")
  const [isOpen, setIsOpen] = useState(false)
  const [omar, setOmar] = useState<Omar | null>(null)
  const form = useForm<OmarFormValues>({
    resolver: zodResolver(omarFormSchema),
    defaultValues: {
      observation: "",
      objective: "",
      tool: "",
      action: "",
      // result: "",
      dueDate: addDays(new Date(), 5),
      nextAppointment: undefined,
    },
  })

  useEffect(() => {
    if (omarId) {
      setIsOpen(true)
      loadOmar(omarId)
    } else {
      setIsOpen(false)
      form.reset({})
    }
  }, [omarId, form])

  const loadOmar = async (id: string) => {
    setIsLoading(true)
    try {
      let omarData = await getOmar(id)
      omarData.dueDate = omarData.dueDate ? new Date(omarData.dueDate) : undefined
      omarData.nextAppointment = omarData.nextAppointment ? new Date(omarData.nextAppointment) : undefined
      setOmar(omarData)
      form.reset(omarData)
    } catch (error) {
      toast.error("Erreur lors du chargement de l'OMAR")
      handleClose()
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: OmarFormValues) => {
    if (omarId) {
      try {
        const omar = await validateOmar(omarId, {
          objective: form.getValues("objective"),
          tool: form.getValues("tool"),
          action: form.getValues("action"),
          observation: form.getValues("observation"),
          dueDate: form.getValues("dueDate"),
          nextAppointment: form.getValues("nextAppointment"),
        })
        if (onOmarValidate) {
          onOmarValidate(omar!)
        }
        handleClose()
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'OMAR:", error)
      }
    }
  }

  const handleClose = () => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.delete("omarId")
    router.replace(`${window.location.pathname}?${newSearchParams.toString()}`);
  }

  const handleSaveOmar = async () => {
    try {
      await saveOmar(omar!.id, {
        objective: form.getValues("objective"),
        tool: form.getValues("tool"),
        action: form.getValues("action"),
        observation: form.getValues("observation"),
        dueDate: form.getValues("dueDate"),
        nextAppointment: form.getValues("nextAppointment")
      })
      toast.success("OMAR enregistré")
      handleClose()
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de l'OMAR")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} >
      <DialogContent size="5xl" className="p-0">
        <DialogHeader className="p-3 border-b border-default-200">
          <DialogTitle>Omar de {omar?.user.name}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          // <div className="flex flex-col gap-4 justify-center items-center h-64">
          <div className="p-4 grid grid-cols-3 gap-4">
            <div className="col-span-3"><InputSkeleton /></div>
            <div className="col-span-3 lg:col-span-1"><TextareaSkeleton /></div>
            <div className="col-span-3 lg:col-span-1"><TextareaSkeleton /></div>
            <div className="col-span-3 lg:col-span-1"><TextareaSkeleton /></div>
            <div className="col-span-3"><InputSkeleton /></div>
          </div>
        ) : (
          <>

            <ScrollArea className="max-h-[80vh]">
              <div className="p-5">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={'observation'}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Constat - Evaluation<RequiredAsterisk /></FormLabel>
                              <FormControl>
                                <Input placeholder={`Entrez le constat`} {...field} readOnly={omar?.status !== "DRAFT"} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-3 lg:col-span-1">
                        <FormField
                          control={form.control}
                          name={'objective'}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Objectif<RequiredAsterisk /></FormLabel>
                              <FormControl>
                                <Textarea placeholder={`Entrez l'objectif`} {...field} readOnly={omar?.status !== "DRAFT"} rows={10} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-3 lg:col-span-1">
                        <FormField
                          control={form.control}
                          name={'tool'}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Moyens<RequiredAsterisk /></FormLabel>
                              <FormControl>
                                <Textarea placeholder={`Entrez les moyens`} {...field} readOnly={omar?.status !== "DRAFT"} rows={10} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-3 lg:col-span-1">
                        <FormField
                          control={form.control}
                          name={'action'}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Actions<RequiredAsterisk /></FormLabel>
                              <FormControl>
                                <Textarea placeholder={`Entrez les actions`} {...field} readOnly={omar?.status !== "DRAFT"} rows={10} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name="nextAppointment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prochain rendez-vous<RequiredAsterisk /></FormLabel>
                              <FormControl>
                                <DateTimePicker disabled={omar?.status !== "DRAFT"} value={field.value} onChange={field.onChange} granularity="day" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Echéance<RequiredAsterisk /></FormLabel>
                              <FormControl>
                                <DateTimePicker disabled value={field.value} onChange={field.onChange} granularity="day" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name={'result'}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Résultat</FormLabel>
                            <FormControl>
                              <Textarea placeholder={`Entrez les résultats`} {...field} rows={10} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div> */}
                    </div>
                    {omar?.status === "DRAFT" && <DialogFooter>
                      <Button type="button" variant={'soft'} onClick={() => handleSaveOmar()}>Enregistrer</Button>
                      <Button type="submit">Valider</Button>
                    </DialogFooter>}
                  </form>
                </Form>
              </div>
            </ScrollArea>


          </>

        )}
      </DialogContent>
    </Dialog>
  )
}
