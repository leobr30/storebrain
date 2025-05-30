'use client';

import { useState } from 'react';
import {
    updateTrainingModel,
    updateTrainingModelSubject,
    createTrainingModelSubject,
    deleteTrainingModelSubject,
} from '../action';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileEdit, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface Subject {
    id: number;
    name: string;
    aide?: string | null;
}

interface TrainingModelType {
    id: number;
    name: string;
    tool: string;
    exercise: string;
    subjects: Subject[];
}

interface Props {
    model: TrainingModelType;
    open: boolean;
    onClose: () => void;
    onRefresh: () => void;
}

export default function TrainingModelDialog({ model, open, onClose, onRefresh }: Props) {
    const [formData, setFormData] = useState({ tool: model.tool, exercise: model.exercise });
    const [subjects, setSubjects] = useState<Subject[]>(model.subjects);
    const [newSubject, setNewSubject] = useState('');

    const handleFieldChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubjectChange = (subjectId: number, field: 'name' | 'aide', value: string) => {
        setSubjects((prev) => prev.map((s) => (s.id === subjectId ? { ...s, [field]: value } : s)));
    };

    const handleSaveModel = async () => {
        await updateTrainingModel(model.id, formData);
        toast.success('Modèle mis à jour');
        onRefresh();
    };

    const handleSaveSubject = async (subject: Subject) => {
        await updateTrainingModelSubject(subject.id, {
            name: subject.name,
            aide: subject.aide ?? '',
        });
        toast.success('Sujet mis à jour');
        onRefresh();
    };

    const handleDeleteSubject = async (subjectId: number) => {
        await deleteTrainingModelSubject(subjectId);
        toast.success('Sujet supprimé');
        onRefresh();
    };

    const handleAddSubject = async () => {
        if (!newSubject.trim()) {
            toast.error('Nom de sujet requis');
            return;
        }
        await createTrainingModelSubject(model.id, newSubject);
        toast.success('Sujet ajouté');
        setNewSubject('');
        onRefresh();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Édition : {model.name}</DialogTitle>
                </DialogHeader>

                <section className="space-y-6 mt-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Sujets</h3>
                        <div className="space-y-4">
                            {subjects.map((subject) => (
                                <div key={subject.id} className="bg-muted p-4 rounded-xl border shadow-sm space-y-2">
                                    <Input
                                        value={subject.name}
                                        placeholder="Nom du sujet"
                                        onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                                    />
                                    <Textarea
                                        value={subject.aide ?? ''}
                                        onChange={(e) => handleSubjectChange(subject.id, 'aide', e.target.value)}
                                        placeholder="Texte d'aide (facultatif)"
                                        rows={2}
                                    />
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button variant="outline" onClick={() => handleSaveSubject(subject)}>
                                            <FileEdit className="w-4 h-4 mr-1" /> Enregistrer
                                        </Button>
                                        <Button variant="destructive" onClick={() => handleDeleteSubject(subject.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <Input
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                placeholder="Nouveau sujet"
                            />
                            <Button variant="secondary" onClick={handleAddSubject}>
                                <Plus className="w-4 h-4 mr-1" /> Ajouter
                            </Button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Informations générales</h3>
                        <div className="space-y-4">
                            <Textarea
                                value={formData.tool}
                                onChange={(e) => handleFieldChange('tool', e.target.value)}
                                placeholder="Outil utilisé"
                                rows={3}
                            />
                            <Textarea
                                value={formData.exercise}
                                onChange={(e) => handleFieldChange('exercise', e.target.value)}
                                placeholder="Description de l'exercice"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose}>Annuler</Button>
                        <Button onClick={handleSaveModel} className="bg-primary text-white">Enregistrer</Button>
                    </div>
                </section>
            </DialogContent>
        </Dialog>
    );
}
