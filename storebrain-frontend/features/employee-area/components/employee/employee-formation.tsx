// c:\Users\Gabriel\Desktop\storebrain\storebrain-frontend\features\employee-area\components\employee\employee-formation.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Training, EmployeeJobOnboarding } from "../../types"; // Import EmployeeJobOnboarding
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "../status-badge";
import { formatDate } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PencilLine } from "lucide-react";
import { CreateTrainingDialog } from "./create-training-dialog";

type EmployeeFormationProps = {
    employeeId: number;
    trainings?: Training[];
    jobOnboardings: EmployeeJobOnboarding[]; // Add jobOnboardings prop
};

export default function EmployeeFormation({ employeeId, trainings, jobOnboardings }: EmployeeFormationProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const isAdmin = session?.user?.name === "admin";

    // ✅ Définition de employeeOnboordingId
    const employeeOnboordingId = jobOnboardings.find(jobOnboarding => jobOnboarding.jobOnboardingStep.type === "TRAINING")?.id;

    const handleViewTraining = (trainingId: number, mode: 'view' | 'edit') => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("trainingId", trainingId.toString());
        newSearchParams.set("mode", mode);
        router.replace(`${pathName}?${newSearchParams.toString()}`);
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
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => handleViewTraining(row.original.id, 'view')}>
                        {row.original.status === "PENDING" ? "Continuer" : "Voir"}
                    </Button>
                    {isAdmin && (
                        <Button variant="ghost" onClick={() => handleViewTraining(row.original.id, 'edit')}>
                            <PencilLine /> Modifier
                        </Button>
                    )}
                </div>
            ),
        },
    ], [searchParams, isAdmin]);

    return (
        <Card>
            <CardHeader className="flex-row justify-between items-center ">
                <CardTitle>Formation</CardTitle>
                {employeeOnboordingId && <CreateTrainingDialog employeeId={employeeId} employeeOnboordingId={employeeOnboordingId} />} {/* Pass employeeOnboordingId to CreateTrainingDialog */}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="w-full h-12" />
                ) : trainings && trainings.length === 0 ? (
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
                                {trainings && trainings.map((training) => (
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
        </Card>
    );
}
