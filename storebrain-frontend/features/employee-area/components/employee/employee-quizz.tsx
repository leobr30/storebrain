'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from 'next-auth/react';
import { getQuizzById, submitQuizzAnswers } from '../../actions'; // ✅ Modification de l'import
import { EmployeeJobOnboarding } from '../../types';

interface EmployeeQuizzProps {
    quizzId: number;
    onSubmitSuccess: (updatedStep: EmployeeJobOnboarding | null) => void;
    stepId: number;
}

export default function EmployeeQuizz({ quizzId, onSubmitSuccess, stepId }: EmployeeQuizzProps) {
    const { data: session } = useSession();
    const userId = session?.user?.id;

    const [quizz, setQuizz] = useState<any>(null);
    const [answers, setAnswers] = useState<{ [questionId: number]: string[] }>({}); // ✅ Modification du type
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        const fetchQuizz = async () => {
            if (!userId) return;
            const data = await getQuizzById(quizzId); // ✅ Modification de la fonction
            setQuizz(data.data); // ✅ Modification de la propriété
        };
        fetchQuizz();
    }, [userId, quizzId]);

    const handleToggle = (questionId: number, answerId: string) => { // ✅ Modification du type
        setAnswers(prev => {
            const current = prev[questionId] || [];
            const exists = current.includes(answerId);
            return {
                ...prev,
                [questionId]: exists
                    ? current.filter(id => id !== answerId)
                    : [...current, answerId]
            };
        });
    };

    const handleSubmit = async () => {
        const answersToSubmit = Object.entries(answers).map(([questionId, answerIds]) => ({
            questionId: Number(questionId),
            answer: answerIds[0] // ✅ Modification pour envoyer la réponse
        }));
        const response = await submitQuizzAnswers(quizzId, { userId: userId!, answers: answersToSubmit }); // ✅ Modification de la fonction
        setIsCompleted(true);
        if (response) {
            onSubmitSuccess(null); // ✅ Modification pour envoyer null
        }
    };

    if (!quizz) return <p>Chargement du quizz...</p>;

    return (
        <ScrollArea className="p-6 space-y-6">
            <h2 className="text-xl font-bold">{quizz.title}</h2>
            {quizz.sections.map((section: any) => (
                <div key={section.id} className="space-y-4 border p-4 rounded">
                    <h3 className="font-semibold">{section.title}</h3>
                    {section.questions.map((question: any) => (
                        <div key={question.id} className="space-y-2">
                            <p className="font-medium">{question.text}</p>
                            {question.answers.map((answer: any) => (
                                <div key={answer.id} className="flex items-center gap-3">
                                    <Checkbox
                                        checked={answers[question.id]?.includes(answer.id)}
                                        onCheckedChange={() => handleToggle(question.id, answer.id)}
                                        disabled={isCompleted}
                                    />
                                    <span>{answer.text}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}

            {!isCompleted && (
                <Button onClick={handleSubmit} className="mt-4">
                    ✅ Soumettre mes réponses
                </Button>
            )}

            {isCompleted && (
                <p className="text-green-600 font-semibold mt-4">✔️ Vous avez complété ce quizz.</p>
            )}
        </ScrollArea>
    );
}
