import { CardTableWithButtons } from "@/components/tables/card-table-with-action"
import { VirtualizedTable } from "@/components/tables/virtualized-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import { useMemo } from "react"
import { Analyze1DialogTableProduct } from "./analyze1-dialog-table-product"
import { formatNumber } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Props = {
    dialogData: any,
    closeDialog:() => any
}

export const Analyze1DialogProduct = ({ dialogData,closeDialog }:Props) => {

    const productDetailsColumns = useMemo<ColumnDef<any>[]>(() => [
        {
            header:'Magasin',
            accessorKey:'store',
            footer: 'Total'
        },
        {
            header:'Taille',
            accessorKey:'size',
            footer: props => `${props.table.getFilteredRowModel().flatRows.length} `
        },
        {
            header:'Tot Ventes',
            accessorKey:'totalSales',
            cell:({getValue}) => formatNumber(getValue() as number),
            footer: props => `${props.table.getFilteredRowModel().rows.reduce((a,b) => a + b.original.totalSales,0)} `
        },
        {
            header:'Tot CA HT',
            accessorKey:'totalSalesRevenue',
            cell:({getValue}) => formatNumber(getValue() as number)  + '€',
            footer: props => formatNumber(props.table.getFilteredRowModel().rows.reduce((a,b) => a + b.original.totalSalesRevenue,0)) + '€'
        },
        {
            header:'Tx Marge',
            accessorKey:'marginRate',
            cell:({getValue}) => formatNumber(getValue() as number)  + '%',
            // footer: props => formatNumber(props.table.getFilteredRowModel().rows.reduce((a,b) => a + b.original.totalSalesRevenue,0)) + '€'
        },
        {
            header:'Stock',
            accessorKey:'stock',
            cell:({getValue}) => formatNumber(getValue() as number),
            footer: props => formatNumber(props.table.getFilteredRowModel().rows.reduce((a,b) => a + b.original.stock,0))
        },
        {
            header:'PA Stock',
            accessorKey:'stockPurchasePrice',
            cell:({getValue}) => formatNumber(getValue() as number) + '€',
            footer: props => formatNumber(props.table.getFilteredRowModel().rows.reduce((a,b) => a + b.original.stockPurchasePrice,0)) + '€'
        },
        // {
        //     header:'DDV',
        //     accessorKey:'lastLifespan',
        //     cell:({getValue}) => formatNumber(getValue()),            
        // },
        {
            header:'PVP',
            accessorKey:'publicSalePrice',
            cell:({getValue}) => formatNumber(getValue() as number  ) + '€',            
        },
    
    ],[dialogData])
    
    return (
        <>
            <Dialog open onOpenChange={closeDialog} >

                <DialogContent size="full" className={"flex flex-col"}>
                    <DialogHeader>
                        <DialogTitle className="text-base font-medium text-default-700 ">
                            {dialogData.supplier} - {dialogData.reference}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="w-full flex flex-row">
                        <div>
                        {dialogData.image ? 
                            <Image onClick={closeDialog} src={`http://192.168.1.104/produit/${dialogData.image}`} height={200} width={200} alt={dialogData.image} /> :                        
                        <p>Image non disponible.</p>
                        }
                        </div>
                        <div className="w-full">
                            <Table className="text-center text-bold font-medium text-default-900">
                                <TableHeader className="bg-default-100 m-0 ">
                                    <TableRow>
                                        {/* <TableHead>Matière</TableHead> */}
                                        <TableHead>Poids</TableHead>
                                        <TableHead>Façon</TableHead>
                                        <TableHead>Rem %</TableHead>
                                        <TableHead>Unité</TableHead>
                                        <TableHead>Prix HT</TableHead>
                                        <TableHead>Coef</TableHead>
                                        <TableHead>PVP € TTC</TableHead>
                                        <TableHead>Mrg %</TableHead>
                                        <TableHead>Actif</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody >
                                    <TableRow className="text-bold font-medium text-default-900">
                                        {/* <TableCell>-</TableCell> */}
                                        <TableCell className="text-bold font-medium text-default-900">{dialogData.weight}gr</TableCell>
                                        <TableCell className="text-bold font-medium text-default-900">{dialogData.productPrice}€</TableCell>
                                        <TableCell className="text-bold font-medium text-default-900">{dialogData.discountRate}%</TableCell>
                                        <TableCell className="text-bold font-medium text-default-900">{dialogData.unit}</TableCell>
                                        <TableCell className="text-bold font-medium text-default-900">{dialogData.purchasePrice}€</TableCell>
                                        <TableCell className="text-bold font-medium text-default-900">{formatNumber(dialogData.coefficient)}</TableCell>
                                        <TableCell className="text-bold font-medium text-default-900">{dialogData.productPublicSalePrice}€</TableCell>
                                        <TableCell className="text-bold font-medium text-default-900">{formatNumber(dialogData.productMarginRate)}%</TableCell>
                                        <TableCell className="text-bold font-medium text-default-900">{dialogData.isEnabled ? 'Oui' : 'Non'}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <div className="w-full h-full" >
                        <Analyze1DialogTableProduct 
                        columns={productDetailsColumns}
                        data={dialogData.details ?? []}
                        defaultSorting={{ id: 'totalSalesRevenue', desc: true }}
                        dense={false}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}