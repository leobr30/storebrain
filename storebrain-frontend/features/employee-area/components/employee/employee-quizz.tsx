'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from 'next-auth/react';
import { getQuizzById, submitQuizzAnswers, getQuizzAnswersByUserId, getQuizzResponse } from '../../actions'; // Import getQuizzAnswersByUserId et getQuizzResponse
import { EmployeeJobOnboarding } from '../../types';

interface EmployeeQuizzProps {
    quizzId: number;
    onSubmitSuccess: (updatedStep: EmployeeJobOnboarding | null) => void;
    stepId: number;
    responseId?: string;
    onInputChange: (questionId: number, value: string) => void;
    answers: { [questionId: number]: string[] };
    isCompleted: boolean;
}

export default function EmployeeQuizz({ quizzId, onSubmitSuccess, stepId, responseId, onInputChange, answers, isCompleted }: EmployeeQuizzProps) { // ✅ On ajoute responseId
    const { data: session } = useSession();
    const userId = session?.user?.id;

    const [quizz, setQuizz] = useState<any>(null);

    useEffect(() => {
        const fetchQuizz = async () => {
            if (!userId) return;
            const data = await getQuizzById(quizzId);
            setQuizz(data.data);

            // Fetch existing answers
            if (responseId) {
                const existingAnswers = await getQuizzResponse(responseId);
                if (existingAnswers && existingAnswers.length > 0) {
                    const formattedAnswers: { [questionId: number]: string[] } = {};
                    existingAnswers.forEach(answer => {
                        formattedAnswers[answer.questionId] = [answer.answer];
                    });
                }
            }
        };
        fetchQuizz();
    }, [userId, quizzId, responseId]);


    if (!quizz) return <p>Chargement du quizz...</p>;

    return (
        <ScrollArea className="p-4">
            {quizz.sections.map((section: any) => (
                <div key={section.id} className="space-y-6 border p-4 rounded">
                    <h3 className="font-semibold">{section.title}</h3>
                    {section.questions.map((question: any) => (
                        <div key={question.id} className="space-y-2">
                            <p className="font-medium">{question.text}</p>
                            <Input
                                type="text"
                                placeholder="Votre réponse"
                                value={answers[question.id]?.[0] || ''}
                                onChange={(e) => onInputChange(question.id, e.target.value)}
                                disabled={isCompleted}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    ))}
                </div>
            ))}

            {isCompleted && (
                <p className="text-green-600 font-semibold mt-4">✔️ Vous avez complété ce quizz.</p>
            )}
        </ScrollArea>
    );
}
