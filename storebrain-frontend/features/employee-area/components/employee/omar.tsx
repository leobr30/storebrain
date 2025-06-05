"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";

import { getAllOmars } from "../../actions";
import { Omar } from "@/features/employee-area/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { OmarDialog } from "../monday-appointments/view/omar-dialog";

export default function EmployeeOmar() {
    const [omars, setOmars] = useState<Omar[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    useEffect(() => {
        const fetchOmars = async () => {
            try {
                const data = await getAllOmars();
                setOmars(data);
            } catch (error) {
                console.error("Erreur lors de la récupération des OMARs :", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOmars();
    }, []);

    const handleViewOmar = (omarId: number) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("omarId", omarId.toString());
        router.replace(`${pathname}?${newSearchParams.toString()}`);
    };

    const columns = useMemo<ColumnDef<Omar>[]>(() => [
        {
            accessorKey: "user.name",
            header: "Employé",
            cell: ({ row }) => <span>{row.original.user.name}</span>,
        },
        {
            accessorKey: "objective",
            header: "Objectif",
        },
        {
            accessorKey: "tool",
            header: "Moyens",
        },
        {
            accessorKey: "action",
            header: "Actions",
        },
        {
            accessorKey: "status",
            header: "Statut",
        },
        {
            accessorKey: "nextAppointment",
            header: "Prochain RDV",
            cell: ({ row }) => {
                const date = row.original.nextAppointment;
                return date && isValid(new Date(date))
                    ? format(new Date(date), "dd/MM/yyyy", { locale: fr })
                    : "-";
            },
        },
        {
            accessorKey: "actions",
            header: "Action",
            cell: ({ row }) => (
                <Button size="sm" variant="ghost" onClick={() => handleViewOmar(row.original.id)}>
                    Consulter
                </Button>
            ),
        },
    ], [searchParams]);

    return (
        <>
            <Card>
                <CardHeader className="flex-row justify-between items-center">
                    <CardTitle>OMAR</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="w-full h-12" />
                    ) : omars.length === 0 ? (
                        <p className="text-gray-500">Aucun OMAR trouvé.</p>
                    ) : (
                        <div className="rounded-md border overflow-x-auto custom-scrollbar">
                            <div className="min-w-[900px]">
                                <Table wrapperClass="h-[500px] overflow-auto custom-scrollbar" >
                                    <TableHeader className="bg-default-100 sticky top-0 z-10">
                                        <TableRow>
                                            {columns.map((column) => (
                                                <TableHead key={column.accessorKey}>{column.header}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {omars.map((omar) => (
                                            <TableRow key={omar.id}>
                                                {columns.map((column) => (
                                                    <TableCell key={`${omar.id}-${column.accessorKey}`}>
                                                        {column.cell
                                                            ? column.cell({ row: { original: omar } } as any)
                                                            : (omar as any)[column.accessorKey]}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <OmarDialog />
        </>
    );

}
