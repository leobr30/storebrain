"use client"

import { TempNameTable } from "@/components/tables/custom-table"
import { DialogAddIntegration } from "./dialog-add-integration"
import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Job } from "@/types/employee-area-types"

export const IntegrationTable = ({
    jobs,
    integrations
}:{jobs:Job[],integrations:any[]}) => {

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey:'job.name',
            header: 'Nom'
        },
        {
            accessorFn:(row) => row.steps.length, 
            header: 'Nb étapes'
        }
    ],[])

    return (
            <TempNameTable 
            columns={columns as []}
            columnFilterName="name"
            rightBtn={<DialogAddIntegration jobs={jobs}/>}
            data={integrations as []}
            />
    )
}