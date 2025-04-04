import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { createOmar, getAppointment, signMondayAppointmentDetail } from "@/features/employee-area/actions"
import { format } from "date-fns"
import { Loader2, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { AppointmentsCard } from "../appointments-card"
import { ObjectiveCard } from "./objective-card"
import { Employees } from "./employees"
import { Separator } from "@/components/ui/separator"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"
import { MondayAppointment, Omar } from "@/features/employee-area/types"
import { OmarDialog } from "./omar-dialog"

export const AppointmentSheet = () => {

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const pathname = usePathname();
    const { replace } = useRouter();
    const [appointment, setAppointment] = useState<MondayAppointment>()
    const searchParams = useSearchParams()
    const appointmentId = searchParams.get("appointmentId")

    useEffect(() => {
        fetchAppointment()
    }, [appointmentId])


    const fetchAppointment = async () => {

        if (appointmentId) {
            setOpen(true)
            setLoading(true)
            try {
                const fetchedAppointment = await getAppointment(parseInt(appointmentId))
                setAppointment(fetchedAppointment)
            } catch (error) {
                console.error("Erreur lors de la récupération du rendez-vous:", error)
            } finally {
                setLoading(false)
            }
        } else {
            setOpen(false)
        }
    }

    const handleClose = () => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete("appointmentId")
        replace(`${pathname}?${newSearchParams.toString()}`);
    }

    const handleChangeRemainingDays = (onerpId: number, value: number) => {
        setAppointment(prevAppointment => {
            const updatedDetails = prevAppointment.details.map(detail => {
                if (detail.onerpId === onerpId) {
                    return { ...detail, remainingDays: value };
                }
                return { ...detail }; // Return a new object for unchanged details as well
            });
            return { ...prevAppointment, details: updatedDetails }; // Return a new appointment object
        });
    };

    const handleCreateOmar = async (userId: number, appointmentDetailId?: number) => {
        try {
            const omar = await createOmar(userId, appointmentDetailId);

            if (!omar || !omar.id) {
                throw new Error("L'objet OMAR retourné est invalide.");
            }

            setAppointment(prev => {
                if (!prev) return prev;

                const updatedDetails = prev.details.map(detail =>
                    detail.id === appointmentDetailId
                        ? { ...detail, omar: { ...omar } } // clone l'objet omar
                        : { ...detail } // clone tous les autres détails aussi
                );

                const updatedAppointment = {
                    ...prev,
                    details: updatedDetails, // nouvelle référence pour le tableau
                };

                console.log("✅ OMAR inséré dans l'état :", updatedAppointment);

                return updatedAppointment;
            });

            // Mise à jour des params pour afficher la modale OMAR directement
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("omarId", omar.id.toString());
            replace(`${pathname}?${newSearchParams.toString()}`);
        } catch (error) {
            console.error("Erreur dans handleCreateOmar :", error);
        }
    };




    const onOmarValidate = (omar: Omar) => {
        setAppointment((prevAppointment: MondayAppointment) => {
            const updatedDetails = prevAppointment.details.map(detail => {
                if (detail.omar?.id === omar.id) {
                    return { ...detail, omar };
                }
                return detail;
            });
            return { ...prevAppointment, details: updatedDetails };
        });
    }

    const handleSuccesLogin = async (id: number) => {
        const responseDetail = await signMondayAppointmentDetail(id)
        setAppointment((prevAppointment: MondayAppointment) => {
            const updatedDetails = prevAppointment.details.map(detail => {
                if (detail.id === id) {
                    return responseDetail;
                }
                return detail;
            });
            console.log(updatedDetails)
            return { ...prevAppointment, details: updatedDetails };
        });
    }

    return (
        <>
            <OmarDialog onOmarValidate={onOmarValidate} />
            <Sheet open={open} onOpenChange={handleClose} >
                <SheetContent
                    closeIcon={<X className="h-5 w-5 relative" />}
                    className="p-0 min-h-[80vh] max-h-[95vh]" side={"bottom"} >
                    {loading || !appointment ? (
                        <>
                            <TableSkeleton rows={4} columns={6} />
                            <TableSkeleton rows={8} columns={8} />
                        </>


                    ) : (
                        <>
                            <SheetHeader className="p-3 border-b border-default-200">
                                <SheetTitle>Rendez-vous du lundi du {format(appointment.date, 'dd/MM/yyyy')}</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="h-[90vh] pt-5">
                                <div className="p-5">
                                    <div className="space-y-5">

                                        <ObjectiveCard appointment={appointment} />
                                        <Separator />
                                        <Employees
                                            handleCreateOmar={handleCreateOmar}
                                            details={appointment.details}
                                            appointmentId={appointment.id}
                                            handleChangeRemainingDays={handleChangeRemainingDays}
                                            handleSuccesLogin={handleSuccesLogin}
                                        />
                                    </div>
                                </div>


                            </ScrollArea>
                        </>

                    )}
                </SheetContent>
            </Sheet>
        </>

    )
}
