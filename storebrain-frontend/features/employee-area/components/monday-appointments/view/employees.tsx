import { Input } from "@/components/ui/input";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { MondayAppointmentDetail, MondayAppointment } from "@/features/employee-area/types";
import { cn, formatDate } from "@/lib/utils";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { debounce } from "lodash";
import LoginDialog from "@/components/login-dialog";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    signMondayAppointmentDetail,
    updateMondayAppointmentDetail,
    getAppointment
} from "@/features/employee-area/actions";
import { format } from "date-fns";
import toast from "react-hot-toast";

// Importez vos fonctions de génération de PDF et d'envoi d'e-mail ici
// import { generatePdf } from "./pdf-generator"; // Exemple
// import { sendEmail } from "./email-sender"; // Exemple

const formSchema = z.object({
    remainingDays: z.record(
        z
            .string()
            .min(1, "Champ requis")
            .regex(/^\d+$/, "Doit être un nombre")
            .transform(Number)
    ),
});

type FormValues = z.infer<typeof formSchema>;

type EmployeesProps = {
    details: MondayAppointmentDetail[];
    handleChangeRemainingDays: (id: number, value: number) => void;
    appointmentId: number;
    handleCreateOmar: (userId: number, appointmentDetailId?: number) => void;
    handleSuccesLogin: (id: number, userId: number) => void;
    onGeneratePdfAndSendEmail: (appointment: MondayAppointment, details: MondayAppointmentDetail[]) => Promise<void>;
};

export const Employees = ({
    details,
    handleChangeRemainingDays,
    appointmentId,
    handleCreateOmar,
    handleSuccesLogin,
    onGeneratePdfAndSendEmail
}: EmployeesProps) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);
    const [appointment, setAppointment] = useState<MondayAppointment>()
    const validDetails = details.filter((d) => d.id !== undefined);
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            remainingDays: Object.fromEntries(
                validDetails.map((d) => [d.id.toString(), d.remainingDays.toString()])
            ),
        },
    });

    const remainingDays = useWatch({
        control: form.control,
        name: "remainingDays",
    });

    useEffect(() => {
        const debouncedUpdate = debounce(async () => {
            if (form.formState.isValid) {
                setIsUpdating(true);
                const promises = Object.entries(remainingDays).map(
                    async ([id, value]) => {
                        try {
                            console.log("Data sent to server:", { id, value });
                            await updateMondayAppointmentDetail(Number(id), value.toString());
                        } catch (error: any) {
                            console.error(`Error updating remaining days for id ${id}:`, error);
                            toast.error(`Erreur lors de la mise à jour des jours restants pour l'ID ${id} : ${error.message}`);
                        }
                    }
                );

                try {
                    await Promise.all(promises);
                    toast.success("Jours restants mis à jour avec succès");
                } catch (error) {
                    console.error("Error updating remaining days:", error);
                    toast.error("Erreur lors de la mise à jour des jours restants");
                } finally {
                    setIsUpdating(false);
                }
            }
        }, 1000);

        debouncedUpdate();

        return () => debouncedUpdate.cancel();
    }, [remainingDays, form.formState.isValid]);

    const handleViewOmar = async (omarId: number | undefined) => {
        if (omarId) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("omarId", omarId.toString());
            replace(`${pathname}?${newSearchParams.toString()}`);
        }
    };

    useEffect(() => {
        fetchAppointment()
    }, [appointmentId])

    const fetchAppointment = async () => {
        try {
            const fetchedAppointment = await getAppointment(appointmentId)
            setAppointment(fetchedAppointment)
        } catch (error) {
            console.error("Erreur lors de la récupération du rendez-vous:", error)
        }
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
                    {validDetails
                        .sort((a, b) => a.id - b.id)
                        .map((detail) => {
                            console.log("🔍 OMAR du détail ID", detail.id, ":", detail.omar);

                            return (

                                <TableRow key={detail.id}>
                                    <TableCell>{detail.fullname}</TableCell>
                                    <TableCell className="border-l border-r">
                                        {detail.objective.toLocaleString()} €
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            "border-l border-r",
                                            detail.realizedRevenue >= detail.objective
                                                ? "text-green-500"
                                                : "text-red-500"
                                        )}
                                    >
                                        {detail.realizedRevenue.toLocaleString()} €
                                    </TableCell>
                                    <TableCell className="border-l border-r">
                                        {detail.remainingRevenue >= 0
                                            ? detail.remainingRevenue.toLocaleString()
                                            : 0}{" "}
                                        €
                                    </TableCell>
                                    <TableCell className="border-l border-r">
                                        <Input
                                            type="number"
                                            className="w-20"
                                            {...form.register(`remainingDays.${detail.id}`, {
                                                onChange: (e) => {
                                                    const value = Number(e.target.value);
                                                    handleChangeRemainingDays(detail.id, value);
                                                },
                                            })}
                                            disabled={isUpdating}
                                        />
                                        {form.formState.errors.remainingDays?.[detail.id] && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {
                                                    form.formState.errors.remainingDays[detail.id]
                                                        ?.message
                                                }
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell className="border-l border-r">
                                        {detail.realizedRevenue >= detail.objective
                                            ? 0
                                            : Math.round(
                                                detail.remainingRevenue / (remainingDays[detail.id] ?? 1)
                                            ).toLocaleString()}
                                        €
                                    </TableCell>
                                    <TableCell className="border-l border-r">

                                        {detail.omar ? (
                                            <>
                                                <Button
                                                    variant={"ghost"}
                                                    onClick={() => handleViewOmar(detail.omar!.id)}
                                                >
                                                    {detail.omar!.status === "DRAFT"
                                                        ? "Modifier"
                                                        : "Ouvrir"}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant={"ghost"}
                                                disabled={!detail.userId}
                                                onClick={() =>
                                                    handleCreateOmar(detail.userId!, detail.id)
                                                }
                                            >
                                                Créer
                                            </Button>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {detail.omar?.dateSignature ? (
                                            `Signée à ${format(new Date(detail.omar.dateSignature), "HH:mm")}`
                                        ) : detail.omar && !detail.signedAt ? (
                                            <LoginDialog
                                                title={"Signature requise pour " + detail.fullname}
                                                userId={detail.userId!}
                                                onSuccess={() => handleSuccesLogin(detail.id, detail.userId!)}
                                                withTrigger={<Button variant={"ghost"}>Signature Requise</Button>}
                                            />
                                        ) : (
                                            "Signature en cours"
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                </TableBody>
            </Table>
        </div>
    );
};
