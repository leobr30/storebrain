'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import EmployeeQuizz from './employee-quizz';
import { X } from 'lucide-react';
import { EmployeeJobOnboarding } from '../../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getQuizzAnswersByUserId } from '../../actions';
import { useSession } from 'next-auth/react';

interface EmployeeQuizzWrapperProps {
    stepId: number;
    quizzId: number;
    setOpen: (open: boolean) => void;
    open: boolean;
    onSubmitSuccess: (updatedStep: EmployeeJobOnboarding | null) => void;
    status: string;
    responseId?: string; // ✅ On ajoute responseId
}

// ✅ On ajoute responseId


export const EmployeeQuizzWrapper = ({ stepId, quizzId, setOpen, open, onSubmitSuccess, status, responseId }: EmployeeQuizzWrapperProps) => { // ✅ On ajoute responseId
    const [isCompleted, setIsCompleted] = useState(status === "COMPLETED");
    const { data: session } = useSession();
    const userId = session?.user?.id;

    useEffect(() => {
        const checkQuizzCompletion = async () => {
            if (!userId) return;
            if (responseId) {
                setIsCompleted(true);
            } else {
                setIsCompleted(false);
            }
        };
        checkQuizzCompletion();
    }, [quizzId, userId, responseId]); // ✅ On ajoute responseId
    // ✅ On ajoute responseId

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <Button variant={"ghost"} onClick={() => setOpen(true)}>
                {isCompleted ? "Consulter le Quizz" : "Démarrer le Quizz"}
            </Button>
            <SheetContent closeIcon={<X className="h-5 w-5 relative" />} className="flex flex-col h-[90vh] p-0" side="bottom">
                <SheetHeader>
                    <SheetTitle className="p-3 border-b border-gray-200">
                        {isCompleted ? "Quizz Complété" : "Quizz"}
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className='flex-grow p-4'>
                    <EmployeeQuizz quizzId={quizzId} onSubmitSuccess={onSubmitSuccess} stepId={stepId} responseId={responseId} /> {/* ✅ On passe responseId */}
                </ScrollArea>
                <SheetFooter className="p-4 flex justify-end items-center bg-white border-t border-gray-200">
                    <SheetClose asChild>
                        <Button>Fermer</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
