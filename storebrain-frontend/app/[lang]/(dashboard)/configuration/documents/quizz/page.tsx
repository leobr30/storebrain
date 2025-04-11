'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash, FileEdit, Save, User, XCircle } from 'lucide-react';
import { AssignUserDialog } from '@/features/configuring/documents/components/AssignUserDialog';
import { createQuizz, fetchAllEmployees } from '../action';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

interface Employee {
    id: number;
    name: string;
}

interface Answer {
    id: string;
    text: string;
}

interface Question {
    id: string;
    text: string;
    imageUrl?: string;
    answers: Answer[];
}


interface Section {
    id: string;
    title: string;
    questions: Question[];
}

export default function QuizzPage() {
    const { data: session } = useSession();
    const createdById = session?.user?.id;

    const [title, setTitle] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [isAssignUserDialogOpen, setIsAssignUserDialogOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    const [sections, setSections] = useState<Section[]>([
        {
            id: uuidv4(),
            title: '',
            questions: [
                {
                    id: uuidv4(),
                    text: '',
                    answers: [{ id: uuidv4(), text: '' }],
                },
            ],
        },
    ]);

    const handleSaveQuizz = async () => {
        const payload = {
            title,
            assignedToId: selectedEmployeeId,
            createdById,
            sections: sections.map((section) => ({
                title: section.title,
                questions: section.questions.map((question) => ({
                    text: question.text,
                    answers: question.answers.map((answer) => ({ text: answer.text })),
                })),
            })),
            jobOnboardingId: jobOnboardingId,
        };

        try {
            await createQuizz({
                title,
                assignedToId: selectedEmployeeId!,
                createdById: createdById!,
                sections,
            });

            alert('🎉 Le quizz a été créé avec succès !'); // Changed message here
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde du quizz :', error);
            alert('ça fonctionne pas');
        }
    };

    const handleAddSection = () => {
        setSections([
            ...sections,
            {
                id: uuidv4(),
                title: '',
                questions: [{ id: uuidv4(), text: '', answers: [{ id: uuidv4(), text: '' }] }],
            },
        ]);
    };

    const handleRemoveSection = (index: number) => {
        const newSections = [...sections];
        newSections.splice(index, 1);
        setSections(newSections);
    };

    const handleAddQuestion = (sectionIndex: number) => {
        const updated = [...sections];
        updated[sectionIndex].questions.push({
            id: uuidv4(),
            text: '',
            answers: [{ id: uuidv4(), text: '' }],
        });
        setSections(updated);
    };

    const handleRemoveQuestion = (sectionIndex: number, questionIndex: number) => {
        const updated = [...sections];
        updated[sectionIndex].questions.splice(questionIndex, 1);
        setSections(updated);
    };

    const handleAddAnswer = (sectionIndex: number, questionIndex: number) => {
        const updated = [...sections];
        updated[sectionIndex].questions[questionIndex].answers.push({ id: uuidv4(), text: '' });
        setSections(updated);
    };

    const handleRemoveAnswer = (sectionIndex: number, questionIndex: number, answerIndex: number) => {
        const updated = [...sections];
        updated[sectionIndex].questions[questionIndex].answers.splice(answerIndex, 1);
        setSections(updated);
    };

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const list = await fetchAllEmployees();
                const typedList: Employee[] = list.map((employee: any) => ({
                    id: employee.id,
                    name: employee.name,
                }));
                setEmployees(typedList);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };
        loadEmployees();
    }, []);

    const handleAssign = useCallback((userId: number) => {
        console.log('QuizzPage: onAssign called with:', userId);
        setSelectedEmployeeId(userId);
    }, []);

    return (
        <div className="p-6 space-y-6">

            <div className="flex items-center space-x-2">
                <FileEdit className="w-6 h-6 text-indigo-500" />
                <h1 className="text-2xl font-bold">Création d’un Quizz</h1>
            </div>


            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre du quizz"
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />


            <div className="space-y-8">
                {sections.map((section, sectionIndex) => (
                    <div key={section.id} className="border p-4 rounded-md space-y-4 shadow-md bg-white">

                        <div className="flex justify-between items-center">
                            <Input
                                value={section.title}
                                onChange={(e) => {
                                    const updated = [...sections];
                                    updated[sectionIndex].title = e.target.value;
                                    setSections(updated);
                                }}
                                placeholder="Titre de la section"
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <Button
                                variant="destructive"
                                onClick={() => handleRemoveSection(sectionIndex)}
                                className="flex items-center"
                            >
                                <Trash className="w-4 h-4 mr-2" /> Supprimer
                            </Button>
                        </div>


                        <div className="space-y-4">
                            {section.questions.map((question, questionIndex) => (
                                <div key={question.id} className="border p-4 rounded-md space-y-2 bg-gray-50">

                                    <div className="flex items-center justify-between">
                                        <Input
                                            value={question.text}
                                            onChange={(e) => {
                                                const updated = [...sections];
                                                updated[sectionIndex].questions[questionIndex].text = e.target.value;
                                                setSections(updated);
                                            }}
                                            placeholder="Question"
                                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleRemoveQuestion(sectionIndex, questionIndex)}
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="mt-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const imageUrl = URL.createObjectURL(file);
                                                    const updated = [...sections];
                                                    updated[sectionIndex].questions[questionIndex].imageUrl = imageUrl;
                                                    setSections(updated);
                                                }
                                            }}
                                        />
                                        {question.imageUrl && (
                                            <img
                                                src={question.imageUrl}
                                                alt="Question"
                                                className="mt-2 w-32 h-32 object-cover rounded-md cursor-pointer"
                                                onClick={() => setSelectedImageUrl(question.imageUrl)}
                                            />
                                        )}
                                    </div>


                                    <div className="space-y-2">
                                        {question.answers.map((answer, answerIndex) => (
                                            <div key={answer.id} className="flex items-center space-x-2">
                                                <Input
                                                    value={answer.text}
                                                    onChange={(e) => {
                                                        const updated = [...sections];
                                                        updated[sectionIndex].questions[questionIndex].answers[answerIndex].text =
                                                            e.target.value;
                                                        setSections(updated);
                                                    }}
                                                    placeholder={`Réponse ${answerIndex + 1}`}
                                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => handleRemoveAnswer(sectionIndex, questionIndex, answerIndex)}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>


                                    <div className="flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddAnswer(sectionIndex, questionIndex)}
                                            className="flex items-center text-sm"
                                        >
                                            <PlusCircle className="w-4 h-4 mr-2" /> Ajouter une réponse
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>


                        <div className="flex justify-end">
                            <Button onClick={() => handleAddQuestion(sectionIndex)} className="flex items-center text-sm">
                                <PlusCircle className="w-4 h-4 mr-2" /> Ajouter une question
                            </Button>
                        </div>
                    </div>
                ))}
            </div>


            <Button onClick={() => handleAddSection()} className="flex items-center bg-indigo-500 hover:bg-indigo-600 text-white">
                <PlusCircle className="w-4 h-4 mr-2" /> Ajouter une section
            </Button>


            <div className="flex justify-end items-center space-x-4 mt-8">

                <AssignUserDialog
                    users={employees}
                    onAssign={handleAssign}
                    isOpen={isAssignUserDialogOpen}
                    onOpenChange={setIsAssignUserDialogOpen}
                />

                <Button
                    className="flex items-center bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleSaveQuizz}
                    disabled={!title || !selectedEmployeeId || sections.length === 0}
                >
                    <Save className="w-4 h-4 mr-2" /> Sauvegarder le Quizz
                </Button>
            </div>


            {selectedEmployeeId && (
                <p className="text-sm text-muted-foreground flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Employé assigné : {employees.find((e) => e.id === selectedEmployeeId)?.name}</span>
                </p>
            )}
            {selectedImageUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setSelectedImageUrl(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
                        <img src={selectedImageUrl} alt="Enlarged Question" className="w-full h-auto" />
                        <button
                            className="absolute top-2 right-2 text-white"
                            onClick={() => setSelectedImageUrl(null)}
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
