'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import EmployeeQuizz from './employee-quizz';
import { X } from 'lucide-react';
import { EmployeeJobOnboarding } from '../../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getQuizzById, submitQuizzAnswers } from '../../actions';
import { useSession } from 'next-auth/react';

interface EmployeeQuizzWrapperProps {
    stepId: number;
    quizzId: number;
    setOpen: (open: boolean) => void;
    open: boolean;
    onSubmitSuccess: (updatedStep: EmployeeJobOnboarding | null) => void;
    status: string;
    responseId?: string;
}


export const EmployeeQuizzWrapper = ({ stepId, quizzId, setOpen, open, onSubmitSuccess, status, responseId }: EmployeeQuizzWrapperProps) => {
    const [isCompleted, setIsCompleted] = useState(status === "COMPLETED");
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [quizzTitle, setQuizzTitle] = useState<string>('');
    const [answers, setAnswers] = useState<{ [questionId: number]: string[] }>({});

    useEffect(() => {
        const fetchQuizzTitle = async () => {
            try {
                const quizzData = await getQuizzById(quizzId);
                setQuizzTitle(quizzData.data.title);
            } catch (error) {
                console.error("Erreur lors de la récupération du titre du quizz :", error);
                setQuizzTitle("Quizz");
            }
        };
        fetchQuizzTitle();
    }, [quizzId]);

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
    }, [quizzId, userId, responseId]);

    const handleInputChange = (questionId: number, value: string) => {
        if (isCompleted) return;
        setAnswers(prev => ({
            ...prev,
            [questionId]: [value],
        }));
    };

    const handleSubmit = async () => {
        const answersToSubmit = Object.entries(answers).map(([questionId, answerArray]) => ({
            questionId: Number(questionId),
            answer: answerArray[0],
        }));

        const response = await submitQuizzAnswers(quizzId, {
            userId: userId!,
            answers: answersToSubmit,
        });

        setIsCompleted(true);
        if (response) {
            onSubmitSuccess(response.updatedStep);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <Button variant={"ghost"} onClick={() => setOpen(true)}>
                {isCompleted ? `Consulter` : `Démarrer`}
            </Button>
            <SheetContent closeIcon={<X className="h-5 w-5 relative" />} className="flex flex-col h-[90vh] p-0" side="bottom">
                <SheetHeader>
                    <SheetTitle className="p-3 border-b border-gray-200">
                        {isCompleted ? `${quizzTitle} Complété` : quizzTitle}
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className='flex-grow p-4'>
                    <EmployeeQuizz quizzId={quizzId} onSubmitSuccess={onSubmitSuccess} stepId={stepId} responseId={responseId} onInputChange={handleInputChange} answers={answers} isCompleted={isCompleted} />
                </ScrollArea>
                <SheetFooter className="p-4 flex justify-end items-center bg-white border-t border-gray-200">
                    {!isCompleted && (
                        <Button onClick={handleSubmit} className="mt-4">
                            Soumettre mes réponses
                        </Button>
                    )}

                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
