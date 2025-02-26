import { Difference } from "@/components/difference";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableWithHeader } from "@/features/employee-area/components/table-with-header"
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { UpdatePriceArticlesDialog } from "./update-price-articles-dialog";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/employee-area/components/status-badge";

export const UpdatePriceCard = ({priceUpdate, updateData, handleDeletePriceUpdateRowArticle, handleDeletePriceUpdateRow, handleUpdatePriceUpdateRowStatus, handleOrderDownload }: {priceUpdate: PriceUpdate, updateData: (rowIndex: number, articleId: number, value: number) => void, handleDeletePriceUpdateRowArticle: (rowId: number, articleId    : number) => void, handleDeletePriceUpdateRow: (rowId: number) => void, handleUpdatePriceUpdateRowStatus: (rowId: number) => void, handleOrderDownload: () => void}) => {

    const columns = useMemo<ColumnDef<PriceUpdateRow>[]>(() => [
        {
            header: 'Reference',
            accessorKey: 'reference',
            footer: ({table}) =>  `Total: ${table.getRowCount()}`
        },
        {
            header: 'Ancien prix façon',
            accessorKey: 'lastPrice',
        },
        {
            header: 'Nouveau prix façon',
            accessorKey: 'newPrice',
            cell: ({row}) => {
                return <>
                <span>{row.original.newPrice}</span>            
                <Difference difference={row.original.priceDifference} />                 
                </>
            }
        },
        {
            header: 'Nouveau prix achat',
            accessorKey: 'newPurchasePrice',
        },
        {
            header: 'Nouveau prix vente',
            accessorKey: 'newSalePrice',
        },
        {
            header: 'Stock',
            accessorKey: 'stock',
            cell: ({row}) => <UpdatePriceArticlesDialog reference={row.original.reference}  priceUpdateArticles={row.original.articles} updateData={updateData} handleDeletePriceUpdateRowArticle={handleDeletePriceUpdateRowArticle} newSalePrice={row.original.newSalePrice} handleUpdatePriceUpdateRowStatus={handleUpdatePriceUpdateRowStatus} status={row.original.status} />,
            footer: ({table}) => table.getRowModel().rows.reduce((acc, row) => acc + row.original.stock, 0)
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: ({row}) => <StatusBadge status={row.original.status} />
        },
         {
            header: 'Action',
            cell: ({row}) =>(
                <div className="flex items-end gap-2">
                    {row.original.status !== 'COMPLETED' ? <Button variant={'ghost'} color="success" onClick={() => handleUpdatePriceUpdateRowStatus(row.original.id)} ><Check className="w-4 h-4" /></Button> : null}
                    <Button variant={'ghost'} color="destructive" onClick={() => handleDeletePriceUpdateRow(row.original.id)} ><Trash2 className="w-4 h-4" /></Button>                    
                </div>
            )
            
         }
    ], []);
    return (
        <Card>
            <CardHeader className="flex justify-between">
                <CardTitle>
                    Changements
                </CardTitle>
                <Button onClick={handleOrderDownload}>Télécharger le fichier de commande</Button>
            </CardHeader>
            <CardContent>
                <TableWithHeader
                    data={priceUpdate.rows}
                    columns={columns}       
                    defaultSorting={[{id: 'reference', desc: false}]}
                    withFooter
                />
            </CardContent>
        </Card>
    )
}
