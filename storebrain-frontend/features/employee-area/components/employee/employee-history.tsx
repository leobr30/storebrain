"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from "@/components/ui/timeline";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import pdfIcon from "@/public/images/files/pdf.png";
import { getEmployeeHistory, downloadFormHistoryPdf } from "@/features/employee-area/components/employee/employee-history-action";

type EmployeeHistoryProps = {
    userId: number;
};

export const EmployeeHistory = ({ userId }: EmployeeHistoryProps) => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    console.log("📢 userId reçu dans EmployeeHistory :", userId);

    
    useEffect(() => {
        if (!userId || isNaN(Number(userId))) {
            console.error("❌ Erreur : userId est invalide ou manquant :", userId);
            return;
        }

        const fetchHistory = async () => {
            setLoading(true);
            try {
                const data = await getEmployeeHistory(userId);
                console.log("✅ Données de l'historique reçues :", data);
                setHistory(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("❌ Erreur lors du chargement de l'historique :", error);
                setHistory([]);
            }
            setLoading(false);
        };

        fetchHistory();
    }, [userId]);

    // 📌 Télécharger un PDF depuis l'historique
    const handleDownloadPdf = async (formId: string) => {
        try {
            await downloadFormHistoryPdf(formId);
        } catch (error) {
            console.error("❌ Erreur lors du téléchargement du PDF :", error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Historique des Formulaires</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p>🔄 Chargement...</p>
                ) : history.length === 0 ? (
                    <p>🚫 Aucun historique trouvé.</p>
                ) : (
                    <Timeline>
                        {history.map((record, index) => (
                            <TimelineItem key={record.id}>
                                <TimelineSeparator>
                                    <TimelineDot color="primary" variant="outline" />
                                    {index !== history.length - 1 ? <TimelineConnector /> : null}
                                </TimelineSeparator>
                                <TimelineContent>
                                    <div className="tm-content">
                                        <h2 className="font-semibold text-lg text-default-600">{record.form?.title ?? "Formulaire inconnu"}</h2>
                                        <p className="text-default-400">{new Date(record.createdAt).toLocaleDateString()}</p>

                                        {/* 🔥 Afficher correctement les réponses */}
                                        {Array.isArray(record.responses) ? (
                                            record.responses.map((response, idx) => (
                                                <div key={idx} className="mt-2">
                                                    <h3 className="font-semibold text-default-500">{response.title}</h3>
                                                    <ul className="list-disc pl-5">
                                                        {Array.isArray(response.items) && response.items.length > 0 ? (
                                                            response.items.map((item, i) => (
                                                                <li key={i} className="text-default-600">
                                                                    ✅ {item.label} : {item.selected ? "Oui" : "Non"}
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <p>⚠️ Aucune réponse disponible.</p>
                                                        )}
                                                    </ul>
                                                </div>
                                            ))
                                        ) : (
                                            <p>⚠️ Problème avec les réponses, format inattendu.</p>
                                        )}

                                    </div>
                                </TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>
                )}
            </CardContent>
        </Card>
    );
};
