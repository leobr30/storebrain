import { CardTableWithButtons } from "@/components/tables/card-table-with-action"
import { Card } from "@/components/ui/card"
import { ColumnDef } from "@tanstack/react-table"
import { Dispatch, useMemo, useState } from "react"
import clsx from "clsx";
import { formatNumber } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { analyze1Columns, getAnalyze1Columns } from "./analyze1-columns";
import { GroupingResult } from "./analyze1-types";
import { Analyze1DialogTableProduct } from "./analyze1-dialog-table-product";
import { Analyze1DialogProduct } from "./analyze1-dialog-product";
type Props = {
    analyzeData: GroupingResult[],
    setDialogsData: Dispatch<any>

}

export const Analyze1Result = ({
    analyzeData,
    setDialogsData }: Props) => {

        

    const openNewDialog = (row: GroupingResult) => {
        setDialogsData((prevState: GroupingResult[]) => [...prevState, row])
    }




    const analyze1Columns = getAnalyze1Columns({ openNewDialog });


    return (            
        <Card
            title="Resultat"
        >
            <CardTableWithButtons
                columns={analyze1Columns as ColumnDef<any>[]}
                data={analyzeData as []}
                defaultSorting={{ id: 'totalSalesRevenue', desc: true }}
                dense
                bordered />
        </Card>
    )
}