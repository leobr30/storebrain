import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DocumentType, documentTypeLabels } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
    file: z.custom<File | null>((v) => v instanceof File || v === null, {
        message: "Le fichier est obligatoire",
    }).refine((file) => file !== null, {
        message: "Le fichier est obligatoire",
    }),
    type: z.nativeEnum(DocumentType),
});

type UploadDocumentModalProps = {
    onUpload: (file: File, type: DocumentType) => void;
    setOpen: (open: boolean) => void;
};

export const UploadDocumentModal = ({ onUpload, setOpen }: UploadDocumentModalProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState<DocumentType>(DocumentType.OTHER);
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: DocumentType.OTHER,
            file: null
        }
    });

    useEffect(() => {
        setValue('type', type);
        setValue('file', file);
    }, [type, setValue, file]);

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        if (file) {
            onUpload(file, data.type);
            setFile(null);
            reset();
            setType(DocumentType.OTHER);
            setOpen(false);
        }
    };

    const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setType(event.target.value as DocumentType);
    };

    return (
        <Dialog onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Uploader</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Uploader un document</DialogTitle>
                    <DialogDescription>
                        Sélectionnez un fichier et son type.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        type="file"
                        {...register('file', {
                            onChange: (e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    setFile(e.target.files[0]);
                                } else {
                                    setFile(null);
                                }
                            },
                        })}
                    />
                    {errors.file && <p className="text-red-500">{errors.file.message}</p>}
                    <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={type}
                        onChange={handleTypeChange}
                    >
                        {Object.values(DocumentType).map((docType) => (
                            <option key={docType} value={docType}>
                                {documentTypeLabels[docType]}
                            </option>
                        ))}
                    </select>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="submit" disabled={!file}>Uploader</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
