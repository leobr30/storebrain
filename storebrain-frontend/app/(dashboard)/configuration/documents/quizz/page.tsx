'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash, FileEdit, Save, User, XCircle, Upload, ArrowUp, ArrowDown, Copy } from 'lucide-react';
import { AssignUserDialog } from '@/features/configuring/documents/components/AssignUserDialog';
import { createQuizz, fetchAllEmployees } from '../action';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

interface Employee {
    id: string;
    name: string;
}

interface Question {
    id: string;
    text: string;
    imageUrl?: string;
}

interface Section {
    id: string;
    title: string;
    questions: Question[];
}

interface QuizzPageProps {
    jobOnboardingId: number;
}

export default function QuizzPage({ }: QuizzPageProps) {
    const { data: session } = useSession();
    const createdById = session?.user?.id;

    const [title, setTitle] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [isAssignUserDialogOpen, setIsAssignUserDialogOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

    const [sections, setSections] = useState<Section[]>([
        {
            id: uuidv4(),
            title: '',
            questions: [
                {
                    id: uuidv4(),
                    text: '',
                },
            ],
        },
    ]);

    const router = useRouter();

    // Auto-sauvegarde en brouillon
    useEffect(() => {
        const timer = setTimeout(() => {
            if (title.trim() || sections.some(s => s.title.trim() || s.questions.some(q => q.text.trim()))) {
                setAutoSaveStatus('saving');
                localStorage.setItem('quiz_draft', JSON.stringify({ title, sections, selectedEmployeeId }));
                setTimeout(() => setAutoSaveStatus('saved'), 1000);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [title, sections, selectedEmployeeId]);

    const [draftProposed, setDraftProposed] = useState(false);

    useEffect(() => {
        if (draftProposed) return;

        const draft = localStorage.getItem('quiz_draft');
        if (draft) {
            try {
                const { title: draftTitle, sections: draftSections, selectedEmployeeId: draftEmployee } = JSON.parse(draft);

                const hasContent = draftTitle?.trim() ||
                    (draftSections && draftSections.some(s =>
                        s.title?.trim() || s.questions?.some(q => q.text?.trim())
                    ));

                if (hasContent) {
                    setDraftProposed(true);

                    toast.info("📝 Brouillon récupéré !", {
                        action: {
                            label: "Charger",
                            onClick: () => {
                                setTitle(draftTitle || '');
                                setSections(draftSections || sections);
                                setSelectedEmployeeId(draftEmployee);
                                toast.success("Brouillon chargé avec succès !");
                            }
                        },

                        cancel: {
                            label: "Ignorer",
                            onClick: () => {
                                localStorage.removeItem('quiz_draft');
                                toast.info("Brouillon ignoré");
                            }
                        }
                    });
                }
            } catch (e) {
                console.error('Erreur lors du chargement du brouillon:', e);
                localStorage.removeItem('quiz_draft');
            }
        }
    }, [draftProposed]);

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const list = await fetchAllEmployees();
                const typedList: Employee[] = list.map((employee: any) => ({
                    id: String(employee.id),
                    name: employee.name,
                }));
                setEmployees(typedList);
            } catch (error) {
                console.error('Erreur lors du fetch des employés :', error);
            }
        };
        loadEmployees();
    }, []);

    const handleAssign = useCallback((userId: string) => {
        setSelectedEmployeeId(userId);
        setAutoSaveStatus('unsaved');
    }, []);

    const handleSaveQuizz = async () => {
        setIsSaving(true);
        try {
            await createQuizz({
                title,
                assignedToId: selectedEmployeeId!,
                createdById: createdById!,
                sections,
            });

            localStorage.removeItem('quiz_draft'); // Supprimer le brouillon
            toast.success("Le quizz a été créé avec succès !");
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du quizz :', error);
            toast.error("Une erreur est survenue lors de la création du quizz.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddSection = () => {
        setSections([
            ...sections,
            {
                id: uuidv4(),
                title: '',
                questions: [{ id: uuidv4(), text: '' }],
            },
        ]);
        setAutoSaveStatus('unsaved');
    };

    const handleRemoveSection = (index: number) => {
        if (sections.length === 1) {
            toast.error("Vous devez conserver au moins une section");
            return;
        }
        const newSections = [...sections];
        newSections.splice(index, 1);
        setSections(newSections);
        setAutoSaveStatus('unsaved');
    };

    const handleAddQuestion = (sectionIndex: number) => {
        const updated = [...sections];
        updated[sectionIndex].questions.push({
            id: uuidv4(),
            text: '',
        });
        setSections(updated);
        setAutoSaveStatus('unsaved');
    };

    const handleRemoveQuestion = (sectionIndex: number, questionIndex: number) => {
        const updated = [...sections];
        if (updated[sectionIndex].questions.length === 1) {
            toast.error("Vous devez conserver au moins une question par section");
            return;
        }
        updated[sectionIndex].questions.splice(questionIndex, 1);
        setSections(updated);
        setAutoSaveStatus('unsaved');
    };

    const handleDuplicateQuestion = (sectionIndex: number, questionIndex: number) => {
        const updated = [...sections];
        const questionToDuplicate = updated[sectionIndex].questions[questionIndex];
        updated[sectionIndex].questions.splice(questionIndex + 1, 0, {
            ...questionToDuplicate,
            id: uuidv4(),
        });
        setSections(updated);
        setAutoSaveStatus('unsaved');
    };

    const handleMoveQuestion = (sectionIndex: number, questionIndex: number, direction: 'up' | 'down') => {
        const updated = [...sections];
        const questions = updated[sectionIndex].questions;
        const newIndex = direction === 'up' ? questionIndex - 1 : questionIndex + 1;

        if (newIndex < 0 || newIndex >= questions.length) return;

        [questions[questionIndex], questions[newIndex]] = [questions[newIndex], questions[questionIndex]];
        setSections(updated);
        setAutoSaveStatus('unsaved');
    };

    const isFormValid = title.trim() && selectedEmployeeId && sections.every(section =>
        section.title.trim() && section.questions.some(q => q.text.trim())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                {/* En-tête */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-500 p-2 rounded-lg">
                            <FileEdit className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Création d'un Quizz</h1>
                            <p className="text-gray-600">Créez un quizz interactif pour vos employés</p>
                        </div>
                    </div>

                    {/* Indicateur de sauvegarde */}
                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2 text-sm">
                            {autoSaveStatus === 'saving' && (
                                <>
                                    <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full" />
                                    <span className="text-blue-600">Sauvegarde automatique...</span>
                                </>
                            )}
                            {autoSaveStatus === 'saved' && (
                                <>
                                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                                    <span className="text-green-600">Brouillon sauvegardé</span>
                                </>
                            )}
                            {autoSaveStatus === 'unsaved' && (
                                <>
                                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                                    <span className="text-amber-600">Modifications non sauvegardées</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Formulaire principal */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Titre du quizz *
                            </label>
                            <Input
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setAutoSaveStatus('unsaved');
                                }}
                                placeholder="Ex: Formation sécurité au travail"
                                className="text-lg h-12"
                            />
                        </div>

                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section, sectionIndex) => (
                        <div key={section.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            {/* En-tête de section */}
                            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-white font-medium">
                                            Section {sectionIndex + 1}
                                        </span>
                                        <Input
                                            value={section.title}
                                            onChange={(e) => {
                                                const updated = [...sections];
                                                updated[sectionIndex].title = e.target.value;
                                                setSections(updated);
                                                setAutoSaveStatus('unsaved');
                                            }}
                                            placeholder="Titre de la section"
                                            className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:bg-white/20 focus:border-white/50"
                                        />
                                    </div>
                                    {sections.length > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRemoveSection(sectionIndex)}
                                            className="ml-3 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="p-6 space-y-4">
                                {section.questions.map((question, questionIndex) => (
                                    <div key={question.id} className="group bg-gray-50 border-2 border-gray-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                                        <div className="flex items-start gap-3 mb-4">
                                            <span className="bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-sm font-semibold">
                                                Q{questionIndex + 1}
                                            </span>
                                            <div className="flex-1">
                                                <Textarea
                                                    value={question.text}
                                                    onChange={(e) => {
                                                        const updated = [...sections];
                                                        updated[sectionIndex].questions[questionIndex].text = e.target.value;
                                                        setSections(updated);
                                                        setAutoSaveStatus('unsaved');
                                                    }}
                                                    placeholder="Saisissez votre question ici...
Vous pouvez utiliser plusieurs lignes pour structurer votre question."
                                                    className="min-h-[100px] resize-y border-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                                    rows={4}
                                                />
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {questionIndex > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMoveQuestion(sectionIndex, questionIndex, 'up')}
                                                        className="hover:bg-blue-100 hover:text-blue-700"
                                                        title="Déplacer vers le haut"
                                                    >
                                                        <ArrowUp className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {questionIndex < section.questions.length - 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMoveQuestion(sectionIndex, questionIndex, 'down')}
                                                        className="hover:bg-blue-100 hover:text-blue-700"
                                                        title="Déplacer vers le bas"
                                                    >
                                                        <ArrowDown className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDuplicateQuestion(sectionIndex, questionIndex)}
                                                    className="hover:bg-green-100 hover:text-green-700"
                                                    title="Dupliquer la question"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                                {section.questions.length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveQuestion(sectionIndex, questionIndex)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                                        title="Supprimer la question"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Upload d'image */}
                                        <div className="flex items-center gap-3 pt-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id={`image-upload-${section.id}-${question.id}`}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const imageUrl = URL.createObjectURL(file);
                                                        const updated = [...sections];
                                                        updated[sectionIndex].questions[questionIndex].imageUrl = imageUrl;
                                                        setSections(updated);
                                                        setAutoSaveStatus('unsaved');
                                                    }
                                                }}
                                            />
                                            <label htmlFor={`image-upload-${section.id}-${question.id}`} className="cursor-pointer">
                                                <Button variant="outline" size="sm" type="button" asChild>
                                                    <span>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Ajouter une image
                                                    </span>
                                                </Button>
                                            </label>

                                            {question.imageUrl && (
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={question.imageUrl}
                                                        alt="Question"
                                                        className="w-16 h-16 object-cover rounded border cursor-pointer hover:border-indigo-300 transition-colors"
                                                        onClick={() => setSelectedImageUrl(question.imageUrl)}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const updated = [...sections];
                                                            updated[sectionIndex].questions[questionIndex].imageUrl = undefined;
                                                            setSections(updated);
                                                            setAutoSaveStatus('unsaved');
                                                        }}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    variant="outline"
                                    onClick={() => handleAddQuestion(sectionIndex)}
                                    className="w-full hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Ajouter une question
                                </Button>
                            </div>
                        </div>
                    ))}

                    <Button
                        onClick={handleAddSection}
                        className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Ajouter une section
                    </Button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigner à un employé *
                    </label>
                    <div className="flex items-center gap-4">
                        <AssignUserDialog
                            users={employees}
                            onAssign={handleAssign}
                            isOpen={isAssignUserDialogOpen}
                            onOpenChange={setIsAssignUserDialogOpen}
                        />
                        {selectedEmployeeId && (
                            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-green-600" />
                                <span className="text-green-800 font-medium">
                                    {employees.find((e) => e.id === selectedEmployeeId)?.name}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                                {!isFormValid && (
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <XCircle className="w-4 h-4" />
                                        <span>Veuillez compléter tous les champs requis</span>
                                    </div>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => {
                                    localStorage.removeItem('quiz_draft');
                                    toast.success("Brouillon supprimé");
                                    setTitle('');
                                    setSections([{
                                        id: uuidv4(),
                                        title: '',
                                        questions: [{ id: uuidv4(), text: '' }],
                                    }]);
                                    setSelectedEmployeeId(null);
                                    setAutoSaveStatus('saved');
                                }}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                Nouveau quizz
                            </Button>
                        </div>

                        <Button
                            onClick={handleSaveQuizz}
                            disabled={!isFormValid || isSaving}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                                    Création en cours...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Créer le Quizz
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal image amélioré */}
            {selectedImageUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    onClick={() => setSelectedImageUrl(null)}
                >
                    <div className="relative max-w-5xl max-h-[95vh] overflow-auto bg-white rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">📸 Prévisualisation de l'image</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImageUrl(null);
                                }}
                                className="hover:bg-red-100 hover:text-red-700 rounded-lg"
                            >
                                <XCircle className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="p-6">
                            <img
                                src={selectedImageUrl}
                                alt="Question agrandie"
                                className="w-full h-auto rounded-lg shadow-md"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}