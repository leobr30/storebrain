'use client';

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getDoc, saveEmployeeResponse, handleGeneratePdfAndSendEmail } from './document-form-action';

export default function DocumentForm({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const emailDestinataire = "gabriel.beduneau@diamantor.fr";

  const [sections, setSections] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formId, setFormId] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await getDoc();
        console.log('✅ Formulaire récupéré :', response);

        if (!response || !response.sections || !response.id) {
          throw new Error('Données du formulaire invalides');
        }

        setFormId(response.id);
        const formattedSections = response.sections.map((section, index) => ({
          id: index + 1,
          title: `${index + 1}° ${section.title}`,
          items: section.items.map((item: any) => item.label),
        }));

        setSections([...formattedSections, { id: 'comment', title: 'Commentaire - Autres', textarea: true }]);
        setComment(response.comment || '');
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du formulaire:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, []);

  const handleCheckboxChange = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, sections.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!userId) {
      alert("❌ Vous devez être connecté pour soumettre ce formulaire.");
      console.error("❌ Erreur : userId est null");
      return;
    }

    if (!formId) {
      alert("❌ Impossible de récupérer l'ID du formulaire.");
      console.error("❌ Erreur : formId est null");
      return;
    }

    try {
      const payload = {
        userId,
        formId,
        responses: sections
          .filter(section => section.items)
          .map(section => ({
            title: section.title,
            items: section.items?.map(item => ({
              label: item,
              selected: selectedItems.includes(item),
            })),
          })),
        comment,
      };

      console.log("📢 Données envoyées :", payload);
      const response = await saveEmployeeResponse(payload);
      const responseId = response?.id;

      alert("✅ Formulaire soumis avec succès !");

      if (responseId) {
        const pdfResponse = await handleGeneratePdfAndSendEmail(responseId, emailDestinataire);
        alert(pdfResponse.message);
      }

      onClose();
    } catch (error) {
      console.error("❌ Erreur lors de la soumission :", error);
      alert("Échec de l'enregistrement");
    }
  };

  if (loading) {
    return <div className="text-center py-6 text-lg font-semibold">Chargement...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg flex flex-col h-[80vh]">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
        Accueil Nouveau Vendeur
      </h1>

      <div className="flex-grow overflow-auto p-4 bg-gray-100 rounded-md shadow-sm">
        <h2 className="font-semibold text-xl text-gray-800 mb-3">{sections[currentStep].title}</h2>

        {sections[currentStep].textarea ? (
          <div className="mt-4">
            <Textarea
              id="commentaire"
              placeholder="Ajoutez un commentaire..."
              className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {sections[currentStep].items?.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 bg-white p-3 rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 transition"
              >
                <Checkbox
                  id={item}
                  checked={selectedItems.includes(item)}
                  onCheckedChange={() => handleCheckboxChange(item)}
                  className="w-5 h-5"
                />
                <Label htmlFor={item} className="flex-grow text-gray-700 break-words">
                  {item}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between sticky bottom-0 bg-white p-4 border-t border-gray-200 shadow-md">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-6 py-2 text-lg border-gray-400"
        >
          Précédent
        </Button>

        {currentStep < sections.length - 1 ? (
          <Button
            onClick={handleNext}
            className="px-6 py-2 text-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Suivant
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="px-6 py-2 text-lg bg-green-600 hover:bg-green-700 text-white"
          >
            Valider
          </Button>
        )}
      </div>
    </div>
  );
}
