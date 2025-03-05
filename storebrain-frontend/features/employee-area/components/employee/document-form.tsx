'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const steps = [
  {
    title: "1° PRÉSENTER LES LOCAUX SOCIAUX",
    items: [
      "Vestiaires",
      "Toilette",
      "Salle de restauration et repos",
      "Tableau d'affichage",
      "Planning horaire",
      "Planning du ménage",
    ],
  },
  {
    title: "2° INDIQUER LES RÈGLES D'ARRIVÉES ET DE DÉPARTS",
    items: [
      "“ Arrivée à l’heure c’est déjà être en retard “ donc ( - 10 minutes avant l’horaire pour poser les affaires personnelles...",
      "Regarder votre tenue, Dress code noir, coiffure, maquillage, bijoux et montre portés dans la norme et respect du contrat de travail.",
      "Avant de démarrer votre journée de travail vous devez prendre votre gant, badge et clés + signer la fiche",
    ],
  },
  {
    title: "3° INDIQUER LES RÈGLES DE PRISE DE FONCTION SUR VOTRE ZONE",
    items: [
      "Seulement après avoir pris votre fonction, vous allez vous positionner à l'endroit où sont rangés les BRIEFS - DEBRIEFS de votre zone",
      "Vous en prenez connaissance et vous devez signer après avoir lu les chiffres du jour",
      "Vous devez vous positionner sur la partie de la zone affectée",
    ],
  },
  {
    title: "Commentaire - Autres",
    textarea: true,
  },
];

export default function DocumentForm({ onClose }: { onClose: () => void }) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [comment, setComment] = useState("");

  const handleCheckboxChange = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Formulaire soumis :", {selectedItems, comment});
    alert("Formulaire soumis avec succès !");
    onClose();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-xl font-bold text-center">
        Accueil Nouveau Vendeur Sur Votre Établissement
      </h1>

      <div>
        <h2 className="font-semibold">{steps[currentStep].title}</h2>

        {steps[currentStep].textarea ? (
          <div className="mt-4">
            
            <Textarea
              id="commentaire"
              placeholder="Ajoutez un commentaire..."
              className="mt-2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {steps[currentStep].items?.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Checkbox
                  id={item}
                  checked={selectedItems.includes(item)}
                  onCheckedChange={() => handleCheckboxChange(item)}
                />
                <Label htmlFor={item}>{item}</Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
          Précédent
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>Suivant</Button>
        ) : (
          <Button variant="default" onClick={handleSubmit}>Valider</Button>
        )}
      </div>
    </div>
  );
}
