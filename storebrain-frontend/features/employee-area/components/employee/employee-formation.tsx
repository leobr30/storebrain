// c:\Users\Gabriel\Desktop\storebrain\storebrain-frontend\features\employee-area\components\employee\employee-formation.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrainingsForCurrentUser } from "../../actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Training } from "../../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "../status-badge";
import { formatDate } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { TrainingDrawer } from "../training-drawer/training-drawer";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function EmployeeFormation() {
    const { data: session } = useSession();
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathName = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchTrainings = async () => {
            if (!session?.user?.id) return;

            try {
                setLoading(true);
                const data = await getTrainingsForCurrentUser(session.user.id);
                if (data === null) {
                    setTrainings([]);
                } else {
                    setTrainings(data);
                }
            } catch (error) {
                console.error("❌ Erreur lors du chargement des formations :", error);
                setTrainings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTrainings();
    }, [session]);

    const handleViewTraining = (trainingId: number) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("trainingId", trainingId.toString());
        newSearchParams.delete("edit");
        router.push(`${pathName}?${newSearchParams.toString()}`);
    };

    const columns = useMemo<ColumnDef<Training>[]>(() => [
        {
            accessorKey: "date",
            header: "Date de création",
            cell: ({ row }) => <span>{formatDate(row.original.date, "dd/MM/yyyy")}</span>,
        },
        {
            accessorKey: "name",
            header: "Nom",
        },
        {
            accessorKey: "status",
            header: "Statut",
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            accessorKey: "realizedBy.name",
            header: "Réalisé par",
            cell: ({ row }) => <span>{row.original.realizedBy?.name || "Non renseigné"}</span>, 
        },
        {
            accessorKey: "actions",
            header: "Action",
            cell: ({ row }) => (
                <Button variant="ghost" onClick={() => handleViewTraining(row.original.id)}>
                    {row.original.status === "PENDING" ? "Continuer" : "Voir"}
                </Button>
            ),
        },
    ], [searchParams]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mes Formations</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="w-full h-12" />
                ) : trainings.length === 0 ? (
                    <p className="text-gray-500">Aucune formation trouvée.</p>
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
                                {trainings.map((training) => (
                                    <TableRow key={training.id}>
                                        {columns.map((column) => (
                                            <TableCell key={`${training.id}-${column.accessorKey}`}>
                                                {column.cell ? column.cell({ row: { original: training } as any }) : training[column.accessorKey]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
            <TrainingDrawer userId={session?.user?.id} />
        </Card>
    );
}
