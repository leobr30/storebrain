'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from 'next-auth/react';
import { getQuizzById, getQuizzAnswersByUserId } from '../../actions';
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
    const [quizz, setQuizz] = useState<any>(null);

    useEffect(() => {
        const transformed = Object.entries(localAnswers).reduce((acc, [questionId, answer]) => {
            acc[Number(questionId)] = [answer];
            return acc;
        }, {} as { [questionId: number]: string[] });

        setAnswers(transformed);
    }, [localAnswers, setAnswers]);

    useEffect(() => {
        console.log("📥 Entrée dans useEffect");
        console.log("🧾 responseId reçu :", responseId);
        console.log("🔑 isCompleted :", isCompleted);

        const fetchQuizz = async () => {
            if (!userId) return;

            try {
                // Récupérer le quiz
                const data = await getQuizzById(quizzId);
                setQuizz(data.data);

                // Si le quiz est complété, récupérer les réponses
                if (isCompleted && userId) {
                    console.log(`📦 Récupération des réponses pour Quizz ID: ${quizzId}, User ID: ${userId}`);

                    try {
                        const existingAnswersData = await getQuizzAnswersByUserId(quizzId, String(userId));
                        console.log("📊 Données récupérées :", existingAnswersData);

                        // existingAnswersData contient déjà les données grâce au .data dans actions.ts
                        if (existingAnswersData && existingAnswersData.answers && existingAnswersData.answers.length > 0) {
                            const formatted: { [questionId: number]: string } = {};
                            existingAnswersData.answers.forEach((a: any) => {
                                console.log("💡 Réponse trouvée :", a);
                                formatted[a.questionId] = a.text;
                            });
                            console.log("📝 Réponses formatées :", formatted);
                            setLocalAnswers(formatted);
                        } else {
                            console.log("⚠️ Aucune réponse trouvée");
                        }
                    } catch (error) {
                        console.error("❌ Erreur lors de la récupération des réponses :", error);
                    }
                }
            } catch (error) {
                console.error("❌ Erreur lors de la récupération du quiz :", error);
            }
        };

        fetchQuizz();
    }, [userId, quizzId, isCompleted]);

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