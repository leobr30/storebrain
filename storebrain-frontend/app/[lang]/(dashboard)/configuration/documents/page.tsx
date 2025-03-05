"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveDoc } from "./action";


export default function DocumentForm() {
  const [sections, setSections] = useState([
    {
      id: 1,
      title: "PRÉSENTER LES LOCAUX SOCIAUX",
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
      id: 2,
      title: "INDIQUER LES RÈGLES D'ARRIVÉES ET DE DÉPARTS",
      items: [
        "“ Arrivée à l’heure c’est déjà être en retard “ donc ( - 10 minutes avant l’horaire pour poser les affaires personnelles...",
        "Regarder votre tenue, Dress code noir, coiffure, maquillage, bijoux et montre portés dans la norme et respect du contrat de travail.",
        "Avant de démarrer votre journée de travail vous devez prendre votre gant, badge et clés + signer la fiche",
        "Obligation de Mettre votre badge, gant, clef autour du coup, pour pouvoir badger afin d’identifier votre présence.",
        "A chacun de vos départs vous devez vous présenter devant la badgeuse équipé de votre tenue. Ensuite ranger dans le tiroir vos clés badge gant.",
      ],
    },

    {
      id: 3,
      title: "INDIQUER LES RÈGLES DE PRISE DE FONCTION SUR VOTRE ZONE",
      items: [
        "Seulement après avoir pris votre fonction, vous allez vous positionner à l'endroit où sont rangés les BRIEFS - DEBRIEFS de votre zone",
        "Vous en prenez connaissance et vous devez signer après avoir lu les chiffres du jour (contribution individuelle, obj zone, obj Mag, action du jour demandée)",
        "Vous devez vous positionner sur la partie de la zone affectée",
      ],
    },

    {
      id: 4,
      title: "SAVOIR SE REPÉRER DANS SON PLAN MERCHANDISING - ENTRETIEN DE SA ZONE",
      items: [
        "Savoir repérer et connaitre, dans votre établissement Diamantor les vitrines des bijoux et montres de marque AVANTAGE carte 3 ans de garantie Doc N°2",
        "Savoir repérer et connaitre, les vitrines bijoux de chaque zone bénéficiant l'avantage carte 50% Doc N°1",
        "Savoir respecter le référent la photo",
        "Savoir où se trouve le comptoir carte fidélité.",
        "Savoir où se font les TSV - la prise des SAV (hors et sous garantie) clients.",
        "Savoir où se font les services minutes dans l'établissement.",
        "Savoir où se trouvent les produits d'entretien de votre zone.",
      ],
    },

    {
      id: 5,
      title: "L'OUVERTURE DES VITRINES MODE ( Zone MODE )",
      items: [
        "Savoir ouvrir avec la clef, une vitrine mode, en respectant l'ouverture en sécurité. \n \n objectif: le client doit toujours avoir la vitre fermée devant lui. \n \n Pour y arriver vous devez: \n \n - Poser votre plateau de présentation devant la vitre qui doit rester fermée, Toujours devant votre client. \n \n - Vous déplacer en invitant le client à rejoindre le plateau que vous aurez \n repositionner devant la vitre opposée à celle que vous ouvrez.",
      ],
    },

    {
      id: 6,
      title: "bis L'OUVERTURE DES VITRINES MODE ( Zone OR )",
      items: [
        "Savoir ouvrir avec le badge une vitrine de la zone or",
        "Savoir où se trouvent les capteurs",
        "Savoir fermer délicatement la vitrine",
        "Savoir qu'en cas de choc, toutes les vitrines BLACK de Diamantor se bloquent pendant 10 minutes",
        "Savoir que si vous badgez une vitrine pour contrôler l'ouverture dans la foulée, \n cela peux prolonger de 10 minutes supplémentaires",
        "Savoir que si une vitrine est déjà ouverte sur une zone de l'or, il faut qu'elle soit \n refermée, pour pouvoir à son tour, ouvrir une nouvelle vitrine.",
        "Savoir qu'au bout de 3 minutes d'ouverture d'une vitre sur la zone, 1 BUZZER se \n déclenche, bruit strident, afin que tout le monde l'entende et sache qu'une vitrine est \n ouverte.",
        "Savoir qu'en cas de plusieurs chocs sur les vitrines blindées, les fumigènes peuvent devenir actifs"
      ],
    },
  ]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  const handleCheckboxChange = (item: string) => {
    setSelectedItems((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const addSection = () => {
    const newSection = { id: Date.now(), title: "Nouvelle Section", items: [] };
    setSections([...sections, newSection]);
  };

  const updateSectionTitle = (index: number, newTitle: string) => {
    setSections((prev) => prev.map((section, i) => (i === index ? { ...section, title: newTitle } : section)));
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const addItemToSection = (sectionIndex: number) => {
    const newItem = prompt("Entrez un nouvel élément:");
    if (newItem) {
      setSections((prev) => prev.map((section, i) => (i === sectionIndex ? { ...section, items: [...section.items, newItem] } : section)));
    }
  };

  const editItem = (sectionIndex: number, itemIndex: number) => {
    const newItem = prompt("Modifiez cet élément:", sections[sectionIndex].items[itemIndex]);
    if (newItem) {
      setSections((prev) => prev.map((section, i) => (i === sectionIndex ? { ...section, items: section.items.map((item, j) => (j === itemIndex ? newItem : item)) } : section)));
    }
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    setSections((prev) => prev.map((section, i) => (i === sectionIndex ? { ...section, items: section.items.filter((_, j) => j !== itemIndex) } : section)));
  };

  const handleSubmit = async () => {
    try {

      await saveDoc({
        title: "Accueil Nouveau Vendeur",
        sections: sections.map((section) => ({
          title: section.title,
          items: section.items.map((item) => ({
            label: item,
            selected: selectedItems.includes(item),
          })),
        })),
        comment,
      })


      alert("Formulaire sauvegardé avec succès !");
    } catch (error) {
      console.error("❌ Erreur:", error);
      alert("Échec de l'enregistrement");
    }
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    setSections((prev) => {
      const newSections = [...prev];
  
      if (
        (direction === "up" && index === 0) || 
        (direction === "down" && index === newSections.length - 1)
      ) {
        return prev;
      }
      const newIndex = direction === "up" ? index - 1 : index + 1;
  
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
  
      return newSections;
    });
  };
  



  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-8">
      <h1 className="text-2xl font-bold text-center">Accueil Nouveau Vendeur Sur Votre Établissement</h1>

      {sections.map((section, sectionIndex) => (
        <div key={section.id} className="space-y-4">
          <div className="flex items-center gap-3">
            <Input
              value={`${sectionIndex + 1}° ${section.title}`}
              onChange={(e) => updateSectionTitle(sectionIndex, e.target.value.replace(/^\d+°\s/, ""))}
              className="font-semibold text-lg flex-grow"
            />

            <Button variant="outline" size="icon" onClick={() => moveSection(sectionIndex, "up")} disabled={sectionIndex === 0}>🔼</Button>
            <Button variant="outline" size="icon" onClick={() => moveSection(sectionIndex, "down")} disabled={sectionIndex === sections.length - 1}>🔽</Button>
            <Button variant="destructive" size="icon" onClick={() => removeSection(sectionIndex)}>
              🗑️
            </Button>
          </div>

          <div className="space-y-2">
            {section.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center gap-3">
                <Label htmlFor={item} className="flex-grow whitespace-pre-line">
                  {item}
                </Label>
                <Button variant="ghost" size="icon" onClick={() => editItem(sectionIndex, itemIndex)}>
                  ✏️
                </Button>
                <Button variant="destructive" size="icon" onClick={() => removeItem(sectionIndex, itemIndex)}>
                  🗑️
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={() => addItemToSection(sectionIndex)}>
              + Ajouter un élément
            </Button>
          </div>
          <Separator />
        </div>
      ))}

      <Button variant="secondary" onClick={addSection} className="w-full">
        + Ajouter une section
      </Button>

      <div>
        <Label htmlFor="commentaire" className="font-semibold">
          Commentaire - Autres
        </Label>
        <Textarea id="commentaire" placeholder="Ajoutez un commentaire..." className="mt-2" value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Annuler</Button>
        <Button variant="default" onClick={handleSubmit}>
          Valider
        </Button>
      </div>
    </div>
  );
}
