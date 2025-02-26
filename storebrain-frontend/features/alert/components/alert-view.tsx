"use client"
import { CustomTable } from "@/components/custom-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableWithHeader } from "@/features/employee-area/components/table-with-header";
import { Row } from "@tanstack/react-table";
import { useMemo } from "react";
import { AlertSheet } from "./alert-sheet";
import { Company } from "@/types/company-types";
import { lunchAlert } from "../alert-actions";




export const AlertView = ({ alerts, companies }: { alerts: Alert[], companies: Company[] }) => {

    const columns = useMemo(() => [
        {
            header: 'Nom',
            accessorKey: 'name',
        },
        {
            header: 'Description',
            accessorKey: 'description',
        },
        {
            header: 'Etat',
            accessorKey: 'isActive',
            cell: ({ row }: { row: Row<Alert>}) => (
                <Badge color={row.original.isActive ? 'success' : 'destructive'} variant="soft">{row.original.isActive ? 'Actif' : 'Inactif'}</Badge>
            )
        },
        {
            header: 'Actions',
            cell: ({ row }: { row: Row<Alert>}) => (
                <div className="flex items-end gap-2">
                    <Button onClick={() => lunchAlert(row.original.id)}>Lancer</Button>                    
                    <AlertSheet alert={row.original} companies={companies} />
                </div>
            )
        }
    ], []);

  return <div className="space-y-5">
    <div className="text-2xl font-medium text-default-800 ">Gestion des alertes</div>
    <Card>
      <CardHeader>
        <CardTitle>Liste des alertes</CardTitle>
      </CardHeader>
      <CardContent>
        <CustomTable data={alerts} columns={columns} defaultSorting={[{ id: 'name', desc: false }]} />
      </CardContent>
    </Card>
  </div>;
};


