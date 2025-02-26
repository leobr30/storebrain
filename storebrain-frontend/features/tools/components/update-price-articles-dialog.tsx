import { Difference } from "@/components/difference";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table"
import { TableWithHeader } from "@/features/employee-area/components/table-with-header";
import { ColumnDef } from "@tanstack/react-table";
import { Check, Trash, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebounce, useDebouncedCallback } from 'use-debounce';



export const UpdatePriceArticlesDialog = ({ reference, priceUpdateArticles, updateData, handleDeletePriceUpdateRowArticle, newSalePrice, handleUpdatePriceUpdateRowStatus, status }: { reference: string, priceUpdateArticles: PriceUpdateArticle[], updateData: (rowIndex: number, articleId: number, value: number) => any, handleDeletePriceUpdateRowArticle: (rowId: number, articleId: number) => any, newSalePrice: number, handleUpdatePriceUpdateRowStatus: (rowId: number) => any, status: string }) => {

    const [open, setOpen] = useState(false);
    const columns = useMemo<ColumnDef<PriceUpdateArticle>[]>(() => [
        {
            header: 'Magasin',
            accessorKey: 'shop',
        },
        {
            header: 'Article',
            accessorKey: 'article',
        },
        {
            header: 'Stock',
            accessorKey: 'stock',
        },
        {
            header: 'Prix achat',
            accessorKey: 'purchasePrice',
            
        },
        {
            header: 'Ancien Prix vente',
            accessorKey: 'lastSalePrice',
        },
        {
            header: 'Nouveau prix vente',
            accessorKey: 'newSalePrice',
            cell: ({ row }) => {
                const initialValue = row.original.newSalePrice;
                const [value, setValue] = useState(initialValue)
                const [debouncedValue] = useDebounce(value, 500)
                useEffect(() => {
                    if (value && value !== initialValue) {
                        updateData(row.original.priceUpdateRowId, row.original.id, value)
                    }
                }
                    , [debouncedValue])


                return (
                    <div className="flex items-center gap-2">
                        <Input type="number" value={value}
                            required
                            onChange={(e) => setValue(Number(e.target.value))} />
                        <Difference difference={row.original.newSalePrice - row.original.lastSalePrice} />
                    </div>
                )
            }
        },
        {
            id: 'coefficient',
            header: 'Coefficient',
            cell: ({ row }) => Math.round((row.original.newSalePrice / row.original.purchasePrice) * 100) / 100
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => <Button variant={'ghost'} color="destructive" onClick={() => handleDeletePriceUpdateRowArticle(row.original.priceUpdateRowId, row.original.id)} ><Trash2 className="w-4 h-4" /></Button>

        }
    ], []);


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button variant={'ghost'}>{priceUpdateArticles.length}</Button>
            </DialogTrigger>
            <DialogContent size="4xl">
                <DialogHeader>
                    <DialogTitle>{reference} - {newSalePrice}€</DialogTitle>
                </DialogHeader>
                <TableWithHeader
                    data={priceUpdateArticles.sort((a, b) => a.shop - b.shop)}
                    columns={columns}
                />
                <DialogFooter>
                    {status !== 'COMPLETED' ? <Button color="success" onClick={async () => {
                        await handleUpdatePriceUpdateRowStatus(priceUpdateArticles[0].priceUpdateRowId)
                        setOpen(false)
                    }}>Valider</Button> : null}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}