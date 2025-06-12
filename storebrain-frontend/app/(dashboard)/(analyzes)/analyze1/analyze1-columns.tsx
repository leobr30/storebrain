import { DataTableColumnHeader } from "@/components/tables/data-table-column-header";
import { formatNumber } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Dispatch, useMemo } from "react";
import { AlertTriangle, Smile, LifeBuoy, Search, Trash2, HelpCircle, Award } from 'lucide-react'
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Difference } from "@/components/difference";
import { GroupingResult } from "./analyze1-types";

export const analyze1Columns = ({ openNewDialog }:any) => useMemo<ColumnDef<any>[]>(() => [
    {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Label" />
        ),
        accessorKey: 'label',
        cell: ({ getValue, row }) => <div
        >
            <Button
                className="p-0 h-auto hover:bg-transparent bg-transparent text-primary hover:text-primary/80  hover:underline"
                onClick={() => openNewDialog(row.original)}>
                {getValue() as string}
            </Button>            </div>,
        footer: 'Total'
    },
    {
        header: 'TOTAL',
        footer:'TOTAL',
        columns: [
            {
                header: 'CA HT',
                footer: 'CA HT',
                columns: [
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N" />
                        ),
                        accessorKey: 'totalSalePrice',
                        cell: props => <div>{formatNumber(props.getValue())}€ <Difference difference={props.row.original.differenceSalePriceN1} symbol="€"/></div>,
                        footer: (props) => <div>{formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('totalSalePrice') as number) , 0))}€
                        <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.differenceSalePriceN1, 0)} symbol="€" /></div> ,

                    },
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N-1" />
                        ),
                        accessorKey: 'totalSalePriceN1',
                        cell: props => <div
                        >{formatNumber(props.getValue())}€</div>,
                        footer: (props) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a +  (b.getValue('totalSalePriceN1') as number) , 0))}€`

                    },
                ]
            },

            {
                header:'%',
                footer:'%',
                columns:[
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N" />
                        ),
                        footer:'N',
                        accessorKey: 'salePricePercentage',
                        cell: props => <div>{formatNumber(props.getValue())}% <Difference difference={props.row.original.differenceSalePricePercentageN1} symbol="%"/></div>,
                    },
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N-1" />
                        ),
                        footer:'N-1',
                        accessorKey: 'salePricePercentageN1',
                        cell: props => <div>{formatNumber(props.getValue())}%</div>,    
                    }
                ]
            },
            {
                header:'VENTES',
                footer:'VENTES',
                columns:[
                    {
                        header: ({ column }) => ( 
                            <DataTableColumnHeader column={column} title="N" />
                        ),
                        accessorKey: 'totalSale',
                        cell: props => <div>{formatNumber(props.getValue())} <Difference difference={props.row.original.differenceN1}/></div>,
                        footer: (props) => <div>{formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a +  (b.getValue('totalSale') as number), 0))}
                        <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.differenceN1, 0)} /></div> ,
                    },
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N-1" />
                        ),
                        accessorKey: 'totalSaleN1',
                        cell: props => <div>{formatNumber(props.getValue())}</div>,
                        footer: (props) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('totalSale') as number), 0))}`,
                    },                   
                ]
            }
            ,
            {
                header:'MARGE',
                footer:'MARGE',
                columns: [
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N" />
                        ),
                        accessorKey: 'totalMargin',
                        cell: props => <div>{formatNumber(props.getValue())}€ <Difference difference={props.row.original.differenceMarginN1} symbol="€"/></div>,
                        footer: (props) => <div>{formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('totalMargin') as number), 0))}€ <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.differenceMarginN1, 0)} symbol="€" /></div> ,
                    },
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N-1" />
                        ),
                        accessorKey: 'totalMarginN1',
                        cell: props => <div>{formatNumber(props.getValue())}€</div>,
                        footer: (props) => <div>{formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('totalMarginN1') as number), 0))}€</div>,
                    },
                ]
            },
            {
                header:'STOCK',
                footer:'STOCK',
                columns:[
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N" />
                        ),
                        accessorKey: 'stock',
                        cell: props => <div>{formatNumber(props.getValue())} <Difference difference={props.row.original.differenceStockN1}/></div>,
                        footer: (props) => <div>
                            {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('stock') as number), 0)) }
                             <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.differenceStockN1, 0)} />
                        </div> ,
                    },
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N-1" />
                        ),
                        accessorKey: 'stockN1',
                        cell: props => <div>{formatNumber(props.getValue())} </div>,
                        footer: (props) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('stockN1') as number), 0))}`,
                    },
                ]
            },
            {
                header:'PA STOCK',
                footer:'PA STOCK',
                columns: [
                    
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N" />
                        ),
                        accessorKey: 'stockPurchasePrice',
                        cell: props => <div>{formatNumber(props.getValue())}€ <Difference difference={props.row.original.differenceStockPurchasePriceN1} symbol="€"/></div>,
                        footer: (props) => <div>{formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('stockPurchasePrice') as number), 0))}€ <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.differenceStockPurchasePriceN1, 0)} symbol="€" /></div>,
                    },
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N-1" />
                        ),
                        accessorKey: 'stockPurchasePriceN1',
                        cell: props => <div>{formatNumber(props.getValue())}€</div>,
                        footer: (props) => <div>
                            {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('stockPurchasePriceN1') as number), 0))}€
                             
                        </div> ,
                    }
                ]
            }
            
        ]
    },
    // ...analyzeData.headerColumns.map(column => (
    //     {
    //         id: `H-${column.index}`,
    //         header: column.title,
    //         columns: [
    //             {
    //                 id: `HC0-${column.index}`,
    //                 header: ({ column }) => (
    //                     <DataTableColumnHeader column={column} title="CA HT" />
    //                 ),
    //                 accessorFn: row => row.dataColumns[column.index].salePrice,
    //                 cell: props => <div
    //                     className={clsx(props.row.original.isPareto && "bg-yellow-300", "h-full content-center")}>{formatNumber(props.getValue())}€</div>
    //             },
    //             {
    //                 id: `HC1-${column.index}`,
    //                 header: ({ column }) => (
    //                     <DataTableColumnHeader column={column} title="VENTES" />
    //                 ),
    //                 accessorFn: row => row.dataColumns[column.index].sale,
    //                 cell: props => <div className={clsx(props.row.original.isPareto && "bg-yellow-300", "h-full content-center")}>{formatNumber(props.getValue())}</div>
    //             },
    //             {
    //                 id: `HC2-${column.index}`,
    //                 header: ({ column }) => (
    //                     <DataTableColumnHeader column={column} title="MARGE" />
    //                 ),
    //                 accessorFn: row => row.dataColumns[column.index].margin,
    //                 cell: props => <div className={clsx(props.row.original.isPareto && "bg-yellow-300", "h-full content-center")}>{formatNumber(props.getValue())}€</div>
    //             }
    //         ]
    //     }
    // )) as ColumnDef<any>[]
], [])

export const analyze1ProductColumns = () => useMemo<ColumnDef<any>[]>(() => [
    {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="REFERENCE" />
        ),
        accessorKey: 'reference',
        footer: 'Total'
    },
    {
        accessorKey: 'image',
        cell: props => props.getValue() !== null ?
            <Image src={`http://192.168.1.104/produit/${props.getValue()}`} height={200} width={200} alt={props.getValue() as string} /> :
            null,
        header: 'IMAGE',
        footer: (props) => `${formatNumber(props.table.getFilteredRowModel().rows.length)}`
    },
    {
        accessorKey: 'size',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="TAILLE" />
        ),

    },    
    {
        accessorKey: 'totalSale',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="TOT VENTES" />
        ),
        cell: ({ getValue, row }) => <>
        {formatNumber(getValue() as number)}{' '}
        <Difference difference={row.original.totalSaleDifferenceN1}/>
        </>,
        footer: (props) => <>
        {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('totalSale') as number), 0))}
        <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSaleDifferenceN1,0)}/>
        </>
            
    },
    {
        accessorKey: 'sale',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="VENTES" />
        ),
        cell: ({ getValue, row }) => <div>
        {formatNumber(getValue() as number)}
        {' '}
        <Difference difference={row.original.saleDifferenceN1} />
        </div>,
        footer: (props) => 
        <>
        {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('sale') as number), 0))}
        {' '}
        <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.saleDifferenceN1,0)}/>
        </>
    },
    {
        accessorKey: 'totalSalePrice',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="CA VENTES" />
        ),
        cell: ({ getValue }) => `${formatNumber(getValue() as number)}€`,
        footer: (props) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('totalSalePrice') as number), 0))}€`
    },
    {
        accessorKey: 'marginRate',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="MARGES %" />
        ),
        cell: ({ getValue }) => `${formatNumber(getValue() as number)}%`,
    },
    {
        accessorKey: 'totalStock',
        cell: props => <div
            className={"h-full w-full justify-center items-center flex flex-col"}>
            {props.row.original.hasStockInOtherRange && <AlertTriangle className="h-10" />}
            {formatNumber(props.getValue() as number)}
            {' '}
            <Difference difference={props.row.original.stockDifferenceN1} />

        </div>,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Stock" />
        ),
        footer: (props) => <>
        {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('totalStock') as number), 0))}
        {' '}
        <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.stockDifferenceN1, 0)}/>
        </>
    },
    {
        accessorKey: 'stockPurchasePrice',
        cell: ({getValue, row}) => <>
        {formatNumber(getValue() as number)}€
        {' '}
        <Difference difference={row.original.stockPurchasePriceDifferenceN1} symbol="€"/>
        </>,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="PA Stock" />
        ),
        footer: (props) => <>
        {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('stockPurchasePrice') as number), 0))}€
        {' '}
        <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.stockPurchasePriceDifferenceN1, 0)} symbol="€"/>
        </>
    },
    {
        accessorKey: 'publicSalePrice',
        cell: ({ getValue }) => `${formatNumber(getValue() as number)}€`,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="PVP" />
        ),
        footer: (props) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('totalStock') as number) * (b.getValue('publicSalePrice') as number), 0))}`
    },
    {
        accessorKey: 'order',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="CDE" />
        ),
        cell: ({ getValue }) => formatNumber(getValue() as number),
        footer: (props) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('order') as number), 0))}`
    },
    //ICON
    {
        accessorKey: 'icon',
        cell: props =>
            <div className="flex items-center justify-center">
                {props.getValue() === 0 ? <Smile className="h-10 items-center" /> :
                    props.getValue() === 1 ? <LifeBuoy className="h-10" /> :
                        props.getValue() === 2 ? <Search className="h-10" /> :
                            props.getValue() === 3 ? <Trash2 className="h-10" /> :
                                <HelpCircle className="h-10" />}
            </div>
        ,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Perf" />
        ),
        filterFn: (row, columnIds, filterValue) => filterValue.includes(row.getValue(columnIds)),
    },
    {
        accessorKey: 'ddv',
        cell: ({ getValue }) => formatNumber(getValue() as number),
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="DDV" />
        ),
    },
    {
        accessorKey: 'unitOrder',
        cell: ({ getValue }) => formatNumber(getValue() as number),
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="CU" />
        ),
        footer: (props) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + (b.getValue('unitOrder') as number), 0))}`
    },
    // {
    //     accessorKey: 'rotationRate',
    //     cell: ({ getValue }) => formatNumber(getValue()),
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="TX ROTA" />
    //     ),
    // },
    // {
    //     accessorKey: 'coverageRate',
    //     cell: ({ getValue }) => formatNumber(getValue()),
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="TX COUVERTURE" />
    //     )
    // }
], [])

