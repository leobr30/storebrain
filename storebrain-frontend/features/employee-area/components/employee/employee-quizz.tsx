'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from 'next-auth/react';
import { getQuizzById, submitQuizzAnswers, getQuizzAnswersByUserId, getQuizzResponse } from '../../actions';
import { EmployeeJobOnboarding } from '../../types';

interface EmployeeQuizzProps {
    quizzId: number;
    stepId: number;
    responseId?: string;
    isCompleted: boolean;
    onSubmitSuccess: (step: any) => void;
    setAnswers: React.Dispatch<React.SetStateAction<{ [questionId: number]: string[] }>>;
    setResponseId: (id: string) => void;
}



export default function EmployeeQuizz({ quizzId, stepId, responseId, isCompleted, onSubmitSuccess, setAnswers }: EmployeeQuizzProps) {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [localAnswers, setLocalAnswers] = useState<{ [questionId: number]: string }>({});

    useEffect(() => {

        const transformed = Object.entries(localAnswers).reduce((acc, [questionId, answer]) => {
            acc[Number(questionId)] = [answer];
            return acc;
        }, {} as { [questionId: number]: string[] });

        setAnswers(transformed);
    }, [localAnswers, setAnswers]);



    const [quizz, setQuizz] = useState<any>(null);

    useEffect(() => {
        console.log("📥 Entrée dans useEffect");
        console.log("🧾 responseId reçu :", responseId);
        const fetchQuizz = async () => {
            if (!userId) return;
            const data = await getQuizzById(quizzId);
            setQuizz(data.data);


            if (responseId) {
                const existingAnswers = await getQuizzResponse(responseId);
                console.log("📦 Réponses existantes récupérées :", existingAnswers);
                if (existingAnswers && existingAnswers.length > 0) {
                    const formatted: { [questionId: number]: string } = {};
                    existingAnswers.forEach((a:any) => {
                        formatted[a.questionId] = a.answer;
                    });
                    setLocalAnswers(formatted);
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

                            {isCompleted ? (
                                <p className="bg-gray-100 text-gray-800 p-2 rounded">
                                    {localAnswers[question.id] || <em className="text-gray-400">Aucune réponse</em>}
                                </p>
                            ) : (
                                <Input
                                    type="text"
                                    placeholder="Votre réponse"
                                    value={localAnswers[question.id] || ''}
                                    onChange={(e) =>
                                        setLocalAnswers((prev) => ({
                                            ...prev,
                                            [question.id]: e.target.value,
                                        }))
                                    }
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            )}
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
