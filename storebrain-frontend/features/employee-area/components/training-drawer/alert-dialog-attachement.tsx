import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"

export function AlertDialogAttachment({id, onDelete}: {id: number, onDelete: (attachmentId: number) => void}) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant={'soft'} color="destructive" size="icon">
                    <Trash />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="z-[999]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action ne peut être annulée. Cette action supprimera définitivement votre fichier.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(id)}>Continuer</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
