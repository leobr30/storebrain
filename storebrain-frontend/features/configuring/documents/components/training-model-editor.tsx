'use client';

import { useEffect, useState } from 'react';
import { fetchTrainingModels } from '../action';
import { Pencil } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import TrainingModelDialog from './training-model-dialog';

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
    const [selectedModel, setSelectedModel] = useState<TrainingModelType | null>(null);

    useEffect(() => {
        fetchTrainingModels().then((data) => {
            const safeData = data.map((m: any) => ({
                ...m,
                subjects: m.subjects ?? [],
            }));
            setModels(safeData);
        });
    }, []);

    const handleCloseDialog = async () => {
        const updated = await fetchTrainingModels();
        setModels(updated);
        setSelectedModel(null);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Modèles de formation</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {models.map((model) => (
                            <TableRow key={model.id} className="text-center">
                                <TableCell>{model.name}</TableCell>
                                <TableCell className="text-center">
                                    <Button variant="ghost" onClick={() => setSelectedModel(model)} className="mx-auto">
                                        <Pencil className="w-4 h-4 mr-2" /> Modifier
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>

                {selectedModel && (
                    <TrainingModelDialog
                        model={selectedModel}
                        open={true}
                        onClose={handleCloseDialog}
                        onRefresh={handleCloseDialog}
                    />
                )}

            </CardContent>
        </Card>
    );
}
