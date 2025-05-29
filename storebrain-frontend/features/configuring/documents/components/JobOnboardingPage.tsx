'use client';

import { useState } from "react";
import OnboardingStepEditor from "./OnboardingStepEditor";
import { Users, Briefcase, FlaskConical } from "lucide-react";

export default function JobOnboardingPage() {
    const [selectedProfile, setSelectedProfile] = useState<"Vendeur" | "Responsable" | "Labo" | null>(null);

    const profileToJobOnboardingId: Record<string, number> = {
        Vendeur: 1,
        Responsable: 2,
        Labo: 3,
    };

    const icons = {
        Vendeur: <Users className="w-5 h-5" />,
        Responsable: <Briefcase className="w-5 h-5" />,
        Labo: <FlaskConical className="w-5 h-5" />,
    };

    const descriptions: Record<string, string> = {
        Vendeur: "Profil pour l'équipe de vente",
        Responsable: "Gestion des équipes et processus",
        Labo: "Spécialiste du contrôle qualité",
    };

    const colors: Record<string, string> = {
        Vendeur: "border-blue-500 text-blue-600 hover:bg-blue-50",
        Responsable: "border-green-500 text-green-600 hover:bg-green-50",
        Labo: "border-purple-500 text-purple-600 hover:bg-purple-50",
    };

    const handleBack = () => {
        setSelectedProfile(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            {!selectedProfile ? (
                <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                            <Users className="w-6 h-6 text-purple-600" />
                            Choix du profil
                        </h1>
                        <p className="text-gray-500 text-sm">Sélectionnez un profil pour configurer les étapes d'intégration.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(["Vendeur", "Responsable", "Labo"] as const).map((profile) => (
                            <button
                                key={profile}
                                onClick={() => setSelectedProfile(profile)}
                                className={`flex flex-col items-center px-6 py-4 rounded-xl border shadow-md transition-all duration-200
                                    ${colors[profile]} hover:scale-105 bg-white`}
                            >
                                <div className="mb-2">{icons[profile]}</div>
                                <span className="font-semibold text-lg">{profile}</span>
                                <span className="text-xs text-gray-500 mt-1">{descriptions[profile]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <OnboardingStepEditor
                    jobOnboardingId={profileToJobOnboardingId[selectedProfile]}
                    onBack={handleBack}
                />
            )}
        </div>
    );
}
