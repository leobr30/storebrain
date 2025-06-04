'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from 'next-auth/react';
import { getQuizzById, getQuizzAnswersByUserId, getQuizzResponse } from '../../actions';
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
    const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);

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
        console.log("👤 userId :", userId);

        const fetchQuizz = async () => {
            if (!userId) {
                console.log("❌ Pas d'userId, arrêt de la fonction");
                return;
            }

            try {
                // Récupérer le quiz
                console.log("📥 Récupération du quiz ID:", quizzId);
                const data = await getQuizzById(quizzId);
                console.log("✅ Quiz récupéré:", data);
                setQuizz(data.data);

                // Si le quiz est complété, récupérer les réponses
                if (isCompleted && userId) {
                    setIsLoadingAnswers(true);
                    console.log(`📦 Quiz complété, récupération des réponses...`);

                    try {
                        let existingAnswersData = null;

                        // Méthode 1 : Si on a un responseId, essayer de récupérer via getQuizzResponse
                        if (responseId && responseId !== 'null' && responseId !== 'undefined') {
                            console.log(`🔍 Tentative avec responseId: ${responseId}`);
                            try {
                                existingAnswersData = await getQuizzResponse(responseId);
                                console.log("📊 Données via responseId :", existingAnswersData);
                            } catch (error) {
                                console.log("⚠️ Échec avec responseId, tentative avec userId");
                            }
                        }

                        // Méthode 2 : Si pas de responseId ou échec, essayer avec userId
                        if (!existingAnswersData) {
                            console.log(`🔍 Tentative avec userId: ${userId} pour quizz: ${quizzId}`);
                            existingAnswersData = await getQuizzAnswersByUserId(quizzId, String(userId));
                            console.log("📊 Données via userId :", existingAnswersData);
                        }

                        // Traitement des réponses
                        if (existingAnswersData && existingAnswersData.answers && existingAnswersData.answers.length > 0) {
                            const formatted: { [questionId: number]: string } = {};
                            existingAnswersData.answers.forEach((a: any) => {
                                console.log("💡 Traitement de la réponse :", a);
                                // Vérifier les différents formats possibles
                                if (a.questionId && (a.text || a.answer)) {
                                    formatted[a.questionId] = a.text || a.answer;
                                }
                            });
                            console.log("📝 Réponses formatées :", formatted);
                            setLocalAnswers(formatted);
                        } else {
                            console.log("⚠️ Aucune réponse trouvée ou structure invalide");
                            console.log("🔍 Structure reçue:", existingAnswersData);
                        }
                    } catch (error) {
                        console.error("❌ Erreur lors de la récupération des réponses :", error);
                    } finally {
                        setIsLoadingAnswers(false);
                    }
                }
            } catch (error) {
                console.error("❌ Erreur lors de la récupération du quiz :", error);
            }
        };

        fetchQuizz();
    }, [userId, quizzId, isCompleted, responseId]);

    if (!quizz) return <p>Chargement du quizz...</p>;

    return (
        <ScrollArea className="p-4">
            {isLoadingAnswers && (
                <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded">
                    Chargement des réponses...
                </div>
            )}

            {quizz.sections.map((section: any) => (
                <div key={section.id} className="space-y-6 border p-4 rounded">
                    <h3 className="font-semibold">{section.title}</h3>
                    {section.questions.map((question: any) => (
                        <div key={question.id} className="space-y-2">
                            <p className="font-medium">{question.text}</p>

                            {isCompleted ? (
                                <div className="bg-gray-100 text-gray-800 p-2 rounded">
                                    {localAnswers[question.id] ? (
                                        <span>{localAnswers[question.id]}</span>
                                    ) : (
                                        <em className="text-gray-400">Aucune réponse enregistrée</em>
                                    )}
                                </div>
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
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-600 font-semibold">✔️ Vous avez complété ce quizz.</p>
                    {Object.keys(localAnswers).length === 0 && !isLoadingAnswers && (
                        <p className="text-amber-600 text-sm mt-1">
                            ⚠️ Aucune réponse n'a pu être récupérée. Veuillez contacter l'administrateur.
                        </p>
                    )}
                </div>
            )}
        </ScrollArea>
    );
}