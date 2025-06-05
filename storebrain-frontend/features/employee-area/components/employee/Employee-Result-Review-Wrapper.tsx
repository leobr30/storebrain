// ✅ Employee-Result-Review-Wrapper.tsx corrigé

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { saveResultReview, getResultReview, submitResultReview } from '../../actions';

interface EmployeeResultReviewWrapperProps {
    stepId: number;
    setOpen: (open: boolean) => void;
    open: boolean;
    status: string;
    onSubmitSuccess?: (updatedStep?: any) => void;
    responseId?: string | null;
    reviewName: string;
    appointmentNumber: number;
}

interface ReviewData {
    objectif?: string;
    realise?: string;
    magasin?: string;
    vendeuse?: string;
    commentaire?: string;
}

export const EmployeeResultReviewWrapper = ({
    stepId,
    setOpen,
    open,
    status,
    onSubmitSuccess,
    responseId,
    reviewName,
    appointmentNumber
}: EmployeeResultReviewWrapperProps) => {
    const [loading, setLoading] = useState(false);
    const [reviewData, setReviewData] = useState<ReviewData>({});
    const [loadingData, setLoadingData] = useState(false);

    // Déterminer le type de bilan et le titre
    const isObjectifIndividuel = reviewName?.toLowerCase().includes('objectif');
    const monthText = appointmentNumber === 1 ? '1er mois' : `${appointmentNumber}ème mois`;
    const title = isObjectifIndividuel
        ? `${monthText} objectif`
        : `${monthText} ${reviewName?.toLowerCase().includes('panier') ? 'magasin' : reviewName}`;

    // ✅ Charger les données existantes quand le modal s'ouvre
    useEffect(() => {
        const loadExistingData = async () => {
            if (!open) return; // ✅ Charger seulement quand ouvert

            setLoadingData(true);
            try {
                const existingData = await getResultReview(stepId);
                console.log("📦 Données existantes récupérées:", existingData);

                if (existingData?.data) {
                    setReviewData(existingData.data);
                } else {
                    // ✅ Réinitialiser si pas de données
                    setReviewData({});
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
                // ✅ Pas d'erreur toast car c'est normal s'il n'y a pas encore de données
                setReviewData({});
            } finally {
                setLoadingData(false);
            }
        };

        loadExistingData();
    }, [open, stepId]); // ✅ Supprimer responseId de la dépendance

    const handleInputChange = (field: keyof ReviewData, value: string) => {
        setReviewData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const result = await saveResultReview(stepId, reviewData);
            console.log("✅ Sauvegarde réussie:", result);
            toast.success('Bilan sauvegardé avec succès');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            toast.error('Erreur lors de la sauvegarde du bilan');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        // ✅ Validation simple
        if (isObjectifIndividuel) {
            if (!reviewData.objectif?.trim() || !reviewData.realise?.trim()) {
                toast.error('Veuillez remplir l\'objectif et le réalisé');
                return;
            }
        } else {
            if (!reviewData.magasin?.trim() || !reviewData.vendeuse?.trim()) {
                toast.error('Veuillez remplir le magasin et la vendeuse');
                return;
            }
        }

        setLoading(true);
        try {
            const result = await submitResultReview(stepId, reviewData);
            console.log("✅ Validation réussie:", result);
            toast.success('Bilan validé avec succès');
            setOpen(false);

            // ✅ Appeler le callback de succès
            if (onSubmitSuccess) {
                onSubmitSuccess(result.step);
            }
        } catch (error) {
            console.error('Erreur lors de la validation:', error);
            toast.error('Erreur lors de la validation du bilan');
        } finally {
            setLoading(false);
        }
    };

    const isCompleted = status === 'COMPLETED';

    return (
        <>
            <Button
                variant="ghost"
                onClick={() => setOpen(true)}
                disabled={isCompleted}
                className={isCompleted ? 'opacity-50' : ''}
            >
                {isCompleted ? 'Bilan effectué' : 'Faire le point'}
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                    <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                        <SheetTitle className="text-lg font-semibold">
                            Bilan - {title}
                        </SheetTitle>
                    </SheetHeader>

                    {loadingData ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-600">Chargement...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 mt-6">
                            {isObjectifIndividuel ? (
                                // Formulaire Objectif Individuel
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="objectif">Objectif *</Label>
                                        <Input
                                            id="objectif"
                                            value={reviewData.objectif || ''}
                                            onChange={(e) => handleInputChange('objectif', e.target.value)}
                                            placeholder="Saisissez l'objectif..."
                                            disabled={isCompleted}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="realise">Réalisé *</Label>
                                        <Input
                                            id="realise"
                                            value={reviewData.realise || ''}
                                            onChange={(e) => handleInputChange('realise', e.target.value)}
                                            placeholder="Saisissez ce qui a été réalisé..."
                                            disabled={isCompleted}
                                        />
                                    </div>
                                </>
                            ) : (
                                // Formulaire Panier Moyen
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="magasin">Magasin *</Label>
                                        <Input
                                            id="magasin"
                                            value={reviewData.magasin || ''}
                                            onChange={(e) => handleInputChange('magasin', e.target.value)}
                                            placeholder="Saisissez les informations magasin..."
                                            disabled={isCompleted}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="vendeuse">Vendeuse *</Label>
                                        <Input
                                            id="vendeuse"
                                            value={reviewData.vendeuse || ''}
                                            onChange={(e) => handleInputChange('vendeuse', e.target.value)}
                                            placeholder="Saisissez les informations vendeuse..."
                                            disabled={isCompleted}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="commentaire">Commentaire</Label>
                                <Textarea
                                    id="commentaire"
                                    value={reviewData.commentaire || ''}
                                    onChange={(e) => handleInputChange('commentaire', e.target.value)}
                                    placeholder="Ajoutez un commentaire (optionnel)..."
                                    rows={3}
                                    disabled={isCompleted}
                                />
                            </div>

                            {isCompleted && (
                                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                                                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-green-800">
                                                Bilan complété
                                            </h3>
                                            <div className="mt-1 text-sm text-green-700">
                                                Ce bilan a été validé avec succès.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!isCompleted && (
                        <SheetFooter className="flex gap-2 mt-6 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={handleSave}
                                disabled={loading || loadingData}
                            >
                                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || loadingData}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? 'Validation...' : 'Valider le bilan'}
                            </Button>
                        </SheetFooter>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
};