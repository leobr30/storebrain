// features/employee-area/components/employee/create-training-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { createTraining, getTrainingModels } from "../../actions";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { TrainingModel } from "../../types"; // Import du type TrainingModel
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// Import toast from sonner
import { toast } from "sonner";

const subjectSchema = z.object({
    id: z.string().default(() => uuidv4()),
    name: z.string().min(1, "Le nom du sujet est requis"),
    state: z.enum(["ACQUIRED", "NOT_ACQUIRED", "IN_PROGRESS"]).default("NOT_ACQUIRED"),
});


const formSchema = z.object({
    name: z.string().min(1, "Le nom de la formation est requis"),
    trainingModelId: z.number().optional(),
});

type CreateTrainingDialogProps = {
    employeeId: number;
    employeeOnboordingId: number;
};

export const CreateTrainingDialog = ({ employeeId, employeeOnboordingId }: CreateTrainingDialogProps) => {
    const [open, setOpen] = useState(false);
    const [trainingModels, setTrainingModels] = useState<TrainingModel[]>([]);
    const [creationType, setCreationType] = useState<'model' | 'blank'>('model');
    const [subjects, setSubjects] = useState<z.infer<typeof subjectSchema>[]>([]);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            trainingModelId: undefined,
        },
    });

    useEffect(() => {
        const fetchTrainingModels = async () => {
            try {
                const models = await getTrainingModels();
                setTrainingModels(models);
            } catch (error) {
                console.error("Erreur lors de la récupération des modèles de formation :", error);
            }
        };
        fetchTrainingModels();
    }, []);

    useEffect(() => {
        if (!open) {
            form.reset();
            setSubjects([]);
        }
    }, [open]);

    const handleAddSubject = () => {
        setSubjects([...subjects, { id: uuidv4(), name: "", state: "NOT_ACQUIRED" }]);
    };

    const handleRemoveSubject = (subjectId: string) => {
        setSubjects(subjects.filter(subject => subject.id !== subjectId));
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            console.log("🚀 ~ onSubmit ~ values:", values);
            if (creationType === 'model' && values.trainingModelId) {
                await createTraining(employeeId, employeeOnboordingId, values.trainingModelId, values.name);
                toast.success("Formation créée", {
                    description: "La formation a bien été créée.",
                });
            } else if (creationType === 'blank') {
                await createTraining(employeeId, employeeOnboordingId, undefined, values.name, subjects);
                toast.success("Formation créée", {
                    description: "La formation a bien été créée.",
                });
            } else {
                toast.error("Veuillez choisir un modèle de formation ou créer une formation vierge.", {});
            }

            setOpen(false);
        } catch (error) {
            console.error("Erreur lors de la création de la formation :", error);
            toast.error("Une erreur est survenue lors de la création de la formation.", {});
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Créer une formation</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Créer une formation</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom de la formation</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nom de la formation" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-4">
                            <Button variant={creationType === 'model' ? 'default' : 'outline'} onClick={() => setCreationType('model')}>A partir d'un modèle</Button>
                            <Button variant={creationType === 'blank' ? 'default' : 'outline'} onClick={() => setCreationType('blank')}>Vierge</Button>
                        </div>
                        {creationType === 'model' && (
                            <FormField
                                control={form.control}
                                name="trainingModelId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Modèle</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()} className="flex flex-col gap-2">
                                                {trainingModels.map((model) => (
                                                    <FormItem key={model.id} className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value={model.id.toString()} id={model.id.toString()} />
                                                        </FormControl>
                                                        <FormLabel htmlFor={model.id.toString()}>{model.name}</FormLabel>
                                                    </FormItem>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {creationType === 'blank' && (
                            <>
                                <Label>Sujets</Label>
                                {subjects.map((subject, index) => (
                                    <div key={subject.id} className="flex items-center space-x-2">
                                        <Input
                                            placeholder="Nom du sujet"
                                            value={subject.name}
                                            onChange={(e) => {
                                                const newSubjects = [...subjects];
                                                newSubjects[index].name = e.target.value;
                                                setSubjects(newSubjects);
                                            }}
                                        />
                                        <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveSubject(subject.id)}>
                                            X
                                        </Button>
                                    </div>
                                ))}
                                <Button className="flex items-center space-x-2" type="button" variant="secondary" onClick={handleAddSubject}>
                                    Ajouter un sujet
                                </Button>
                            </>
                        )}
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Annuler</Button>
                            </DialogClose>
                            <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
