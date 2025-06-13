'use client';

import React, { useState, useEffect } from 'react';
import { AnnualReviewQuestion } from './types';
import { AlertCircle, CheckCircle, FileText, Calendar, Hash, List, RadioButton, CheckSquare } from 'lucide-react';

interface QuestionFieldProps {
    question: AnnualReviewQuestion;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export default function QuestionField({ question, value, onChange, disabled = false }: QuestionFieldProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [characterCount, setCharacterCount] = useState(0);
    const [validationMessage, setValidationMessage] = useState<string>('');

    useEffect(() => {
        setCharacterCount(value?.length || 0);
        validateField();
    }, [value, question]);

    const validateField = () => {
        if (question.required && (!value || value.trim() === '')) {
            setValidationMessage('Cette question est obligatoire');
        } else if (question.type === 'NUMBER' && value && isNaN(Number(value))) {
            setValidationMessage('Veuillez entrer un nombre valide');
        } else if (question.type === 'DATE' && value && isNaN(Date.parse(value))) {
            setValidationMessage('Veuillez entrer une date valide');
        } else {
            setValidationMessage('');
        }
    };

    const getFieldIcon = () => {
        switch (question.type) {
            case 'TEXTAREA': return <FileText size={16} className="text-gray-400" />;
            case 'SELECT': return <List size={16} className="text-gray-400" />;
            case 'RADIO': return <RadioButton size={16} className="text-gray-400" />;
            case 'CHECKBOX': return <CheckSquare size={16} className="text-gray-400" />;
            case 'NUMBER': return <Hash size={16} className="text-gray-400" />;
            case 'DATE': return <Calendar size={16} className="text-gray-400" />;
            default: return <FileText size={16} className="text-gray-400" />;
        }
    };

    const getFieldTypeLabel = () => {
        const labels = {
            'TEXT': 'Texte court',
            'TEXTAREA': 'Texte long',
            'SELECT': 'Sélection',
            'RADIO': 'Choix unique',
            'CHECKBOX': 'Choix multiple',
            'NUMBER': 'Nombre',
            'DATE': 'Date'
        };
        return labels[question.type] || question.type;
    };

    const isValid = !validationMessage;
    const hasValue = value && value.trim() !== '';

    const renderField = () => {
        const baseClasses = `w-full transition-all duration-200 ${disabled
                ? 'bg-gray-50 cursor-not-allowed'
                : isFocused
                    ? 'ring-2 ring-blue-500 border-blue-500'
                    : hasValue
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
            } ${!isValid ? 'border-red-300 bg-red-50' : ''}`;

        switch (question.type) {
            case 'TEXTAREA':
                return (
                    <div className="relative">
                        <textarea
                            className={`${baseClasses} p-4 border rounded-lg resize-none focus:outline-none`}
                            rows={6}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Décrivez en détail la réponse de l'employé..."
                            disabled={disabled}
                            required={question.required}
                            maxLength={2000}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                            {characterCount}/2000
                        </div>
                    </div>
                );

            case 'SELECT':
                return (
                    <div className="relative">
                        <select
                            className={`${baseClasses} p-4 border rounded-lg focus:outline-none appearance-none pr-12`}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            disabled={disabled}
                            required={question.required}
                        >
                            <option value="">Sélectionnez une option...</option>
                            {question.options.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                );

            case 'RADIO':
                return (
                    <div className="space-y-3">
                        {question.options.map((option, index) => (
                            <label
                                key={index}
                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${disabled
                                        ? 'bg-gray-50 cursor-not-allowed'
                                        : value === option
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={option}
                                    checked={value === option}
                                    onChange={(e) => onChange(e.target.value)}
                                    disabled={disabled}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    required={question.required}
                                />
                                <span className={`ml-3 font-medium ${disabled ? 'text-gray-500' : value === option ? 'text-blue-800' : 'text-gray-700'}`}>
                                    {option}
                                </span>
                                {value === option && (
                                    <CheckCircle size={16} className="ml-auto text-blue-500" />
                                )}
                            </label>
                        ))}
                    </div>
                );

            case 'CHECKBOX':
                const selectedValues = value ? value.split(',').filter(v => v.trim()) : [];
                return (
                    <div className="space-y-3">
                        {question.options.map((option, index) => {
                            const isSelected = selectedValues.includes(option);
                            return (
                                <label
                                    key={index}
                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${disabled
                                            ? 'bg-gray-50 cursor-not-allowed'
                                            : isSelected
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        value={option}
                                        checked={isSelected}
                                        onChange={(e) => {
                                            const newValues = e.target.checked
                                                ? [...selectedValues, option]
                                                : selectedValues.filter(v => v !== option);
                                            onChange(newValues.join(','));
                                        }}
                                        disabled={disabled}
                                        className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    />
                                    <span className={`ml-3 font-medium ${disabled ? 'text-gray-500' : isSelected ? 'text-green-800' : 'text-gray-700'}`}>
                                        {option}
                                    </span>
                                    {isSelected && (
                                        <CheckCircle size={16} className="ml-auto text-green-500" />
                                    )}
                                </label>
                            );
                        })}
                        {selectedValues.length > 0 && (
                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                {selectedValues.length} option{selectedValues.length > 1 ? 's' : ''} sélectionnée{selectedValues.length > 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                );

            case 'NUMBER':
                return (
                    <div className="relative">
                        <input
                            type="number"
                            className={`${baseClasses} p-4 border rounded-lg focus:outline-none pl-12`}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Entrez un nombre..."
                            disabled={disabled}
                            required={question.required}
                            step="any"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                            <Hash size={16} className="text-gray-400" />
                        </div>
                    </div>
                );

            case 'DATE':
                return (
                    <div className="relative">
                        <input
                            type="date"
                            className={`${baseClasses} p-4 border rounded-lg focus:outline-none pl-12`}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            disabled={disabled}
                            required={question.required}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                            <Calendar size={16} className="text-gray-400" />
                        </div>
                    </div>
                );

            case 'TEXT':
            default:
                return (
                    <div className="relative">
                        <input
                            type="text"
                            className={`${baseClasses} p-4 border rounded-lg focus:outline-none`}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Entrez la réponse de l'employé..."
                            disabled={disabled}
                            required={question.required}
                            maxLength={500}
                        />
                        {question.type === 'TEXT' && (
                            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                                {characterCount}/500
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="space-y-3">
            {/* Label avec informations */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <label className="block text-gray-800 font-semibold text-lg leading-relaxed">
                        {question.question}
                        {question.required && <span className="text-red-500 ml-2">*</span>}
                    </label>

                    {/* Métadonnées de la question */}
                    <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {getFieldIcon()}
                            <span className="ml-1">{getFieldTypeLabel()}</span>
                        </span>

                        {question.required && (
                            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                <AlertCircle size={12} className="mr-1" />
                                Obligatoire
                            </span>
                        )}

                        {hasValue && (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <CheckCircle size={12} className="mr-1" />
                                Répondu
                            </span>
                        )}

                        {disabled && (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                Lecture seule
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Champ de saisie */}
            <div className="relative">
                {renderField()}

                {/* Indicateur de focus/état */}
                {!disabled && (
                    <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r transition-all duration-300 ${isFocused
                            ? 'w-full from-blue-500 to-purple-500'
                            : hasValue
                                ? 'w-1/2 from-green-400 to-emerald-500'
                                : 'w-0'
                        }`}></div>
                )}
            </div>

            {/* Messages de validation et d'aide */}
            <div className="space-y-2">
                {/* Message de validation */}
                {validationMessage && (
                    <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                        <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                        <span>{validationMessage}</span>
                    </div>
                )}

                {/* Message de succès */}
                {!validationMessage && hasValue && !disabled && (
                    <div className="flex items-center text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                        <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                        <span>Réponse enregistrée avec succès</span>
                    </div>
                )}

                {/* Aide contextuelle */}
                {!disabled && (
                    <div className="text-xs text-gray-500">
                        {question.type === 'TEXTAREA' && 'Conseil: Soyez détaillé dans votre réponse pour un meilleur suivi.'}
                        {question.type === 'SELECT' && 'Sélectionnez l\'option qui correspond le mieux à la situation.'}
                        {question.type === 'RADIO' && 'Choisissez une seule option parmi les propositions.'}
                        {question.type === 'CHECKBOX' && 'Vous pouvez sélectionner plusieurs options.'}
                        {question.type === 'NUMBER' && 'Entrez une valeur numérique (décimales autorisées).'}
                        {question.type === 'DATE' && 'Sélectionnez une date à l\'aide du calendrier.'}
                        {question.type === 'TEXT' && 'Réponse courte et concise recommandée.'}
                    </div>
                )}
            </div>

            {/* Barre de progression pour les questions longues */}
            {(question.type === 'TEXTAREA' || question.type === 'TEXT') && value && !disabled && (
                <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Longueur de la réponse</span>
                        <span className={characterCount > (question.type === 'TEXTAREA' ? 1800 : 450) ? 'text-amber-600 font-medium' : ''}>
                            {characterCount}/{question.type === 'TEXTAREA' ? 2000 : 500}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                            className={`h-1 rounded-full transition-all duration-300 ${characterCount > (question.type === 'TEXTAREA' ? 1800 : 450)
                                    ? 'bg-amber-400'
                                    : 'bg-blue-400'
                                }`}
                            style={{
                                width: `${Math.min(100, (characterCount / (question.type === 'TEXTAREA' ? 2000 : 500)) * 100)}%`
                            }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Aperçu pour les sélections multiples */}
            {question.type === 'CHECKBOX' && value && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Sélections actuelles :</h5>
                    <div className="flex flex-wrap gap-2">
                        {value.split(',').filter(v => v.trim()).map((selectedValue, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                            >
                                <CheckCircle size={12} className="mr-1" />
                                {selectedValue.trim()}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}