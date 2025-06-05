'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from 'next-auth/react';
import { getQuizzById, getQuizzAnswersByUserId, getQuizzResponse } from '../../actions';
import { EmployeeJobOnboarding } from '../../types';
import Image from 'next/image';

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
    const [imageErrors, setImageErrors] = useState<{ [questionId: number]: boolean }>({});

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
                console.log("📥 Récupération du quiz ID:", quizzId);
                const data = await getQuizzById(quizzId);
                console.log("✅ Quiz récupéré:", data);
                setQuizz(data.data);

                if (isCompleted && userId) {
                    setIsLoadingAnswers(true);
                    console.log(`📦 Quiz complété, récupération des réponses...`);

                    try {
                        let existingAnswersData = null;

                        if (responseId && responseId !== 'null' && responseId !== 'undefined') {
                            console.log(`🔍 Tentative avec responseId: ${responseId}`);
                            try {
                                existingAnswersData = await getQuizzResponse(responseId);
                                console.log("📊 Données via responseId :", existingAnswersData);
                            } catch (error) {
                                console.log("⚠️ Échec avec responseId, tentative avec userId");
                            }
                        }

                        if (!existingAnswersData) {
                            console.log(`🔍 Tentative avec userId: ${userId} pour quizz: ${quizzId}`);
                            existingAnswersData = await getQuizzAnswersByUserId(quizzId, String(userId));
                            console.log("📊 Données via userId :", existingAnswersData);
                        }


                        if (existingAnswersData && existingAnswersData.answers && existingAnswersData.answers.length > 0) {
                            const formatted: { [questionId: number]: string } = {};
                            existingAnswersData.answers.forEach((a: any) => {
                                console.log("💡 Traitement de la réponse :", a);
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

    const handleImageError = (questionId: number) => {
        setImageErrors(prev => ({ ...prev, [questionId]: true }));
    };

    const renderQuestionImage = (question: any) => {
        if (!question.imageUrl || imageErrors[question.id]) {
            return null;
        }

        return (
            <div className="my-3">
                <div className="relative w-full max-w-md mx-auto">
                    <Image
                        src={question.imageUrl}
                        alt={`Image pour la question: ${question.text}`}
                        width={400}
                        height={300}
                        className="rounded-lg shadow-sm border border-gray-200 object-cover"
                        onError={() => handleImageError(question.id)}
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                        }}
                    />
                </div>
            </div>
        );
    };

    if (!quizz) return <p>Chargement du quizz...</p>;

    return (
        <ScrollArea className="p-4">
            {isLoadingAnswers && (
                <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded">
                    Chargement des réponses...
                </div>
            )}

            {quizz.sections.map((section: any) => (
                <div key={section.id} className="space-y-6 border p-4 rounded mb-6">
                    <h3 className="font-semibold text-lg text-gray-800">{section.title}</h3>
                    {section.questions.map((question: any) => (
                        <div key={question.id} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-900">{question.text}</p>

                            {/* Affichage de l'image si elle existe */}
                            {renderQuestionImage(question)}

                            {isCompleted ? (
                                <div className="bg-white text-gray-800 p-3 rounded border-l-4 border-green-400">
                                    {localAnswers[question.id] ? (
                                        <span className="font-medium">{localAnswers[question.id]}</span>
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
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
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