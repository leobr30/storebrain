'use client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

export default function EditItemDialog({
    open,
    onClose,
    onSave,
    defaultValue = "",
}: {
    open: boolean;
    onClose: () => void;
    onSave: (value: string) => void;
    defaultValue?: string;
}) {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    const handleSave = () => {
        const trimmed = value.trim();
        if (trimmed.length > 0) {
            onSave(trimmed);
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg bg-white rounded-xl shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        {defaultValue ? "Modifier l’élément" : "Ajouter un nouvel élément"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Tu peux écrire plusieurs lignes si besoin.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2">
                    <Textarea
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        rows={6}
                        placeholder="Tape ton contenu ici..."
                        className="resize-y text-sm px-4 py-2 bg-muted rounded-md shadow-inner w-full"
                    />
                </div>

                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSave} disabled={value.trim().length === 0}>
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
