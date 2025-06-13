'use client';

import React, { useState } from 'react';
import QuestionField from './QuestionField';
import { AnnualReviewSection, AnnualReviewResponse } from './types';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, FileText, Clock } from 'lucide-react';

interface EntretienSectionProps {
    section: AnnualReviewSection;
    responses: Record<number, string>;
    onResponseChange: (questionId: number, value: string) => void;
    disabled?: boolean;
    sectionIndex: number;
}

export default function EntretienSection({
    section,
    responses,
    onResponseChange,
    disabled = false,
    sectionIndex
}: EntretienSectionProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Calculer les statistiques de completion de la section
    const getSectionStats = () => {
        const totalQuestions = section.questions.length;
        const answeredQuestions = section.questions.filter(q =>
            responses[q.id] && responses[q.id].trim() !== ''
        ).length;
        const requiredQuestions = section.questions.filter(q => q.required).length;
        const answeredRequiredQuestions = section.questions.filter(q =>
            q.required && responses[q.id] && responses[q.id].trim() !== ''
        ).length;

        return {
            totalQuestions,
            answeredQuestions,
            requiredQuestions,
            answeredRequiredQuestions,
            completionPercentage: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0,
            isComplete: requiredQuestions === answeredRequiredQuestions
        };
    };

    const stats = getSectionStats();

    const getProgressColor = () => {
        if (stats.isComplete) return 'from-green-500 to-emerald-500';
        if (stats.completionPercentage > 50) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-pink-500';
    };

    const getQuestionTypes = () => {
        const types = section.questions.reduce((acc, question) => {
            acc[question.type] = (acc[question.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(types).map(([type, count]) => {
            const typeLabels: Record<string, { label: string; icon: string }> = {
                'TEXT': { label: 'Texte court', icon: '📝' },
                'TEXTAREA': { label: 'Texte long', icon: '📄' },
                'SELECT': { label: 'Liste', icon: '📋' },
                'RADIO': { label: 'Choix unique', icon: '🔘' },
                'CHECKBOX': { label: 'Choix multiple', icon: '☑️' },
                'NUMBER': { label: 'Nombre', icon: '🔢' },
                'DATE': { label: 'Date', icon: '📅' }
            };

            return {
                type: typeLabels[type] || { label: type, icon: '❓' },
                count
            };
        });
    };

    const questionTypes = getQuestionTypes();

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Header de la section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center mb-2">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                {sectionIndex + 1}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">
                                    {section.title}
                                </h3>
                                <div className="flex items-center mt-1 space-x-4">
                                    <span className="text-indigo-100 text-sm">
                                        {stats.totalQuestions} question{stats.totalQuestions > 1 ? 's' : ''}
                                    </span>
                                    <span className="text-indigo-200">•</span>
                                    <span className="text-indigo-100 text-sm">
                                        {stats.requiredQuestions} obligatoire{stats.requiredQuestions > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Barre de progression */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-sm text-indigo-100 mb-2">
                                <span>Progression</span>
                                <span>{stats.completionPercentage}% complété</span>
                            </div>
                            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                                <div
                                    className={`bg-gradient-to-r ${getProgressColor()} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${stats.completionPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-6">
                        {stats.isComplete && (
                            <div className="flex items-center bg-green-500 bg-opacity-20 text-green-100 px-3 py-1 rounded-full text-sm">
                                <CheckCircle size={16} className="mr-1" />
                                Complète
                            </div>
                        )}

                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 text-indigo-200 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                            title={isCollapsed ? "Développer" : "Réduire"}
                        >
                            {isCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Informations de la section */}
            {!isCollapsed && (
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Statistiques détaillées */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Questions répondues</span>
                                <span className="font-semibold text-gray-800">
                                    {stats.answeredQuestions}/{stats.totalQuestions}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Questions obligatoires</span>
                                <span className={`font-semibold ${stats.isComplete ? 'text-green-600' : 'text-amber-600'}`}>
                                    {stats.answeredRequiredQuestions}/{stats.requiredQuestions}
                                </span>
                            </div>
                        </div>

                        {/* Types de questions */}
                        <div>
                            <p className="text-sm text-gray-600 mb-2">Types de questions</p>
                            <div className="flex flex-wrap gap-2">
                                {questionTypes.map(({ type, count }, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                    >
                                        <span className="mr-1">{type.icon}</span>
                                        {type.label} ({count})
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contenu des questions */}
            {!isCollapsed && (
                <div className="p-6">
                    {/* Message d'aide si section vide */}
                    {section.questions.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="text-gray-400" size={32} />
                            </div>
                            <h4 className="text-lg font-medium text-gray-800 mb-2">
                                Aucune question dans cette section
                            </h4>
                            <p className="text-gray-600">
                                Cette section sera remplie avec des questions lors de la configuration.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {section.questions
                                .sort((a, b) => a.order - b.order)
                                .map((question, questionIndex) => {
                                    const isAnswered = responses[question.id] && responses[question.id].trim() !== '';
                                    const isRequired = question.required;

                                    return (
                                        <div
                                            key={question.id}
                                            className={`relative border rounded-lg p-6 transition-all duration-200 ${isAnswered
                                                ? 'border-green-200 bg-green-50'
                                                : isRequired
                                                    ? 'border-amber-200 bg-amber-50'
                                                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                                                }`}
                                        >
                                            {/* Indicateur visuel de statut */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${isAnswered
                                                ? 'bg-green-400'
                                                : isRequired
                                                    ? 'bg-amber-400'
                                                    : 'bg-gray-200'
                                                }`}></div>

                                            {/* Numéro et statut de la question */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-3 ${isAnswered
                                                        ? 'bg-green-100 text-green-800'
                                                        : isRequired
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {sectionIndex + 1}.{questionIndex + 1}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {isRequired && (
                                                            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                                                <AlertCircle size={12} className="mr-1" />
                                                                Obligatoire
                                                            </span>
                                                        )}
                                                        {isAnswered && (
                                                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                                <CheckCircle size={12} className="mr-1" />
                                                                Complétée
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Type de question */}
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                                    {questionTypes.find(qt =>
                                                        section.questions.filter(q => q.type === question.type).length > 0
                                                    )?.type.icon} {question.type}
                                                </span>
                                            </div>

                                            {/* Champ de question */}
                                            <QuestionField
                                                question={question}
                                                value={responses[question.id] || ''}
                                                onChange={(value) => onResponseChange(question.id, value)}
                                                disabled={disabled}
                                            />

                                            {/* Indicateur de progression */}
                                            {!disabled && (
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <span>
                                                            {isAnswered ? 'Réponse enregistrée' : 'En attente de réponse'}
                                                        </span>
                                                        {isAnswered && (
                                                            <span className="text-green-600 font-medium">
                                                                ✓ Complété
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    )}

                    {/* Résumé de la section */}
                    {section.questions.length > 0 && (
                        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                        {stats.isComplete ? (
                                            <CheckCircle className="text-green-600" size={20} />
                                        ) : (
                                            <Clock className="text-blue-600" size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">
                                            {stats.isComplete ? 'Section complétée' : 'Section en cours'}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {stats.answeredQuestions}/{stats.totalQuestions} questions répondues
                                            {stats.requiredQuestions > 0 && (
                                                <span className="ml-2">
                                                    • {stats.answeredRequiredQuestions}/{stats.requiredQuestions} obligatoires
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className={`text-lg font-bold ${stats.isComplete ? 'text-green-600' : 'text-blue-600'}`}>
                                        {stats.completionPercentage}%
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Progression
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}