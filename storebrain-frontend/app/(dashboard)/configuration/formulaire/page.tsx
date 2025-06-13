"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { saveDoc } from "../action";
import { PencilLine, Trash2, Eraser, ArrowDown, ArrowUp, Plus, Save, X, GripVertical, FileText, CheckCircle2 } from 'lucide-react';
import toast from "react-hot-toast";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import EditItemDialog from "@/features/configuring/documents/components/EditItemDialog";

export default function DocumentForm() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status !== "loading") {
            const hasPermission = session?.user?.permissions?.some(
                (p) => p.action === "manage" && p.subject === "all"
            );

            if (!hasPermission) {
                router.replace("/error-page/403");
            }
        }
    }, [session, status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

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
                "« Arrivée à l'heure c'est déjà être en retard » donc ( - 10 minutes avant l'horaire pour poser les affaires personnelles...",
                "Regarder votre tenue, Dress code noir, coiffure, maquillage, bijoux et montre portés dans la norme et respect du contrat de travail.",
                "Avant de démarrer votre journée de travail vous devez prendre votre gant, badge et clés + signer la fiche",
                "Obligation de Mettre votre badge, gant, clef autour du coup, pour pouvoir badger afin d'identifier votre présence.",
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
    const [isLoading, setIsLoading] = useState(false);

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

    const removeItem = (sectionIndex: number, itemIndex: number) => {
        setSections((prev) => prev.map((section, i) => (i === sectionIndex ? { ...section, items: section.items.filter((_, j) => j !== itemIndex) } : section)));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
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
            });

            toast.success("Formulaire sauvegardé avec succès !");
        } catch (error) {
            console.error("❌ Erreur:", error);
            toast.error('Impossible de sauvegarder le formulaire');
        } finally {
            setIsLoading(false);
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

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState("");
    const [addingSectionIndex, setAddingSectionIndex] = useState<number | null>(null);

    const openEditDialog = (sectionIdx: number, itemIdx: number) => {
        setEditingSectionIndex(sectionIdx);
        setEditingItemIndex(itemIdx);
        setEditingValue(sections[sectionIdx].items[itemIdx]);
        setDialogOpen(true);
    };

    const saveEditedItem = (value: string) => {
        if (editingSectionIndex !== null && editingItemIndex !== null) {
            setSections(prev =>
                prev.map((section, i) =>
                    i === editingSectionIndex
                        ? {
                            ...section,
                            items: section.items.map((item, j) =>
                                j === editingItemIndex ? value : item
                            ),
                        }
                        : section
                )
            );
        }
    };

    const openAddItemDialog = (sectionIdx: number) => {
        setEditingValue("");
        setAddingSectionIndex(sectionIdx);
        setDialogOpen(true);
    };

    const saveNewItem = (value: string) => {
        if (addingSectionIndex !== null) {
            setSections((prev) =>
                prev.map((section, i) =>
                    i === addingSectionIndex
                        ? { ...section, items: [...section.items, value] }
                        : section
                )
            );
            setAddingSectionIndex(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Accueil Nouveau Vendeur
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Configuration du processus d'accueil pour votre établissement
                            </p>
                        </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{sections.length} sections configurées</span>
                        <span className="mx-2">•</span>
                        <span>{sections.reduce((acc, section) => acc + section.items.length, 0)} éléments</span>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section, sectionIndex) => (
                        <div key={section.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl">
                            {/* Section Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-white/80">
                                        <GripVertical className="w-5 h-5" />
                                        <span className="text-sm font-medium">Section {sectionIndex + 1}</span>
                                    </div>
                                    <Input
                                        value={section.title}
                                        onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                                        className="flex-grow bg-white/10 border-white/20 text-white placeholder:text-white/60 font-semibold text-lg"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => moveSection(sectionIndex, "up")}
                                            disabled={sectionIndex === 0}
                                            className="text-white hover:bg-white/10 disabled:opacity-50"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => moveSection(sectionIndex, "down")}
                                            disabled={sectionIndex === sections.length - 1}
                                            className="text-white hover:bg-white/10 disabled:opacity-50"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeSection(sectionIndex)}
                                            className="text-red-200 hover:bg-red-500/20 hover:text-red-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Section Content */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {section.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="group flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {itemIndex + 1}
                                                </span>
                                            </div>
                                            <Label className="flex-grow text-gray-700 leading-relaxed whitespace-pre-line">
                                                {item}
                                            </Label>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditDialog(sectionIndex, itemIndex)}
                                                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                                >
                                                    <PencilLine className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(sectionIndex, itemIndex)}
                                                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                                >
                                                    <Eraser className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        variant="outline"
                                        onClick={() => openAddItemDialog(sectionIndex)}
                                        className="w-full border-dashed border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 py-6"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Ajouter un élément
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Section Button */}
                <div className="mt-8">
                    <Button
                        variant="outline"
                        onClick={addSection}
                        className="w-full py-6 border-dashed border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 text-lg"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Ajouter une nouvelle section
                    </Button>
                </div>

                {/* Action Buttons */}
                <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600">
                            Enregistrez vos modifications pour les appliquer
                        </p>
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="px-8 py-3"
                                onClick={() => router.back()}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Annuler
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Sauvegarde...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Sauvegarder
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Dialog */}
                <EditItemDialog
                    open={dialogOpen}
                    onClose={() => {
                        setDialogOpen(false);
                        setAddingSectionIndex(null);
                        setEditingSectionIndex(null);
                        setEditingItemIndex(null);
                    }}
                    onSave={addingSectionIndex !== null ? saveNewItem : saveEditedItem}
                    defaultValue={editingValue}
                />
            </div>
        </div>
    );
}