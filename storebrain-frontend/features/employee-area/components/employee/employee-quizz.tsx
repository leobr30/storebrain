'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSession } from 'next-auth/react';
import { getQuizzById, getQuizzAnswersByUserId, getQuizzResponse } from '../../actions';
import { EmployeeJobOnboarding } from '../../types';
import Image from 'next/image';
import { CheckCircle, AlertCircle, FileText, ImageIcon } from 'lucide-react';

interface EmployeeQuizzProps {
    quizzId: number;
    stepId: number;
    responseId?: string;
    isCompleted: boolean;
    onSubmitSuccess: (step: any) => void;
    setAnswers: React.Dispatch<React.SetStateAction<{ [questionId: number]: string[] }>>;
    setResponseId: (id: string) => void;
}

export default function EmployeeQuizz({
    quizzId,
    stepId,
    responseId,
    isCompleted,
    onSubmitSuccess,
    setAnswers
}: EmployeeQuizzProps) {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [localAnswers, setLocalAnswers] = useState<{ [questionId: number]: string }>({});
    const [quizz, setQuizz] = useState<any>(null);
    const [isLoadingQuizz, setIsLoadingQuizz] = useState(true);
    const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
    const [imageErrors, setImageErrors] = useState<{ [questionId: number]: boolean }>({});
    const [error, setError] = useState<string | null>(null);
    const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());

    // Synchroniser les réponses locales avec le parent
    useEffect(() => {
        const transformed = Object.entries(localAnswers).reduce((acc, [questionId, answer]) => {
            acc[Number(questionId)] = [answer];
            return acc;
        }, {} as { [questionId: number]: string[] });

        setAnswers(transformed);

        // Mettre à jour les questions complétées
        const completed = new Set<number>();
        Object.entries(localAnswers).forEach(([questionId, answer]) => {
            if (answer && answer.trim().length > 0) {
                completed.add(Number(questionId));
            }
        });
        setCompletedQuestions(completed);
    }, [localAnswers, setAnswers]);

    // Charger le quiz et les réponses
    useEffect(() => {
        console.log("📥 Chargement du quiz et des réponses");
        console.log("🧾 responseId:", responseId);
        console.log("🔑 isCompleted:", isCompleted);
        console.log("👤 userId:", userId);

        const fetchQuizzData = async () => {
            if (!userId) {
                console.log("❌ Pas d'userId disponible");
                setError("Session utilisateur non disponible");
                setIsLoadingQuizz(false);
                return;
            }

            try {
                setError(null);
                setIsLoadingQuizz(true);

                // Charger le quiz
                console.log("📥 Récupération du quiz ID:", quizzId);
                const quizzResponse = await getQuizzById(quizzId);

                if (!quizzResponse?.data) {
                    throw new Error("Quiz non trouvé");
                }

                console.log("✅ Quiz récupéré:", quizzResponse.data);
                setQuizz(quizzResponse.data);

                // Charger les réponses si le quiz est complété
                if (isCompleted) {
                    await loadExistingAnswers();
                }

            } catch (error) {
                console.error("❌ Erreur lors du chargement:", error);
                setError("Erreur lors du chargement du quiz");
            } finally {
                setIsLoadingQuizz(false);
            }
        };

        fetchQuizzData();
    }, [userId, quizzId, isCompleted, responseId]);

    const loadExistingAnswers = async () => {
        if (!userId) return;

        setIsLoadingAnswers(true);
        console.log("📦 Chargement des réponses existantes...");

        try {
            let existingAnswersData = null;

            // Essayer d'abord avec responseId
            if (responseId && responseId !== 'null' && responseId !== 'undefined') {
                console.log(`🔍 Recherche avec responseId: ${responseId}`);
                try {
                    existingAnswersData = await getQuizzResponse(responseId);
                    console.log("📊 Réponses trouvées via responseId:", existingAnswersData);
                } catch (error) {
                    console.log("⚠️ Échec avec responseId, tentative avec userId");
                }
            }

            // Fallback avec userId
            if (!existingAnswersData) {
                console.log(`🔍 Recherche avec userId: ${userId} pour quiz: ${quizzId}`);
                existingAnswersData = await getQuizzAnswersByUserId(quizzId, String(userId));
                console.log("📊 Réponses trouvées via userId:", existingAnswersData);
            }

            // Formater les réponses
            if (existingAnswersData?.answers?.length > 0) {
                const formatted: { [questionId: number]: string } = {};
                existingAnswersData.answers.forEach((answer: any) => {
                    console.log("💡 Traitement réponse:", answer);
                    if (answer.questionId && (answer.text || answer.answer)) {
                        formatted[answer.questionId] = answer.text || answer.answer;
                    }
                });
                console.log("📝 Réponses formatées:", formatted);
                setLocalAnswers(formatted);
            } else {
                console.log("⚠️ Aucune réponse trouvée");
            }

        } catch (error) {
            console.error("❌ Erreur lors du chargement des réponses:", error);
            setError("Erreur lors du chargement des réponses");
        } finally {
            setIsLoadingAnswers(false);
        }
    };

    const handleImageError = (questionId: number) => {
        setImageErrors(prev => ({ ...prev, [questionId]: true }));
    };

    const handleAnswerChange = (questionId: number, value: string) => {
        setLocalAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const isQuestionLongText = (question: any) => {
        // Détecter si la question nécessite une réponse longue
        const indicators = ['expliquez', 'décrivez', 'détaillez', 'comment', 'pourquoi', 'exemple'];
        const questionText = question.text?.toLowerCase() || '';
        return indicators.some(indicator => questionText.includes(indicator)) ||
            question.type === 'long_text' ||
            question.expectedLength === 'long';
    };

    const formatTextWithLineBreaks = (text: string) => {
        return text.split('\n').map((line, index) => (
            <span key={index}>
                {line}
                {index < text.split('\n').length - 1 && <br />}
            </span>
        ));
    };

    const renderQuestionImage = (question: any) => {
        if (!question.imageUrl || imageErrors[question.id]) {
            return null;
        }

        return (
            <Card className="my-4 overflow-hidden">
                <CardContent className="p-0">
                    <div className="relative w-full">
                        <Image
                            src={question.imageUrl}
                            alt={`Image pour la question: ${question.text}`}
                            width={600}
                            height={400}
                            className="w-full h-auto object-cover"
                            onError={() => handleImageError(question.id)}
                            style={{
                                maxHeight: '400px',
                            }}
                        />
                        <div className="absolute top-2 right-2">
                            <Badge color="secondary" className="bg-white/80">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Image
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderAnswerInput = (question: any) => {
        const isLongText = isQuestionLongText(question);
        const currentAnswer = localAnswers[question.id] || '';
        const isCompleted = completedQuestions.has(question.id);

        if (isLongText) {
            return (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor={`question-${question.id}`} className="text-sm font-medium text-gray-700">
                            Votre réponse détaillée:
                        </label>
                        {isCompleted && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complété
                            </Badge>
                        )}
                    </div>
                    <Textarea
                        id={`question-${question.id}`}
                        placeholder="Décrivez votre réponse en détail. Vous pouvez utiliser plusieurs lignes..."
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="min-h-[120px] resize-vertical border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        rows={4}
                    />
                    <div className="text-xs text-gray-500">
                        {currentAnswer.length} caractères
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label htmlFor={`question-${question.id}`} className="text-sm font-medium text-gray-700">
                        Votre réponse:
                    </label>
                    {isCompleted && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complété
                        </Badge>
                    )}
                </div>
                <Input
                    id={`question-${question.id}`}
                    type="text"
                    placeholder="Saisissez votre réponse..."
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>
        );
    };

    const renderCompletedAnswer = (question: any) => {
        const answer = localAnswers[question.id];

        return (
            <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-green-800 mb-2">
                                Votre réponse:
                            </div>
                            {answer ? (
                                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                    {formatTextWithLineBreaks(answer)}
                                </div>
                            ) : (
                                <div className="text-gray-400 italic">
                                    Aucune réponse enregistrée
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // États de chargement
    if (isLoadingQuizz) {
        return (
            <div className="p-6 space-y-6">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/3" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Alert color="destructive" className="m-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!quizz) {
        return (
            <Alert color="destructive" className="m-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Quiz non trouvé</AlertDescription>
            </Alert>
        );
    }

    const totalQuestions = quizz.sections?.reduce((total: number, section: any) =>
        total + (section.questions?.length || 0), 0) || 0;
    const answeredQuestions = completedQuestions.size;

    return (
        <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
                {/* En-tête avec progression */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <FileText className="h-6 w-6 mr-2" />
                            Quiz d'évaluation
                        </h2>
                        {!isCompleted && (
                            <Badge variant="outline" className="text-sm">
                                {answeredQuestions}/{totalQuestions} complétées
                            </Badge>
                        )}
                    </div>

                    {!isCompleted && totalQuestions > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Indicateur de chargement des réponses */}
                {isLoadingAnswers && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Chargement de vos réponses...
                        </AlertDescription>
                    </Alert>
                )}

                {/* Sections et questions */}
                {quizz.sections?.map((section: any, sectionIndex: number) => (
                    <Card key={section.id || sectionIndex} className="overflow-hidden">
                        <CardHeader className="bg-gray-50">
                            <CardTitle className="text-lg text-gray-800 flex items-center">
                                <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">
                                    {sectionIndex + 1}
                                </span>
                                {section.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {section.questions?.map((question: any, questionIndex: number) => (
                                <div key={question.id || questionIndex} className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start space-x-3">
                                            <span className="bg-gray-100 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-1 flex-shrink-0">
                                                {questionIndex + 1}
                                            </span>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 leading-relaxed">
                                                    {question.text}
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Image de la question */}
                                        {renderQuestionImage(question)}

                                        {/* Champ de réponse */}
                                        <div className="ml-9">
                                            {isCompleted ?
                                                renderCompletedAnswer(question) :
                                                renderAnswerInput(question)
                                            }
                                        </div>
                                    </div>

                                    {/* Séparateur entre questions */}
                                    {questionIndex < section.questions.length - 1 && (
                                        <hr className="border-gray-200" />
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}

                {/* Statut de completion */}
                {isCompleted && (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            <div className="font-semibold">Quiz complété avec succès !</div>
                            {Object.keys(localAnswers).length === 0 && !isLoadingAnswers && (
                                <div className="text-amber-600 text-sm mt-1">
                                    ⚠️ Aucune réponse n'a pu être récupérée. Veuillez contacter l'administrateur.
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </ScrollArea>
    );
}