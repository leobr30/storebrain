import { CardTableWithButtons } from "@/components/tables/card-table-with-action"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatNumber } from "@/lib/utils"
import { clsx } from "clsx"
import { Dispatch, useMemo } from "react"
import { Button } from "@/components/ui/button";
import { Difference } from "@/components/difference"
import { GroupingRange } from "./analyze1-types"
type Props = {
    data: GroupingRange[],
    salePriceMedian: number,
    title: string,
    setDialogsData: Dispatch<any>,
    products: []
}

export const Analyze1DialogRanges = ({ data, salePriceMedian, title, setDialogsData, products }: Props) => {

    const openDetailDialog = (row: any) => {
        setDialogsData((prevState: any) => [...prevState, ({
            label: title + ' - ' + row.label + '€',
            products: row.products
        })])
    }

    const openProductsDialog = (label: string, products: any) => {
        setDialogsData((prevState: any) => [...prevState, ({
            label: title + ' - ' + label + '€',
            products: products
        })])
    }

    const openTotalDetailDialog = () => {
        setDialogsData((prevState: any) => [...prevState, ({
            label:title + ' - Tous',
            products
        })])
    }

    const columns = useMemo(() => [
        {
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Gammes" />
            ),
            accessorKey: 'label',
            cell: ({ getValue, row }: any) => <div
                className={clsx(row.original.isMedian && "bg-destructive  font-bold !bg-opacity-50")}
                onClick={() => openDetailDialog(row.original)}
            ><Button className="p-0 h-auto hover:bg-transparent bg-transparent text-primary hover:text-primary/80  hover:underline">
                    {getValue() as string}€
                </Button> </div>,
            footer: () => <Button onClick={() => openTotalDetailDialog()} className="p-0 h-auto hover:bg-transparent bg-transparent text-primary hover:text-primary/80  hover:underline">
                Total
            </Button>
        },
        {
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Stock" />
            ),
            accessorKey: 'stock',
            cell: ({ getValue, row }: any) => <div className={clsx(row.original.isMedian && "bg-destructive  font-bold !bg-opacity-50")}>{getValue() as string}</div>,
            footer: (props: any) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a: any, b: any) => a + b.getValue('stock'), 0))}`
        },
        {
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Vente" />
            ),
            accessorKey: 'sale',
            cell: ({ getValue, row }: any) => <div className={clsx(row.original.isMedian && "bg-destructive  font-bold !bg-opacity-50")}>{getValue() as string}</div>,
            footer: (props: any) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a: any, b: any) => a + b.getValue('sale'), 0))}`
        },
        {
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="CU" />
            ),
            accessorKey: 'unitOrder',
            cell: ({ getValue, row }: any) => <div className={clsx(row.original.isMedian && "bg-destructive  font-bold !bg-opacity-50")}>{getValue() as string}</div>,
            footer: (props: any) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a: any, b: any) => a + b.getValue('unitOrder'), 0))}`
        },
        {
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="CA vente" />
            ),
            accessorKey: 'salePrice',
            cell: ({ getValue, row }: any) => <div className={clsx(row.original.isMedian && "bg-destructive  font-bold !bg-opacity-50")}>{formatNumber(getValue()) as string}€</div>,
            footer: (props: any) => `${formatNumber(props.table.getFilteredRowModel().rows.reduce((a: any, b: any) => a + b.getValue('salePrice'), 0))}€`
        },
        {
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Tx marge" />
            ),
            accessorKey: 'marginRate',
            cell: ({ getValue, row }: any) => <div className={clsx(row.original.isMedian && "bg-destructive font-bold !bg-opacity-50")}>{formatNumber(getValue()) as string}%</div>,
            footer: (props: any) => `${formatNumber((props.table.getFilteredRowModel().rows.reduce((a: any, b: any) => a + b.getValue('salePrice'), 0) - props.table.getFilteredRowModel().rows.reduce((a: any, b: any) => a + b.original.purchaseSalePrice, 0)) / props.table.getFilteredRowModel().rows.reduce((a: any, b: any) => a + b.getValue('salePrice'), 0) * 100)}%`
        },
    ], [data, salePriceMedian])

    const rangesColumns = useMemo(() => [
        {
            accessorKey: 'label',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Gammes" />
            ),
        }
    ], [])
    return (
        <>
            <span>Prix de vente median: {salePriceMedian}€ (Soit PA MAX:{Math.round((salePriceMedian! / 5.34) * 100) / 100}€) </span>
            <Table wrapperClass="h-[500px] overflow-auto custom-scrollbar text-center">
                <TableHeader>
                    <TableRow>
                        <TableHead className="bg-default-100 sticky top-0 only:" colSpan={data.length + 2}>{title}</TableHead>
                    </TableRow>
                    <TableRow>
                        <TableHead className="border border-default-300"></TableHead>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map((range, index) => (
                            <TableHead
                                onClick={() => openProductsDialog(`${index === 0 ? '0' : data[index - 1].minPrice}-${range.minPrice - 0.01}`, range.products)}
                                key={index}
                                className={clsx(range.isMedian && " bg-red-300 text-gray-900 font-bold", "text-sm h-0 p-1", "border border-default-300")}
                            >
                                <Button className="p-0 h-0 hover:bg-transparent bg-transparent text-primary hover:text-primary/80  hover:underline">
                                    {`${index === 0 ? '0' : data[index - 1].minPrice}-${range.minPrice - 0.01}`}€
                                </Button>
                            </TableHead>
                        ))}
                        <TableHead 
                         onClick={() => openTotalDetailDialog()}
                        className="border border-default-300">
                            <Button className="p-0 h-0 hover:bg-transparent bg-transparent text-primary hover:text-primary/80  hover:underline">
                            Total
                            </Button></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableHead className="border border-default-300 text-sm h-0 p-1">Ventes</TableHead>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map(range =>
                            <TableCell
                                key={`SALE-${range.minPrice}`}
                                className={clsx(range.isMedian && " bg-red-300 text-gray-900 font-bold", "text-sm h-0 p-1", "border border-default-300")}
                            >{range.totalSales} <Difference difference={range.totalSalesDifferenceN1} /></TableCell>)}
                        <TableCell className="text-sm h-0 p-1 border border-default-300">{formatNumber(data.reduce((a, b) => a + b.totalSales, 0))} <Difference
                            difference={data.reduce((a, b) => a + b.totalSalesDifferenceN1, 0)} /></TableCell>

                    </TableRow>
                    <TableRow>
                        <TableHead className="border border-default-300 text-sm h-0 p-1">CA VENTE</TableHead>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map(range =>
                            <TableCell
                                key={`SALEREVENUE-${range.minPrice}`}
                                className={clsx(range.isMedian && " bg-red-300 text-gray-900 font-bold", "text-sm h-0 p-1", "border border-default-300")}
                            > {formatNumber(range.totalSalesRevenue)}€ 
                            <Difference difference={range.totalSalesRevenueDifferenceN1} />
                            </TableCell>)}
                        <TableCell className="text-sm h-0 p-1 border border-default-300">{formatNumber(data.reduce((a, b) => a + b.totalSalesRevenue, 0))} 7
                            <Difference
                            difference={data.reduce((a, b) => a + b.totalSalesRevenueDifferenceN1, 0)} />
                            </TableCell>

                    </TableRow>
                    <TableRow>
                        <TableHead className="border border-default-300 text-sm h-0 p-1">Stock</TableHead>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map(range =>
                            <TableCell
                                key={`STOCK-${range.minPrice}`}
                                className={clsx(range.isMedian && " bg-red-300 text-gray-900 font-bold", "text-sm h-0 p-1", "border border-default-300")}
                            >{range.stock} <Difference difference={range.stockDifferenceN1} /></TableCell>)}
                        <TableCell className="text-sm h-0 p-1 border border-default-300">{formatNumber(data.reduce((a, b) => a + b.stock, 0))}
                            <Difference
                                difference={data.reduce((a, b) => a + b.stockDifferenceN1, 0)} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableHead className="border border-default-300 text-sm h-0 p-1">PA Stock</TableHead>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map(range =>
                            <TableCell
                                key={`STOCK-PURCHASE-PRICE-${range.minPrice}`}
                                className={clsx(range.isMedian && " bg-red-300 text-gray-900 font-bold", "text-sm h-0 p-1", "border border-default-300")}
                            >{formatNumber(range.stockPurchasePrice)}€
                                <Difference difference={range.stockPurchasePriceDifferenceN1} symbol="€" />
                            </TableCell>)}
                        <TableCell className="text-sm h-0 p-1 border border-default-300">{formatNumber(data.reduce((a, b) => a + b.stockPurchasePrice, 0))}€
                            <Difference 
                            difference={data.reduce((a, b) => a + b.stockPurchasePriceDifferenceN1, 0)} symbol="€" />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableHead className="border border-default-300 text-sm h-0 p-1">Ventes N-1</TableHead>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map(range =>
                            <TableCell
                                key={`SALEN1-${range.minPrice}`}
                                className={clsx(range.isMedian && " bg-red-300 text-gray-900 font-bold", "text-sm h-0 p-1", "border border-default-300")}
                            >{range.totalSalesN1}</TableCell>)}
                        <TableCell className="text-sm h-0 p-1 border border-default-300">{formatNumber(data.reduce((a, b) => a + b.totalSalesN1, 0))}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableHead className="border border-default-300 text-sm h-0 p-1">Stock N-1</TableHead>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map(range =>
                            <TableCell
                                key={`STOCKN1-${range.minPrice}`}
                                className={clsx(range.isMedian && " bg-red-300 text-gray-900 font-bold", "text-sm h-0 p-1", "border border-default-300")}
                            >{range.stockN1}</TableCell>)}
                        <TableCell className="text-sm h-0 p-1 border border-default-300">{formatNumber(data.reduce((a, b) => a + b.stockN1, 0))}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableHead className="border border-default-300 text-sm h-0 p-1">PA Stock N-1</TableHead>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map(range =>
                            <TableCell
                                key={`STOCK-N1-PURCHASE-PRICE-${range.minPrice}`}
                                className={clsx(range.isMedian && " bg-red-300 text-gray-900 font-bold", "text-sm h-0 p-1", "border border-default-300")}
                            >{formatNumber(range.stockPurchasePriceN1)}€
                            </TableCell>)}
                        <TableCell className="text-sm h-0 p-1 border border-default-300">{formatNumber(data.reduce((a, b) => a + b.stockPurchasePriceN1, 0))}€                            
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableHead className="border border-default-300 text-sm h-0 p-1">PA Stock N-1</TableHead>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map(range =>
                            <TableCell
                                key={`SALE-REVENUE-${range.minPrice}`}
                                className={clsx(range.isMedian && " bg-red-300 text-gray-900 font-bold", "text-sm h-0 p-1", "border border-default-300")}
                            >{formatNumber(range.totalSalesRevenueN1)}€
                            </TableCell>)}
                        <TableCell className="text-sm h-0 p-1 border border-default-300">{formatNumber(data.reduce((a, b) => a + b.totalSalesRevenueN1, 0))}€                            
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            {/* <CardTableWithButtons
            columns={rangesColumns}
            data={data.sort((a, b) => a.minPrice - b.minPrice).map((range, index) => ({...range,label:`${index === 0 ? '0' : data[index - 1].minPrice}-${range.minPrice - 0.01}`   }) )}
            bordered
            dense
            /> */}
            {/* <Table className="h-full w-full text-center">
                <TableHeader>
                    <TableRow>
                        <TableHead className="border border-default-300 h-0  text-center">Gammes</TableHead>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map((range, index) => <TableHead
                            key={`H-${range.minPrice}`}
                            className={clsx("border border-default-300 h-0  text-center",
                                range.isMedian && " bg-red-300 text-gray-900 font-bold")}
                        >{index === 0 ? `0-${range.minPrice - 1}` : `${data[index - 1].minPrice}-${range.minPrice - 1}`}€</TableHead>)}
                        <TableHead className="border border-default-300 h-0">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell
                            className="border border-default-300 h-0 p-1">Stock</TableCell>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map(range =>
                            <TableCell
                                key={`STK-${range.minPrice}`}
                                className={clsx("border border-default-300 h-0 p-1",
                                    range.isMedian && " bg-red-300 text-gray-900 font-bold")}
                            >{range.stock}</TableCell>)}
                        <TableCell className="border border-default-300 h-0 p-1">{formatNumber(data.reduce((a, b) => a + b.stock, 0))}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="border border-default-300 h-0 p-1">Ventes</TableCell>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map(range =>
                            <TableCell
                                key={`S-${range.minPrice}`}
                                className={clsx("border border-default-300 h-0 p-1",
                                    range.isMedian && " bg-red-300 text-gray-900 font-bold")}
                            >{range.sale}</TableCell>)}
                        <TableCell className="border border-default-300 h-0 p-1">{formatNumber(data.reduce((a, b) => a + b.sale, 0))}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="border border-default-300 h-0 p-1">CU</TableCell>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map(range =>
                            <TableCell
                                key={`U-${range.minPrice}`}
                                className={clsx("border border-default-300 h-0 p-1",
                                    range.isMedian && " bg-red-300 text-gray-900 font-bold")}
                            >{range.unitOrder}</TableCell>)}
                        <TableCell
                        className="border border-default-300 h-0 p-1">{formatNumber(data.reduce((a, b) => a + b.unitOrder, 0))}</TableCell>
                    </TableRow>
                    <TableRow >
                        <TableCell className="border border-default-300 h-0 p-1">CA Ventes</TableCell>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map(range =>
                            <TableCell
                                key={`S-${range.minPrice}`}
                                className={clsx("border border-default-300 h-0 p-1",
                                    range.isMedian && " bg-red-300 text-gray-900 font-bold")}
                            >{formatNumber(range.salePrice)}€</TableCell>)}
                        <TableCell className="border border-default-300 h-0 p-1">{formatNumber(data.reduce((a, b) => a + b.salePrice, 0))}€</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="border border-default-300 h-0 p-1">Tx marges</TableCell>
                        {data.sort((a, b) => a.minPrice - b.minPrice).map(range =>
                            <TableCell
                                key={`M-${range.minPrice}`}
                                className={clsx("border border-default-300 h-0 p-1",
                                    range.isMedian && " bg-red-300 text-gray-900 font-bold")}
                            >{formatNumber(range.marginRate)}%</TableCell>)}
                        <TableCell className="border border-default-300 h-0 p-1">{formatNumber(((data.reduce((a, b) => a + b.salePrice, 0) - data.reduce((a, b) => a + b.purchaseSalePrice, 0)) / data.reduce((a, b) => a + b.salePrice, 0)) * 100)}%</TableCell>
                    </TableRow>
                </TableBody>
            </Table> */}
        </>
    )
}