"use client"

import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, Save, X, ChevronUp, ChevronDown, AlertCircle, Loader2, GripVertical, Eye, EyeOff, Copy, FileText, Users, Calendar } from 'lucide-react';
import { getAnnualReviewSections } from '@/features/employee-area/actions';
import { updateAnnualReviewSections } from '../action';

// Types
type QuestionType = "TEXT" | "TEXTAREA" | "SELECT" | "RADIO" | "CHECKBOX" | "NUMBER" | "DATE";

interface AnnualReviewQuestion {
    id?: number;
    sectionId?: number;
    question: string;
    type: QuestionType;
    options: string[];
    order: number;
    required: boolean;
}

interface AnnualReviewSection {
    id?: number;
    title: string;
    order: number;
    questions: AnnualReviewQuestion[];
}

// Composant pour l'aperçu d'une question
const QuestionPreview: React.FC<{ question: AnnualReviewQuestion }> = ({ question }) => {
    const renderPreview = () => {
        switch (question.type) {
            case 'TEXT':
                return <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" disabled placeholder="Réponse courte..." />;
            case 'TEXTAREA':
                return <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" rows={3} disabled placeholder="Réponse détaillée..." />;
            case 'SELECT':
                return (
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" disabled>
                        <option>Sélectionnez une option...</option>
                        {question.options.map((option, i) => (
                            <option key={i}>{option}</option>
                        ))}
                    </select>
                );
            case 'RADIO':
                return (
                    <div className="space-y-2">
                        {question.options.map((option, i) => (
                            <label key={i} className="flex items-center">
                                <input type="radio" name={`preview-${question.order}`} className="mr-2" disabled />
                                <span className="text-gray-600">{option}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'CHECKBOX':
                return (
                    <div className="space-y-2">
                        {question.options.map((option, i) => (
                            <label key={i} className="flex items-center">
                                <input type="checkbox" className="mr-2" disabled />
                                <span className="text-gray-600">{option}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'NUMBER':
                return <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" disabled placeholder="0" />;
            case 'DATE':
                return <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" disabled />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <Eye size={16} className="mr-2 text-blue-500" />
                Aperçu de la question
            </h4>
            <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderPreview()}
            </div>
        </div>
    );
};

// Composant pour éditer une question avec design amélioré
const QuestionEditor: React.FC<{
    question: AnnualReviewQuestion;
    onUpdate: (question: AnnualReviewQuestion) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
}> = ({ question, onUpdate, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) => {
    const [isEditing, setIsEditing] = useState(!question.id);
    const [showPreview, setShowPreview] = useState(false);
    const [editedQuestion, setEditedQuestion] = useState(question);
    const [newOption, setNewOption] = useState('');

    const handleSave = () => {
        onUpdate(editedQuestion);
        setIsEditing(false);
    };

    const handleAddOption = () => {
        if (newOption.trim()) {
            setEditedQuestion({
                ...editedQuestion,
                options: [...editedQuestion.options, newOption.trim()]
            });
            setNewOption('');
        }
    };

    const handleRemoveOption = (index: number) => {
        setEditedQuestion({
            ...editedQuestion,
            options: editedQuestion.options.filter((_, i) => i !== index)
        });
    };

    const handleDuplicateQuestion = () => {
        const duplicatedQuestion = {
            ...editedQuestion,
            question: `${editedQuestion.question} (Copie)`,
            order: editedQuestion.order + 1
        };
        onUpdate(duplicatedQuestion);
    };

    const questionTypes: { value: QuestionType; label: string; icon: string }[] = [
        { value: 'TEXT', label: 'Texte court', icon: '📝' },
        { value: 'TEXTAREA', label: 'Texte long', icon: '📄' },
        { value: 'SELECT', label: 'Liste déroulante', icon: '📋' },
        { value: 'RADIO', label: 'Choix unique', icon: '🔘' },
        { value: 'CHECKBOX', label: 'Choix multiple', icon: '☑️' },
        { value: 'NUMBER', label: 'Nombre', icon: '🔢' },
        { value: 'DATE', label: 'Date', icon: '📅' }
    ];

    if (!isEditing) {
        return (
            <div className="group relative">
                {/* Poignée de glissement */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-l-lg group-hover:bg-blue-400 transition-colors"></div>

                <div className="border border-gray-200 rounded-lg p-4 ml-2 bg-white hover:shadow-md transition-all duration-200 group-hover:border-blue-300">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">
                                    {questionTypes.find(t => t.value === question.type)?.icon}
                                </span>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                    {questionTypes.find(t => t.value === question.type)?.label}
                                </span>
                                {question.required && (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                        Obligatoire
                                    </span>
                                )}
                            </div>
                            <p className="font-medium text-gray-800 mb-1">{question.question}</p>
                            {(question.type === 'SELECT' || question.type === 'RADIO' || question.type === 'CHECKBOX') && (
                                <p className="text-xs text-gray-500">
                                    {question.options.length} option{question.options.length > 1 ? 's' : ''} disponible{question.options.length > 1 ? 's' : ''}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Aperçu"
                            >
                                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button
                                onClick={handleDuplicateQuestion}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Dupliquer"
                            >
                                <Copy size={16} />
                            </button>
                            <div className="flex border border-gray-200 rounded-lg">
                                <button
                                    onClick={onMoveUp}
                                    disabled={!canMoveUp}
                                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 hover:bg-gray-50 rounded-l-lg transition-colors"
                                    title="Monter"
                                >
                                    <ChevronUp size={16} />
                                </button>
                                <button
                                    onClick={onMoveDown}
                                    disabled={!canMoveDown}
                                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 hover:bg-gray-50 rounded-r-lg transition-colors"
                                    title="Descendre"
                                >
                                    <ChevronDown size={16} />
                                </button>
                            </div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Modifier"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={onDelete}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {showPreview && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <QuestionPreview question={question} />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="border-2 border-blue-300 rounded-xl p-6 ml-2 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-blue-800 flex items-center">
                    <Edit2 size={18} className="mr-2" />
                    Modification de la question
                </h4>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${showPreview
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                            }`}
                    >
                        {showPreview ? 'Masquer aperçu' : 'Voir aperçu'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Question
                        </label>
                        <textarea
                            value={editedQuestion.question}
                            onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Entrez votre question..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Type de question
                            </label>
                            <select
                                value={editedQuestion.type}
                                onChange={(e) => setEditedQuestion({ ...editedQuestion, type: e.target.value as QuestionType })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {questionTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.icon} {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Question obligatoire
                            </label>
                            <div className="flex gap-3 pt-3">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name={`required-${editedQuestion.order}`}
                                        checked={editedQuestion.required}
                                        onChange={() => setEditedQuestion({ ...editedQuestion, required: true })}
                                        className="mr-2 text-blue-600"
                                    />
                                    <span className="text-sm">Oui</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name={`required-${editedQuestion.order}`}
                                        checked={!editedQuestion.required}
                                        onChange={() => setEditedQuestion({ ...editedQuestion, required: false })}
                                        className="mr-2 text-blue-600"
                                    />
                                    <span className="text-sm">Non</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {(editedQuestion.type === 'SELECT' || editedQuestion.type === 'RADIO' || editedQuestion.type === 'CHECKBOX') && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Options de réponse
                            </label>
                            <div className="space-y-2">
                                {editedQuestion.options.map((option, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <GripVertical size={16} className="text-gray-400" />
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => {
                                                const newOptions = [...editedQuestion.options];
                                                newOptions[index] = e.target.value;
                                                setEditedQuestion({ ...editedQuestion, options: newOptions });
                                            }}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={() => handleRemoveOption(index)}
                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2 pt-2">
                                    <div className="w-4"></div>
                                    <input
                                        type="text"
                                        value={newOption}
                                        onChange={(e) => setNewOption(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                                        placeholder="Nouvelle option..."
                                        className="flex-1 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                                    />
                                    <button
                                        onClick={handleAddOption}
                                        disabled={!newOption.trim()}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 transition-colors"
                                    >
                                        Ajouter
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {showPreview && (
                    <div>
                        <QuestionPreview question={editedQuestion} />
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-blue-200">
                <button
                    onClick={() => {
                        setEditedQuestion(question);
                        setIsEditing(false);
                        setShowPreview(false);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                    Annuler
                </button>
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors"
                >
                    <Save size={16} className="mr-2" />
                    Enregistrer
                </button>
            </div>
        </div>
    );
};

// Composant pour éditer une section avec design amélioré
const SectionEditor: React.FC<{
    section: AnnualReviewSection;
    onUpdate: (section: AnnualReviewSection) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
}> = ({ section, onUpdate, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) => {
    const [isEditingTitle, setIsEditingTitle] = useState(!section.id);
    const [editedTitle, setEditedTitle] = useState(section.title);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleUpdateTitle = () => {
        onUpdate({ ...section, title: editedTitle });
        setIsEditingTitle(false);
    };

    const handleAddQuestion = () => {
        const newQuestion: AnnualReviewQuestion = {
            question: '',
            type: 'TEXT',
            options: [],
            order: section.questions.length + 1,
            required: true
        };
        onUpdate({
            ...section,
            questions: [...section.questions, newQuestion]
        });
    };

    const handleUpdateQuestion = (index: number, updatedQuestion: AnnualReviewQuestion) => {
        const newQuestions = [...section.questions];
        newQuestions[index] = updatedQuestion;
        onUpdate({ ...section, questions: newQuestions });
    };

    const handleDeleteQuestion = (index: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
            const newQuestions = section.questions.filter((_, i) => i !== index);
            newQuestions.forEach((q, i) => q.order = i + 1);
            onUpdate({ ...section, questions: newQuestions });
        }
    };

    const moveQuestion = (index: number, direction: 'up' | 'down') => {
        const newQuestions = [...section.questions];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
        newQuestions.forEach((q, i) => q.order = i + 1);
        onUpdate({ ...section, questions: newQuestions });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            {/* En-tête de section */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center flex-1">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-4"></div>
                    {isEditingTitle ? (
                        <div className="flex items-center gap-3 flex-1">
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="flex-1 px-4 py-2 text-xl font-semibold border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                            <button
                                onClick={handleUpdateTitle}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            >
                                <Save size={20} />
                            </button>
                            <button
                                onClick={() => {
                                    setEditedTitle(section.title);
                                    setIsEditingTitle(false);
                                }}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-800">
                                {section.title}
                            </h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {section.questions.length} question{section.questions.length > 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={() => setIsEditingTitle(true)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        title={isCollapsed ? "Développer" : "Réduire"}
                    >
                        {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    </button>
                    <div className="flex border border-gray-200 rounded-lg">
                        <button
                            onClick={onMoveUp}
                            disabled={!canMoveUp}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 hover:bg-gray-50 rounded-l-lg transition-colors"
                            title="Monter la section"
                        >
                            <ChevronUp size={20} />
                        </button>
                        <button
                            onClick={onMoveDown}
                            disabled={!canMoveDown}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 hover:bg-gray-50 rounded-r-lg transition-colors"
                            title="Descendre la section"
                        >
                            <ChevronDown size={20} />
                        </button>
                    </div>
                    <button
                        onClick={onDelete}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer la section"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {!isCollapsed && (
                <>
                    {/* Questions */}
                    <div className="space-y-4">
                        {section.questions.map((question, index) => (
                            <QuestionEditor
                                key={index}
                                question={question}
                                onUpdate={(q) => handleUpdateQuestion(index, q)}
                                onDelete={() => handleDeleteQuestion(index)}
                                onMoveUp={() => moveQuestion(index, 'up')}
                                onMoveDown={() => moveQuestion(index, 'down')}
                                canMoveUp={index > 0}
                                canMoveDown={index < section.questions.length - 1}
                            />
                        ))}
                    </div>

                    {/* Bouton d'ajout de question */}
                    <button
                        onClick={handleAddQuestion}
                        className="mt-6 w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all duration-200 group"
                    >
                        <Plus size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                        Ajouter une question
                    </button>
                </>
            )}
        </div>
    );
};

// Composant de statistiques
const StatsCard: React.FC<{ sections: AnnualReviewSection[] }> = ({ sections }) => {
    const totalQuestions = sections.reduce((acc, section) => acc + section.questions.length, 0);
    const requiredQuestions = sections.reduce((acc, section) =>
        acc + section.questions.filter(q => q.required).length, 0
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm font-medium">Sections</p>
                        <p className="text-3xl font-bold">{sections.length}</p>
                    </div>
                    <FileText size={32} className="text-blue-200" />
                </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-green-100 text-sm font-medium">Questions</p>
                        <p className="text-3xl font-bold">{totalQuestions}</p>
                    </div>
                    <Users size={32} className="text-green-200" />
                </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-orange-100 text-sm font-medium">Obligatoires</p>
                        <p className="text-3xl font-bold">{requiredQuestions}</p>
                    </div>
                    <AlertCircle size={32} className="text-orange-200" />
                </div>
            </div>
        </div>
    );
};

// Page principale avec toutes les améliorations
export default function RdvAnnuelAdminPage() {
    const [sections, setSections] = useState<AnnualReviewSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadSections();
    }, []);

    const loadSections = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const data = await getAnnualReviewSections();
            setSections(data);
        } catch (err) {
            setError('Erreur lors du chargement des sections');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSection = () => {
        const newSection: AnnualReviewSection = {
            title: 'Nouvelle section',
            order: sections.length + 1,
            questions: []
        };
        setSections([...sections, newSection]);
        setHasChanges(true);
    };

    const handleUpdateSection = (index: number, updatedSection: AnnualReviewSection) => {
        const newSections = [...sections];
        newSections[index] = updatedSection;
        setSections(newSections);
        setHasChanges(true);
    };

    const handleDeleteSection = (index: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette section et toutes ses questions ?')) {
            const newSections = sections.filter((_, i) => i !== index);
            newSections.forEach((s, i) => s.order = i + 1);
            setSections(newSections);
            setHasChanges(true);
        }
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
        newSections.forEach((s, i) => s.order = i + 1);
        setSections(newSections);
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            await updateAnnualReviewSections(sections);
            setHasChanges(false);

            // Notification de succès plus élégante
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
            notification.innerHTML = `
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                Configuration sauvegardée avec succès !
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);

        } catch (err) {
            setError('Erreur lors de la sauvegarde');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600 font-medium">Chargement de la configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Header avec gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold flex items-center mb-2">
                                <Settings className="mr-4 text-blue-200" size={40} />
                                Configuration des RDV Annuels
                            </h1>
                            <p className="text-blue-100 text-lg">
                                Créez et personnalisez le formulaire d'entretien annuel de vos collaborateurs
                            </p>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            <Calendar size={64} className="text-blue-200 opacity-50" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Statistiques */}
                <StatsCard sections={sections} />

                {/* Message d'erreur avec design amélioré */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center">
                            <AlertCircle className="text-red-500 mr-3" size={20} />
                            <div>
                                <h3 className="text-red-800 font-medium">Erreur</h3>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Barre d'actions améliorée */}
                <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleAddSection}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 flex items-center font-medium shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                <Plus size={20} className="mr-2" />
                                Ajouter une section
                            </button>
                        </div>

                        {hasChanges && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                                    <AlertCircle size={20} className="mr-2" />
                                    <span className="font-medium">Modifications non sauvegardées</span>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2" size={20} />
                                            Sauvegarde...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} className="mr-2" />
                                            Sauvegarder les modifications
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contenu principal */}
                {sections.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText size={48} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Aucune section créée
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Commencez par créer votre première section pour structurer le formulaire d'entretien annuel.
                            </p>
                            <button
                                onClick={handleAddSection}
                                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                Créer la première section
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {sections.map((section, index) => (
                            <SectionEditor
                                key={index}
                                section={section}
                                onUpdate={(s) => handleUpdateSection(index, s)}
                                onDelete={() => handleDeleteSection(index)}
                                onMoveUp={() => moveSection(index, 'up')}
                                onMoveDown={() => moveSection(index, 'down')}
                                canMoveUp={index > 0}
                                canMoveDown={index < sections.length - 1}
                            />
                        ))}
                    </div>
                )}

                {/* Footer avec informations utiles */}
                {sections.length > 0 && (
                    <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                    <Settings size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">Configuration terminée ?</h4>
                                    <p className="text-gray-600 text-sm">
                                        N'oubliez pas de sauvegarder vos modifications avant de quitter la page.
                                    </p>
                                </div>
                            </div>
                            {hasChanges && (
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors disabled:opacity-50"
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
                )}
            </div>
        </div>
    );
}