export const getAnalyze1Columns = ({ openNewDialog }: { openNewDialog: (product: any) => void }) => useMemo<ColumnDef<GroupingResult>[]>(() => [
    {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Label" />
        ),
        accessorKey: 'label',
        cell: ({ getValue, row }) => <div
        >
            <Button
                className="p-0 h-auto hover:bg-transparent bg-transparent text-primary hover:text-primary/80  hover:underline"
                onClick={() => openNewDialog(row.original)}>
                {getValue() as string}
                {row.original.isInPareto && <Award className="h-5 text-yellow-400"/>}
            </Button>            </div>,
        footer: 'Total'
    },
    {
        header: 'TOTAL',
        footer:'TOTAL',
        columns: [
            {
                header: 'CA HT',
                footer: 'CA HT',
                columns: [
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N" />
                        ),
                        accessorKey: 'totalSalesRevenue',
                        cell: props => <div>{formatNumber(props.getValue())}€ <Difference difference={props.row.original.totalSalesRevenueDifferenceN1} symbol="€"/></div>,
                        footer: (props) => <div>{formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSalesRevenue, 0))}€
                        <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSalesRevenueDifferenceN1, 0)} symbol="€" /></div> ,

                    },
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N-1" />
                        ),
                        accessorKey: 'totalSalesRevenueN1',
                        cell: props => <div
                        >{formatNumber(props.getValue())}€</div>,
                        footer: (props) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSalesRevenueN1, 0))}€`

                    },
                ]
            },

            {
                header:'%',
                footer:'%',
                columns:[
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N" />
                        ),
                        footer:'N',
                        accessorKey: 'totalSalesRevenuePercentage',
                        cell: props => <div>{formatNumber(props.getValue())}% <Difference difference={props.row.original.totalSalesRevenuePercentageDifferenceN1} symbol="%"/></div>,
                    },
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N-1" />
                        ),
                        footer:'N-1',
                        accessorKey: 'totalSalesRevenuePercentageN1',
                        cell: props => <div>{formatNumber(props.getValue())}%</div>,    
                    }
                ]
            },
            {
                header:'VENTES',
                footer:'VENTES',
                columns:[
                    {
                        header: ({ column }) => ( 
                            <DataTableColumnHeader column={column} title="N" />
                        ),
                        accessorKey: 'totalSales',
                        cell: props => <div>{formatNumber(props.getValue())} <Difference difference={props.row.original.totalSalesDifferenceN1}/></div>,
                        footer: (props) => <div>{formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSales, 0))}
                        <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSalesN1, 0)} /></div> ,
                    },
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N-1" />
                        ),
                        accessorKey: 'totalSalesN1',
                        cell: props => <div>{formatNumber(props.getValue())}</div>,
                        footer: (props) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSalesN1, 0))}`,
                    },
                ]
            }
            ,
            {
                header:'MARGE',
                footer:'MARGE',
                columns: [
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N" />
                        ),
                        accessorKey: 'totalSalesMargin',
                        cell: props => <div>{formatNumber(props.getValue())}€ <Difference difference={props.row.original.totalSalesMarginDifferenceN1} symbol="€"/></div>,
                        footer: (props) => <div>{formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSalesMargin, 0))}€ <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSalesMarginDifferenceN1, 0)} symbol="€" /></div> ,
                    },
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N-1" />
                        ),
                        accessorKey: 'totalSalesMarginN1',
                        cell: props => <div>{formatNumber(props.getValue())}€</div>,
                        footer: (props) => <div>{formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSalesMarginN1, 0))}€</div>,
                    },
                ]
            },
            {
                header:'STOCK',
                footer:'STOCK',
                columns:[
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N" />
                        ),
                        accessorKey: 'stock',
                        cell: props => <div>{formatNumber(props.getValue())} <Difference difference={props.row.original.stockDifferenceN1}/></div>,
                        footer: (props) => <div>
                            {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.stock, 0)) }
                             <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.stockDifferenceN1, 0)} />
                        </div> ,
                    },
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N-1" />
                        ),
                        accessorKey: 'stockN1',
                        cell: props => <div>{formatNumber(props.getValue())} </div>,
                        footer: (props) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.stockN1, 0))}`,
                    },
                ]
            },
            {
                header:'PA STOCK',
                footer:'PA STOCK',
                columns: [
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N" />
                        ),
                        accessorKey: 'stockPurchasePrice',
                        cell: props => <div>{formatNumber(props.getValue())}€ <Difference difference={props.row.original.stockPurchasePriceDifferenceN1} symbol="€"/></div>,
                        footer: (props) => <div>{formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.stockPurchasePrice, 0))}€ <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.stockPurchasePriceDifferenceN1, 0)} symbol="€" /></div>,
                    },
                    {
                        header: ({ column }) => (
                            <DataTableColumnHeader column={column} title="N-1" />
                        ),
                        accessorKey: 'stockPurchasePriceN1',
                        cell: props => <div>{formatNumber(props.getValue())}€</div>,
                        footer: (props) => <div>
                            {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.stockPurchasePriceN1, 0))}€
 
                        </div> ,
                    }
                ]
            }
        ]
    },
], [])


export const getAnalyze1ProductColumns = (setProductData:Dispatch<any>) => useMemo<ColumnDef<any>[]>(() => [
    {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="FOURNISSEUR" />
        ),
        accessorKey: 'supplier',
        footer: 'Total'
    },
    {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="REFERENCE" />
        ),
        accessorKey: 'reference',
        cell: ({row}) => <div className="flex flex-row p-0 h-auto align-middle justify-center">
        {row.original.reference}
        {row.original.isInPareto && <Award className="h-5 text-yellow-400"/>}
        </div>,
        footer: (props) => `${formatNumber(props.table.getFilteredRowModel().rows.length)}`
    },
    {
        accessorKey: 'image',
        cell: props => props.getValue() !== null ?
            <Image onClick={() => setProductData(props.row.original)} src={`http://192.168.1.104/produit/${props.getValue()}`} height={200} width={200} alt={props.getValue() as string} /> :
            null,
        header: 'IMAGE',
        footer: (props) =>`Pareto:${props.table.getFilteredRowModel().rows.filter(w => w.original.isInPareto).length} (${(props.table.getFilteredRowModel().rows.filter(w => w.original.isInPareto).length / props.table.getFilteredRowModel().rows.length* 100).toLocaleString() }%)`          
    },
    {
        accessorKey: 'totalSales',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="TOT VENTES" />
        ),
        cell: ({ getValue, row }) => <div className="flex flex-col justify-center">
            <div className="flex-row">
            {formatNumber(getValue() as number)}{' '}        
            <Difference difference={row.original.totalSalesDifferenceN1}/>
            </div>        
        {row.original.bestSalesPrice && `Best: ${row.original.bestSalesPrice}€`}
        </div>,
        footer: (props) => <>
        {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSales, 0))}
        <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSalesDifferenceN1,0)}/>
        </>            
    },
    {
        accessorKey: 'totalSalesRevenue',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="CA VENTES" />
        ),
        cell: ({ getValue,row }) => 
            <>
            {formatNumber(getValue() as number)}€
            {' '}
            <Difference difference={row.original.totalSalesDifferenceRevenueN1} symbol="€"/>
            </>,
        footer: (props) => 
            <>
        {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSalesRevenue, 0))}€
        <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSalesDifferenceRevenueN1,0)} symbol="€"/>
        </>            
            
    },
    {
        accessorKey: 'sales',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="VENTES" />
        ),
        cell: ({ getValue, row }) => <>
        {formatNumber(getValue() as number)}{' '}
        <Difference difference={row.original.salesDifferenceN1}/>
        </>,
        footer: (props) => <>
        {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.sales, 0))}
        <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.salesDifferenceN1,0)}/>
        </>            
    },
    {
        accessorKey: 'unitOrders',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="CU" />
        ),
        cell: ({ getValue, row }) => <>
        {formatNumber(getValue() as number)}{' '}
        <Difference difference={row.original.unitOrdersDifferenceN1}/>
        </>,
        footer: (props) => <>
        {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.unitOrders, 0))}
        <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.unitOrdersDifferenceN1,0)}/>
        </>
    },
    {
        accessorKey: 'totalSalesMarginRate',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="TX MARGE" />
        ),
        cell: ({ getValue, row }) => <>
        {formatNumber(getValue() as number)}%{' '}
        <Difference difference={row.original.totalSalesMarginRateDifferenceN1} symbol="%"/>
        </>,
        // footer: (props) => <>
        // {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.totalSal, 0))}
        // <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.unitOrdersDifferenceN1,0)}/>
        // </>
    },
    {
        accessorKey: 'stock',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="STOCK" />
        ),
        cell: ({ getValue, row }) => <div className="flex flex-col">
            <div className="flex justify-center">
            {formatNumber(getValue() as number)}{' '}
            <Difference difference={row.original.stockDifferenceN1}/>
            </div>
        
        {row.original.stockInfo}
        </div>,
        footer: (props) => <>
        {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.stock, 0))}
        <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.stockDifferenceN1,0)}/>
        </>            
    },
    {
        accessorKey: 'stockPurchasePrice',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="PA STOCK" />
        ),
        cell: ({ getValue, row }) => <>
        {formatNumber(getValue() as number)}€{' '}
        <Difference difference={row.original.stockPurchasePriceDifferenceN1} symbol="€"/>
        </>,
        footer: (props) => <>
        {formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.stockPurchasePrice, 0))}
        <Difference difference={props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.stockPurchasePriceDifferenceN1,0)} symbol="€"/>
        </>            
    },
    {
        accessorKey: 'publicSalePrice',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="PVP" />
        ),
        cell: ({ getValue }) => `${formatNumber(getValue() as number)}€` ,
    },
    {
        accessorKey: 'orders',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="CDE" />
        ),
        cell: ({ getValue }) => formatNumber(getValue() as number),
        footer: (props) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a, b) => a + b.original.orders, 0))}`
    },
],[])