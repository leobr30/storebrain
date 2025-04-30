"use client"
import { ReactNode, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { CardTableWithButtons } from "@/components/tables/card-table-with-action";


import { DialogAddJob } from "./dialog-add-job";
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header";
import { DialogEditJob } from "./dialog-edit-job";
type Props = {
    jobs: [],
}



export const CardTable = ({ jobs }: Props) => {

    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header:({column}:{column:any}) => <DataTableColumnHeader column={column} title="Nom"/>
        },
        {
            id: 'action',
            header: 'Action',
            cell:({row}:{row:any}) => <DialogEditJob job={row.original} />
        }
    ], [])


    return (
        <div className="pt-1">
            <Card>
                <CardHeader className="border-none pb-0">
                    <CardTitle className="pb-0 flex flex-row justify-between">Emplois
                        <DialogAddJob />
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">

                    <CardTableWithButtons columns={columns} data={jobs} />
                </CardContent>
            </Card >
        </div>

    )
}