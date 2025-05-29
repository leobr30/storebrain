'use client';

import { useEffect, useState } from 'react';
import {
    fetchTrainingModels,
    updateTrainingModel,
    updateTrainingModelSubject,
    createTrainingModelSubject,
    deleteTrainingModelSubject,
} from '../action';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, FileEdit, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

type TrainingModelType = {
    id: number;
    name: string;
    tool: string;
    exercise: string;
    aide: string | null;
    subjects: {
        id: number;
        name: string;
    }[];
};

export default function TrainingModelEditor() {
    const [models, setModels] = useState<TrainingModelType[]>([]);
    const [newSubjects, setNewSubjects] = useState<Record<number, string>>({});

    useEffect(() => {
        fetchTrainingModels().then((data) => {
            const safeData = data.map((m: any) => ({
                ...m,
                subjects: m.subjects ?? [],
            }));
            setModels(safeData);
        });
    }, []);

    const handleModelChange = (id: number, key: string, value: string) => {
        setModels((prev) =>
            prev.map((m) => (m.id === id ? { ...m, [key]: value } : m))
        );
    };

    const handleSubjectChange = (
        modelId: number,
        subjectId: number,
        value: string
    ) => {
        setModels((prev) =>
            prev.map((model) => {
                if (model.id !== modelId) return model;
                return {
                    ...model,
                    subjects: model.subjects.map((sub) =>
                        sub.id === subjectId ? { ...sub, name: value } : sub
                    ),
                };
            })
        );
    };

    const handleSaveModel = (id: number, data: any) => {
        updateTrainingModel(id, data).then(() =>
            toast.success('Modèle mis à jour')
        );
    };

    const handleSaveSubject = async (id: number, name: string) => {
        await updateTrainingModelSubject(id, { name });
        toast.success('Sujet mis à jour');
        const updated = await fetchTrainingModels();
        setModels(updated);
    };

    const handleNewSubjectChange = (modelId: number, value: string) => {
        setNewSubjects((prev) => ({ ...prev, [modelId]: value }));
    };

    const handleAddSubject = async (modelId: number) => {
        const name = newSubjects[modelId];
        if (!name || name.trim() === '') {
            toast.error('Le nom du sujet est vide.');
            return;
        }
        await createTrainingModelSubject(modelId, name);
        toast.success('Sujet ajouté');
        const updated = await fetchTrainingModels();
        setModels(updated);
        setNewSubjects((prev) => ({ ...prev, [modelId]: '' }));
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Édition des modèles de formation</h1>

            {models.map((model) => (
                <Card key={model.id} className="border shadow-lg rounded-2xl p-6 space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold text-indigo-600">{model.name}</h2>
                        <p className="text-sm text-gray-500">ID modèle : {model.id}</p>
                    </div>

                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <Input
                                value={model.tool}
                                onChange={(e) => handleModelChange(model.id, 'tool', e.target.value)}
                                placeholder="Outil utilisé"
                            />
                            <Input
                                value={model.exercise}
                                onChange={(e) => handleModelChange(model.id, 'exercise', e.target.value)}
                                placeholder="Exercice à réaliser"
                            />
                            <Input
                                value={model.aide || ''}
                                onChange={(e) => handleModelChange(model.id, 'aide', e.target.value)}
                                placeholder="Aide ou ressources"
                            />
                        </div>

                        <div className="text-right">
                            <Button
                                onClick={() =>
                                    handleSaveModel(model.id, {
                                        tool: model.tool,
                                        exercise: model.exercise,
                                        aide: model.aide,
                                    })
                                }
                            >
                                <Pencil className="w-4 h-4 mr-2" /> Sauvegarder le modèle
                            </Button>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-md font-medium text-gray-700 mb-2">Sujets de formation</h3>
                            <div className="space-y-2">
                                {Array.isArray(model.subjects) &&
                                    model.subjects.map((subject) => (
                                        <div
                                            key={subject.id}
                                            className="flex items-center gap-2 bg-gray-50 p-3 rounded-md border"
                                        >
                                            <Input
                                                className="flex-1"
                                                value={subject.name}
                                                onChange={(e) =>
                                                    handleSubjectChange(model.id, subject.id, e.target.value)
                                                }
                                            />
                                            <Button
                                                variant="outline"
                                                onClick={() => handleSaveSubject(subject.id, subject.name)}
                                            >
                                                <FileEdit className="w-4 h-4 mr-1" />
                                                Modifier
                                            </Button>

                                            <Button
                                                variant="destructive"
                                                onClick={async () => {
                                                    await deleteTrainingModelSubject(subject.id);
                                                    toast.success('Sujet supprimé');
                                                    const updated = await fetchTrainingModels();
                                                    setModels(updated);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>

                                        </div>
                                    ))}

                                <div className="flex items-center gap-2 mt-4">
                                    <Input
                                        placeholder="Nouveau sujet"
                                        value={newSubjects[model.id] || ''}
                                        onChange={(e) => handleNewSubjectChange(model.id, e.target.value)}
                                    />
                                    <Button variant="secondary" onClick={() => handleAddSubject(model.id)}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Ajouter
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
