'use client';

import { useEffect, useState } from 'react';
import { fetchJobOnboardingSteps, fetchTrainingModels, updateJobOnboardingStep } from '../action';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Save, RefreshCcw, XCircle, School, FileText, CheckCircle, ClipboardList } from 'lucide-react';



const JobOnboardingStepTypes = ['TRAINING', 'DOCUMENT', 'RESULT_REVIEW', 'QUIZZ'] as const;

const typeIcons: Record<string, JSX.Element> = {
    TRAINING: <School className="w-4 h-4 text-indigo-600" />,
    DOCUMENT: <FileText className="w-4 h-4 text-yellow-600" />,
    RESULT_REVIEW: <CheckCircle className="w-4 h-4 text-green-600" />,
    QUIZZ: <ClipboardList className="w-4 h-4 text-purple-600" />,
};

export default function OnboardingStepEditor({ jobOnboardingId, onBack }: { jobOnboardingId: number, onBack?: () => void }) {


    const [steps, setSteps] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);
    const [editingStepId, setEditingStepId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Record<number, Partial<any>>>({});

    const typeLabels: Record<string, string> = {
        TRAINING: 'Formation',
        DOCUMENT: 'Document',
        RESULT_REVIEW: 'Relecture des résultats',
        QUIZZ: 'Quizz',
    };


    useEffect(() => {
        if (jobOnboardingId) {
            loadSteps();
            loadModels();
        }
    }, [jobOnboardingId]);

    
    const loadSteps = async () => {
        const data = await fetchJobOnboardingSteps(jobOnboardingId);
        setSteps(data);
    };


    const loadModels = async () => {
        const data = await fetchTrainingModels();
        setModels(data);
    };

    const handleEdit = (stepId: number) => {
        setEditingStepId(stepId);
        const step = steps.find((s) => s.id === stepId);
        setFormData((prev) => ({ ...prev, [stepId]: { ...step } }));
    };

    const handleCancel = () => {
        setEditingStepId(null);
    };

    const handleSave = async (stepId: number) => {
        const data = formData[stepId];
        await updateJobOnboardingStep(stepId, data);
        setEditingStepId(null);
        loadSteps();
    };

    const handleChange = (stepId: number, key: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [stepId]: {
                ...prev[stepId],
                [key]: value,
            },
        }));
    };



    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-semibold">⚙️ Éditeur des étapes d'intégration</h2>
                <div className="flex gap-3">
                    {onBack && (
                        <Button
                            onClick={onBack}
                            className="flex items-center gap-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:border-gray-400 transition-all shadow-sm px-4 py-2 rounded-md"
                        >
                            <span className="transition-transform group-hover:-translate-x-1">←</span>
                            <span className="font-medium">Changer de profil</span>
                        </Button>

                    )}
                    <Button onClick={loadSteps} variant="outline">
                        <RefreshCcw className="w-4 h-4 mr-2" /> Rafraîchir
                    </Button>
                </div>
            </div>

            <div className="space-y-5">
                {steps.map((step) => (
                    <div key={step.id} className="p-6 bg-white rounded-lg border shadow-sm space-y-4">
                        {editingStepId === step.id ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Jour :</label>
                                        <Input
                                            type="number"
                                            value={formData[step.id]?.day ?? ''}
                                            onChange={(e) => handleChange(step.id, 'day', parseInt(e.target.value))}
                                            placeholder="Jour"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mois :</label>
                                        <Input
                                            type="number"
                                            value={formData[step.id]?.month ?? ''}
                                            onChange={(e) => handleChange(step.id, 'month', parseInt(e.target.value))}
                                            placeholder="Mois"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type :</label>
                                        <select
                                            value={formData[step.id]?.type ?? ''}
                                            onChange={(e) => handleChange(step.id, 'type', e.target.value)}
                                            className="border p-2 rounded w-full"
                                        >
                                            {JobOnboardingStepTypes.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Modèle de formation :</label>
                                        <select
                                            value={formData[step.id]?.trainingModelId ?? ''}
                                            onChange={(e) => handleChange(step.id, 'trainingModelId', parseInt(e.target.value))}
                                            className="border p-2 rounded w-full"
                                        >
                                            <option value="">Aucun modèle</option>
                                            {models.map((model) => (
                                                <option key={model.id} value={model.id}>{model.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>


                                <div className="flex gap-3 pt-4">
                                    <Button onClick={() => handleSave(step.id)} className="bg-green-600 hover:bg-green-700 text-white">
                                        <Save className="w-4 h-4 mr-2" /> Enregistrer
                                    </Button>
                                    <Button variant="ghost" onClick={handleCancel} className="text-red-600 hover:text-red-800">
                                        <XCircle className="w-4 h-4 mr-2" /> Annuler
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {typeIcons[step.type]}
                                        <span className="font-semibold text-gray-800">{typeLabels[step.type] ?? step.type}</span>
                                    </div>
                                    <p><span className="font-medium text-gray-600">Jour :</span> {step.day}</p>
                                    <p><span className="font-medium text-gray-600">Mois :</span> {step.month}</p>
                                    <p><span className="font-medium text-gray-600">Modèle :</span> {step.trainingModel?.name ?? '—'}</p>
                                </div>
                                <Button onClick={() => handleEdit(step.id)} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Pencil className="w-4 h-4 mr-2" /> Modifier
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
