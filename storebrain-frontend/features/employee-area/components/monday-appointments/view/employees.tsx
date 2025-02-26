import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { MondayAppointmentDetail } from "@/features/employee-area/types"
import { cn, formatDate } from "@/lib/utils"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEffect } from "react"
import { debounce } from "lodash"
import LoginDialog from "@/components/login-dialog"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { signMondayAppointmentDetail } from "@/features/employee-area/actions"
import { format } from "date-fns"

const formSchema = z.object({
    remainingDays: z.record(z.string().min(1, "Champ requis").regex(/^\d+$/, "Doit être un nombre").transform(Number))
})

type FormValues = z.infer<typeof formSchema>

type EmployeesProps = {
    details: MondayAppointmentDetail[]
    handleChangeRemainingDays: (onerpId: number, value: string) => void
    appointmentId: number
    handleCreateOmar: (userId: number, appointmentDetailId?: number) => void
    handleSuccesLogin: (id: number) => void
}

export const Employees = ({ details, handleChangeRemainingDays, appointmentId, handleCreateOmar, handleSuccesLogin }: EmployeesProps) => {
    const searchParams = useSearchParams()
    const pathname = usePathname();
    const { replace } = useRouter();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            remainingDays: Object.fromEntries(details.map(d => [d.onerpId.toString(), d.remainingDays.toString()]))
        }
    })

    const remainingDays = useWatch({
        control: form.control,
        name: "remainingDays"
    })

    useEffect(() => {
        const debouncedUpdate = debounce(() => {
            if (form.formState.isValid) {
                Object.entries(remainingDays).forEach(([onerpId, value]) => {
                    console.log('update', onerpId, value)
                    // handleChangeRemainingDays(Number(onerpId), value)
                })
            }
        }, 5000)

        debouncedUpdate()

        return () => debouncedUpdate.cancel()
    }, [remainingDays, handleChangeRemainingDays, form.formState.isValid])



    const handleViewOmar = async (omarId: number) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('omarId', omarId.toString())
        replace(`${pathname}?${newSearchParams.toString()}`)
    }

    

    return (
        <div className="rounded-md border">
            <Table className="text-center">
                <TableHeader className="bg-default-100">
                    <TableRow>
                        <TableHead>Nom & Prénom</TableHead>
                        <TableHead>Objectif</TableHead>
                        <TableHead>Réalisé</TableHead>
                        <TableHead>Restant</TableHead>
                        <TableHead>Jour restant</TableHead>
                        <TableHead>a réaliser par jour</TableHead>
                        <TableHead>OMAR</TableHead>
                        <TableHead>Signature</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {details.sort((a, b) => a.id - b.id).map((detail) => (
                        <TableRow key={detail.id}>
                            <TableCell>{detail.fullname}</TableCell>
                            <TableCell className="border-l border-r">{detail.objective.toLocaleString()} €</TableCell>
                            <TableCell className={cn("border-l border-r", detail.realizedRevenue >= detail.objective ? "text-green-500" : "text-red-500")}>{detail.realizedRevenue.toLocaleString()} €</TableCell>
                            <TableCell className="border-l border-r">{detail.remainingRevenue >= 0 ? detail.remainingRevenue.toLocaleString() : 0} €</TableCell>
                            <TableCell className="border-l border-r">
                                <Input
                                    type="number"
                                    className="w-20"
                                    {...form.register(`remainingDays.${detail.onerpId}`)}
                                />
                                {form.formState.errors.remainingDays?.[detail.onerpId] && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {form.formState.errors.remainingDays[detail.onerpId]?.message}
                                    </p>
                                )}
                            </TableCell>
                            <TableCell className="border-l border-r">{detail.realizedRevenue >= detail.objective ? 0 : Math.round((detail.remainingRevenue) / remainingDays[detail.onerpId] ?? 1).toLocaleString()}€</TableCell>
                            <TableCell className="border-l border-r">
                                {detail.omar ? (
                                    <>                                        
                                        <Button variant={'ghost'} onClick={() => handleViewOmar(detail.omar!.id)}>{detail.omar!.status === 'DRAFT' ? 'Modifier' : 'Ouvrir'}</Button>
                                    </>
                                ) : <Button variant={'ghost'} disabled={!detail.userId} onClick={() => handleCreateOmar(detail.userId!, detail.id)}>Créer</Button>}
                            </TableCell>
                            <TableCell>
                                {!detail.signedAt && detail.omar?.status === "IN_PROGRESS" ? <LoginDialog title={"Signature requise pour " + detail.fullname} userId={detail.userId!} onSuccess={() => handleSuccesLogin(detail.id)} withTrigger={<Button variant={'ghost'} >Signature Requise</Button>} /> : null }
                                {detail.signedAt ? `Signée à ${format(new Date(detail.signedAt), 'HH:mm')}` : null}
                                </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
