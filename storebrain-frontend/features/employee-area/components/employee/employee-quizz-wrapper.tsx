'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import EmployeeQuizz from './employee-quizz';
import { X } from 'lucide-react';
import { EmployeeJobOnboarding } from '../../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getQuizzById, markQuizzAsCompleted, submitQuizzAnswers, checkQuizzAvailability } from '../../actions';
import { useSession } from 'next-auth/react';

interface EmployeeQuizzWrapperProps {
    stepId: number;
    quizzId: number;
    setOpen: (open: boolean) => void;
    open: boolean;
    onSubmitSuccess: (updatedStep: EmployeeJobOnboarding | null) => void;
    status: string;
    responseId?: string;
    setResponseId: (id: string) => void;
}

export const EmployeeQuizzWrapper = ({ stepId, quizzId, setOpen, open, onSubmitSuccess, status, responseId, setResponseId }: EmployeeQuizzWrapperProps) => {
    const [isCompleted, setIsCompleted] = useState(() => status === "COMPLETED" || !!responseId);
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [quizzTitle, setQuizzTitle] = useState<string>('');
    const [answers, setAnswers] = useState<{ [questionId: number]: string[] }>({});
    const [hasQuizz, setHasQuizz] = useState<boolean | null>(null);


    useEffect(() => {
        const checkQuizzAvail = async () => {
            if (isCompleted || responseId) return;

            try {
                const result = await checkQuizzAvailability(quizzId);
                setHasQuizz(result.hasQuizz);
            } catch (error) {
                console.error("Erreur lors de la vérification du quizz :", error);
                setHasQuizz(false);
            }
        };

        checkQuizzAvail();
    }, [isCompleted, responseId, quizzId]);

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

    const handleSubmit = async () => {
        const answersToSubmit = Object.entries(answers).map(([questionId, answerArray]) => ({
            questionId: Number(questionId),
            answer: answerArray[0],
        }));

        console.log("🔍 Données envoyées :", {
            userId: userId!,
            answers: answersToSubmit,
        });

        const response = await submitQuizzAnswers(quizzId, {
            userId: Number(userId),
            answers: answersToSubmit,
        });

        if (response && response.quizzId) {
            const completedResponse = await markQuizzAsCompleted(
                Number(userId),
                stepId,
                response.responseId
            );
            console.log("✅ Quizz marqué comme complété :", completedResponse);
        }

        setIsCompleted(true);
        if (response) {
            setIsCompleted(true);
            onSubmitSuccess(response.updatedStep);
            if (response.responseId) {
                setResponseId(response.responseId);
            }
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <Button
                variant={"ghost"}
                onClick={() => setOpen(true)}
                disabled={!isCompleted && !responseId && hasQuizz === false}
            >
                {isCompleted ? `Consulter` : `Démarrer`}
            </Button>
            <SheetContent closeIcon={<X className="h-5 w-5 relative" />} className="flex flex-col h-[90vh] p-0" side="bottom">
                <SheetHeader>
                    <SheetTitle className="p-3 border-b border-gray-200">
                        {isCompleted ? `${quizzTitle} Complété` : quizzTitle}
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className='flex-grow p-4'>
                    <EmployeeQuizz
                        key={`${quizzId}-${responseId ?? 'initial'}`}
                        quizzId={quizzId}
                        onSubmitSuccess={onSubmitSuccess}
                        stepId={stepId}
                        responseId={responseId}
                        isCompleted={isCompleted}
                        setAnswers={setAnswers}
                        setResponseId={setResponseId}
                    />
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