'use client';

import React, { useState, useEffect } from 'react';
import { Save, Send, Loader2, AlertCircle, CheckCircle, Clock, User, Calendar, ArrowLeft, FileText, Eye, AlertTriangle, ChevronRight } from 'lucide-react';
import EntretienSection from './EntretienSection';
import { AnnualReviewSection, AnnualReview } from './types';
import { Employee } from '../../types';
import {
    createAnnualReview,
    updateAnnualReview,
    submitAnnualReview,
    getAnnualReviewSections
} from '../../actions';

interface EntretienFormProps {
    employee: Employee;
    existingReview?: AnnualReview;
    onCancel: () => void;
    onSave: () => void;
    companyId: number;
}

export default function EntretienForm({
    employee,
    existingReview,
    onCancel,
    onSave,
    companyId
}: EntretienFormProps) {
    const [sections, setSections] = useState<AnnualReviewSection[]>([]);
    const [responses, setResponses] = useState<Record<number, string>>({});
    const [reviewId, setReviewId] = useState<number | null>(existingReview?.id || null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        loadSections();
        if (existingReview) {
            const responsesMap: Record<number, string> = {};
            existingReview.responses.forEach(response => {
                responsesMap[response.questionId] = response.answer;
            });
            setResponses(responsesMap);
        }
    }, [existingReview]);

    const loadSections = async () => {
        try {
            setLoading(true);
            const data = await getAnnualReviewSections();
            setSections(data);
        } catch (err) {
            setError('Erreur lors du chargement des sections');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResponseChange = (questionId: number, value: string) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            const responsesArray = Object.entries(responses).map(([questionId, answer]) => ({
                questionId: parseInt(questionId),
                answer
            }));

            if (reviewId) {
                await updateAnnualReview(reviewId, { responses: responsesArray });
            } else {
                const newReview = await createAnnualReview({
                    employeeId: employee.id,
                    companyId
                });
                setReviewId(newReview.id);
                await updateAnnualReview(newReview.id, { responses: responsesArray });
            }

            // Notification de succès
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
            notification.innerHTML = `
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                Brouillon sauvegardé !
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);

        } catch (err) {
            setError('Erreur lors de la sauvegarde');
            console.error('Erreur:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        try {
            // Validation
            const allRequiredAnswered = sections.every(section =>
                section.questions
                    .filter(q => q.required)
                    .every(q => responses[q.id] && responses[q.id].trim() !== '')
            );

            if (!allRequiredAnswered) {
                setError('Veuillez répondre à toutes les questions obligatoires');
                return;
            }

            setSaving(true);
            setError(null);

            // Sauvegarder d'abord si nécessaire
            if (!reviewId) {
                await handleSave();
            }

            // Puis soumettre
            if (reviewId) {
                await submitAnnualReview(reviewId);

                // Notification de succès
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
                notification.innerHTML = `
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    Entretien soumis avec succès !
                `;
                document.body.appendChild(notification);
                setTimeout(() => {
                    notification.style.transform = 'translateX(100%)';
                    setTimeout(() => document.body.removeChild(notification), 300);
                }, 3000);

                onSave();
            }
        } catch (err) {
            setError('Erreur lors de la soumission');
            console.error('Erreur:', err);
        } finally {
            setSaving(false);
        }
    };

    const getCompletionStats = () => {
        const totalQuestions = sections.reduce((acc, section) => acc + section.questions.length, 0);
        const answeredQuestions = Object.values(responses).filter(response => response && response.trim() !== '').length;
        const requiredQuestions = sections.reduce((acc, section) =>
            acc + section.questions.filter(q => q.required).length, 0
        );
        const answeredRequiredQuestions = sections.reduce((acc, section) =>
            acc + section.questions.filter(q => q.required && responses[q.id] && responses[q.id].trim() !== '').length, 0
        );

        return {
            totalQuestions,
            answeredQuestions,
            requiredQuestions,
            answeredRequiredQuestions,
            completionPercentage: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0,
            requiredCompletionPercentage: requiredQuestions > 0 ? Math.round((answeredRequiredQuestions / requiredQuestions) * 100) : 100
        };
    };

    const stats = getCompletionStats();
    const isReadOnly = existingReview?.status === 'COMPLETED';

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Chargement du formulaire</h3>
                    <p className="text-gray-600">Préparation de l'entretien annuel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header avec informations employé */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={onCancel}
                                className="mr-4 p-2 text-blue-200 hover:text-white hover:bg-blue-600 rounded-lg transition-colors"
                                title="Retour"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold flex items-center">
                                    <FileText className="mr-3" size={32} />
                                    Entretien Annuel
                                </h1>
                                <div className="flex items-center mt-2 space-x-4">
                                    <div className="flex items-center">
                                        <User className="mr-2" size={16} />
                                        <span className="text-lg font-medium">{employee.name}</span>
                                    </div>
                                    <span className="text-blue-200">•</span>
                                    <span className="text-blue-100">{employee.job?.name}</span>
                                    {employee.zone && (
                                        <>
                                            <span className="text-blue-200">•</span>
                                            <span className="text-blue-100">{employee.zone}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center space-x-4">
                            {isReadOnly && (
                                <div className="flex items-center bg-green-500 bg-opacity-20 text-green-100 px-4 py-2 rounded-lg">
                                    <CheckCircle className="mr-2" size={20} />
                                    <span className="font-medium">Complété</span>
                                </div>
                            )}
                            {existingReview?.reviewDate && (
                                <div className="flex items-center text-blue-100">
                                    <Calendar className="mr-2" size={16} />
                                    <span>{new Date(existingReview.reviewDate).toLocaleDateString('fr-FR')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Barre de progression et statistiques */}
                <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Progression de l'entretien</h3>
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Eye className="mr-2" size={16} />
                            {showPreview ? 'Masquer aperçu' : 'Voir aperçu'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-600 text-sm font-medium">Questions répondues</p>
                                    <p className="text-2xl font-bold text-blue-800">
                                        {stats.answeredQuestions}/{stats.totalQuestions}
                                    </p>
                                </div>
                                <div className="text-blue-500">
                                    <FileText size={32} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-600 text-sm font-medium">Questions obligatoires</p>
                                    <p className="text-2xl font-bold text-green-800">
                                        {stats.answeredRequiredQuestions}/{stats.requiredQuestions}
                                    </p>
                                </div>
                                <div className="text-green-500">
                                    <AlertCircle size={32} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-600 text-sm font-medium">Avancement global</p>
                                    <p className="text-2xl font-bold text-purple-800">{stats.completionPercentage}%</p>
                                </div>
                                <div className="text-purple-500">
                                    <Clock size={32} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progression globale</span>
                            <span>{stats.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${stats.completionPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Navigation par sections */}
                    <div className="flex flex-wrap gap-2">
                        {sections.map((section, index) => {
                            const sectionQuestions = section.questions.length;
                            const sectionAnswered = section.questions.filter(q => responses[q.id] && responses[q.id].trim() !== '').length;
                            const sectionComplete = sectionAnswered === sectionQuestions;

                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setCurrentSection(index)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${currentSection === index
                                        ? 'bg-blue-600 text-white'
                                        : sectionComplete
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <span className="mr-2">{index + 1}.</span>
                                    <span className="truncate max-w-32">{section.title}</span>
                                    {sectionComplete && (
                                        <CheckCircle size={16} className="ml-2" />
                                    )}
                                    <span className="ml-2 text-xs opacity-75">
                                        {sectionAnswered}/{sectionQuestions}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center">
                            <AlertTriangle className="text-red-500 mr-3" size={20} />
                            <div>
                                <h3 className="text-red-800 font-medium">Attention</h3>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message d'information pour entretien complété */}
                {isReadOnly && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center">
                            <CheckCircle className="text-green-500 mr-3" size={20} />
                            <div>
                                <h3 className="text-green-800 font-medium">Entretien complété</h3>
                                <p className="text-green-700">Cet entretien a été finalisé et ne peut plus être modifié.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Aperçu des sections si demandé */}
                {showPreview && (
                    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Aperçu des réponses</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {sections.map((section, sectionIndex) => (
                                <div key={section.id} className="border-l-4 border-blue-200 pl-4">
                                    <h4 className="font-medium text-gray-800 mb-2">{section.title}</h4>
                                    <div className="space-y-2">
                                        {section.questions.map((question, questionIndex) => (
                                            <div key={question.id} className="text-sm">
                                                <p className="text-gray-600 mb-1">
                                                    {sectionIndex + 1}.{questionIndex + 1} {question.question}
                                                </p>
                                                <p className="text-gray-800 bg-gray-50 p-2 rounded">
                                                    {responses[question.id] || <em className="text-gray-400">Pas de réponse</em>}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sections du formulaire */}
                <div className="space-y-6">
                    {sections.length > 0 && sections[currentSection] && (
                        <EntretienSection
                            section={sections[currentSection]}
                            responses={responses}
                            onResponseChange={handleResponseChange}
                            disabled={isReadOnly}
                            sectionIndex={currentSection}
                        />
                    )}
                </div>

                {/* Navigation entre sections */}
                {sections.length > 1 && (
                    <div className="mt-8 flex justify-between items-center bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <button
                            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                            disabled={currentSection === 0}
                            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Section précédente
                        </button>

                        <span className="text-sm text-gray-600">
                            Section {currentSection + 1} sur {sections.length}
                        </span>

                        <button
                            onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                            disabled={currentSection === sections.length - 1}
                            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Section suivante
                            <ChevronRight size={16} className="ml-2" />
                        </button>
                    </div>
                )}

                {/* Boutons d'action */}
                {!isReadOnly && (
                    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-gray-600">
                                {stats.requiredCompletionPercentage < 100 ? (
                                    <div className="flex items-center text-amber-600">
                                        <AlertTriangle size={16} className="mr-2" />
                                        {stats.requiredQuestions - stats.answeredRequiredQuestions} question{stats.requiredQuestions - stats.answeredRequiredQuestions > 1 ? 's' : ''} obligatoire{stats.requiredQuestions - stats.answeredRequiredQuestions > 1 ? 's' : ''} restante{stats.requiredQuestions - stats.answeredRequiredQuestions > 1 ? 's' : ''}
                                    </div>
                                ) : (
                                    <div className="flex items-center text-green-600">
                                        <CheckCircle size={16} className="mr-2" />
                                        Toutes les questions obligatoires sont complétées
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onCancel}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                    disabled={saving}
                                >
                                    Annuler
                                </button>

                                <button
                                    onClick={handleSave}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center font-medium disabled:opacity-50"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <Loader2 className="animate-spin mr-2" size={20} />
                                    ) : (
                                        <Save className="mr-2" size={20} />
                                    )}
                                    Sauvegarder le brouillon
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center font-medium shadow-md hover:shadow-lg disabled:opacity-50"
                                    disabled={saving || stats.requiredCompletionPercentage < 100}
                                >
                                    {saving ? (
                                        <Loader2 className="animate-spin mr-2" size={20} />
                                    ) : (
                                        <Send className="mr-2" size={20} />
                                    )}
                                    Finaliser l'entretien
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer avec informations utiles */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                <FileText size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800">Conseils pour l'entretien</h4>
                                <p className="text-gray-600 text-sm">
                                    Sauvegardez régulièrement votre progression. Les questions marquées d'un * sont obligatoires.
                                </p>
                            </div>
                        </div>
                        {!isReadOnly && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                ) : (
                                    <Save size={16} className="mr-2" />
                                )}
                                Sauvegarder
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}