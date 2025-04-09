// In documents.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { deleteDocument, getDocumentsForUser, uploadDocument } from '@/features/employee-area/actions';
import { Button } from '@/components/ui/button';
import { Document, DocumentType, documentTypeLabels } from '../../types'; // Import the types and labels
import { useSession } from 'next-auth/react';
import { PencilLine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { UploadDocumentModal } from './upload-document-modal';

export default function EmployeeDocuments() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchDocuments = async () => {
        setIsLoading(true);
        if (!userId) return;
        const numericUserId = Number(userId);
        if (!numericUserId) return;
        const docs = await getDocumentsForUser(numericUserId);
        setDocuments(docs);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchDocuments();
    }, [userId]);

    const handleUpload = async (file: File, type: DocumentType) => {
        if (!userId) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId.toString());
        formData.append('type', type);

        await uploadDocument(formData);
        fetchDocuments();
    };


    const handleDelete = async (id: number) => {
        const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?");
        if (!confirmed) return;
        try {
            await deleteDocument(id);
            toast.success("Document supprimé avec succès");
            fetchDocuments();
        } catch (error) {
            toast.error("Erreur lors de la suppression du document");
        }
    };

    const columns = useMemo<ColumnDef<Document>[]>(() => [
        {
            accessorKey: "fileName",
            header: "Nom",
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const documentType = row.original.type;
                return <span>{documentTypeLabels[documentType]}</span>;
            },
        },
        {
            accessorKey: "mimeType",
            header: "Mime Type",
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => handleDelete(row.original.id)}>
                        <PencilLine className="w-4 h-4" /> Supprimer
                    </Button>
                </div>
            ),
        },
    ], []);

    return (
        <Card>
            <CardHeader className="flex-row justify-between items-center">
                <CardTitle>Mes documents</CardTitle>
                <UploadDocumentModal onUpload={handleUpload} setOpen={setIsModalOpen} open={isModalOpen} />
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <Skeleton className="w-full h-12" />
                ) : documents.length === 0 ? (
                    <p className="text-gray-500">Aucun document trouvé.</p>
                ) : (
                    <div className="rounded-md border">
                        <Table wrapperClass="h-[500px] overflow-auto custom-scrollbar">
                            <TableHeader className="bg-default-100 sticky top-0">
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableHead key={column.accessorKey}>{column.header}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map((doc) => (
                                    <TableRow key={doc.id}>
                                        {columns.map((column) => (
                                            <TableCell key={`${doc.id}-${column.accessorKey}`}>
                                                {column.cell ? column.cell({ row: { original: doc } as any }) : doc[column.accessorKey]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
