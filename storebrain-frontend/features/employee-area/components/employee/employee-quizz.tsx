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
}

export default function EmployeeQuizz({ quizzId, onSubmitSuccess, stepId, responseId }: EmployeeQuizzProps) { // ✅ On ajoute responseId
    const { data: session } = useSession();
    const userId = session?.user?.id;

    const [quizz, setQuizz] = useState<any>(null);
    const [answers, setAnswers] = useState<{ [questionId: number]: string[] }>({});
    const [isCompleted, setIsCompleted] = useState(false);

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
                    setAnswers(formattedAnswers);
                    setIsCompleted(true);
                }
            }
        };
        fetchQuizz();
    }, [userId, quizzId, responseId]); // ✅ On ajoute responseId
    // ✅ On ajoute responseId

    const handleInputChange = (questionId: number, value: string) => {
        if (isCompleted) return; // Prevent changes if completed
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
            onSubmitSuccess(response.updatedStep); // ✅ Call onSubmitSuccess with the updated step
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
                            <Input
                                type="text"
                                placeholder="Votre réponse"
                                value={answers[question.id]?.[0] || ''}
                                onChange={(e) => handleInputChange(question.id, e.target.value)}
                                disabled={isCompleted}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    ))}
                </div>
            ))}

            {!isCompleted && (
                <Button onClick={handleSubmit} className="mt-4">
                    Soumettre mes réponses
                </Button>
            )}

            {isCompleted && (
                <p className="text-green-600 font-semibold mt-4">✔️ Vous avez complété ce quizz.</p>
            )}
        </ScrollArea>
    );
}
