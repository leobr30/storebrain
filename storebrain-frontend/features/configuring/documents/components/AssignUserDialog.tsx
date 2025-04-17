'use client';

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useCallback, memo, useEffect, useRef } from "react";
import { User } from "lucide-react";

interface User {
    id: string;
    name: string;
}

type AssignUserDialogProps = {
    users: User[];
    onAssign: (userId: string) => void; // ✅ string
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

export const AssignUserDialog = memo(function AssignUserDialog({ users, onAssign, isOpen, onOpenChange }: AssignUserDialogProps) {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const selectRef = useRef<HTMLSelectElement>(null);

    const handleAssign = useCallback(() => {
        if (selectedUserId) {
            console.log("AssignUserDialog: handleAssign called with:", selectedUserId);
            onAssign(selectedUserId);
            setSelectedUserId(null);
            onOpenChange(false);
        }
    }, [selectedUserId, onAssign, onOpenChange]);

    const handleValueChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        console.log("AssignUserDialog: onValueChange called with:", value);
        setSelectedUserId(value); // ✅ PAS Number()
    }, []);

    useEffect(() => {
        if (isOpen && selectRef.current) {
            selectRef.current.focus();
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button className="flex items-center bg-blue-500 hover:bg-blue-600 text-white">
                    <User className="w-4 h-4 mr-2" /> Assigner un employé
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sélectionner un employé</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <select ref={selectRef} onChange={handleValueChange} defaultValue="" className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="" disabled>Choisir un employé...</option>
                        {users.map((user) => (
                            <option key={user.id} value={String(user.id)}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </div>
                <DialogFooter>
                    <Button onClick={handleAssign} disabled={selectedUserId === null}>
                        <User className="w-4 h-4 mr-2" /> Assigner
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
