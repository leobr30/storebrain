import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BalanceRow, BalanceRowDetail } from "../type";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { TableWithHeader } from "@/features/employee-area/components/table-with-header";
import { BalanceRowDetailCard } from "./balance-row-detail";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@uidotdev/usehooks";

import Image from "next/image";
import { TableCell } from "@/components/ui/table";
import { Check, Trash2 } from "lucide-react";
import { CustomTable } from "@/components/custom-table";
import { StatusBadge } from "@/features/employee-area/components/status-badge";

const getClassName = (row: BalanceRow, headerId: number) => {
    const detail = row.details.find(d => d.receiverStoreId === headerId)
    if (!detail) return ""
    return (detail.stock === 0 && detail.totalSales > 0) ? "bg-red-300" : ""
}

export const BalanceRowsCard = ({ balance, headers, onDeleteBalanceRow, onUpdateBalanceRow, onCompleteBalanceRow }: { balance: Balance, headers: { id: number, label: string }[], onDeleteBalanceRow: (id: number) => void, onUpdateBalanceRow: (id: number, data: any) => void, onCompleteBalanceRow: (id: number) => void }) => {
    const [selectedBalanceRow, setSelectedBalanceRow] = useState<BalanceRow | null>(null)    
    const columns = useMemo<ColumnDef<BalanceRow>[]>(() => [
        {
            header: 'Emetteur(s)',
            columns: [
                {
                    header: 'Image',
                    accessorKey: 'image',
                    cell: ({ row }) => row.original.image ? <Image src={`http://192.168.1.104/produit/${row.original.image}`} width={40} height={40} alt="image" className="w-10 h-10" /> : null
                },
                {
                    header: 'Référence',
                    accessorKey: 'reference',
                    cell: ({ row }) => <Button tabIndex={-1} variant={'ghost'} onClick={() => setSelectedBalanceRow(row.original)}>{row.original.reference}</Button>
                },
                {
                    header: 'Stock / Dispo',
                    accessorKey: 'stock',
                    cell: ({ row }) => `${row.original.stock} / ${row.original.remaining}`
                }
            ]

        },
        ...headers.map((header, index) => ({
            header: header.label,
            accessorKey: `h-${header.id}`,
            meta: {
                headerClassName: "border-l border-r border-default-300",
            },
            columns: [
                {
                    header: 'Stock',
                    meta: {
                        headerClassName: "border-l border-default-300",
                        className: "border-l border-default-300",
                        getClassName: (row: BalanceRow) => getClassName(row, header.id)
                    },
                    id: `h-${header.id}-stock`,
                    accessorFn: (row: BalanceRow) => row.details.find(d => d.receiverStoreId === header.id)?.stock,
                },
                {
                    header: 'Qtt',
                    id: `h-${header.id}-quantity`,
                    meta: {
                        getClassName: (row: BalanceRow) => getClassName(row, header.id)
                    },
                    cell: ({ row }: { row: Row<BalanceRow> }) => {
                        if(row.original.status === 'COMPLETED') return <span>{row.original.details.find(d => d.receiverStoreId === header.id)?.quantity}</span>                        
                        const defaultValue = row.original.details.find(d => d.receiverStoreId === header.id)?.quantity ?? 0
                        const [value, setValue] = useState(defaultValue)
                        const [error, setError] = useState(false)
                        const debouncedValue = useDebounce(value, 500)
                        useEffect(() => {
                            const updateHN = () => {
                                if(debouncedValue !== defaultValue) {                                    
                                    onUpdateBalanceRow(row.original.id, {stock: row.original.stock, details: row.original.details.map((d: BalanceRowDetail) => d.receiverStoreId === header.id ? { ...d, quantity: debouncedValue } : d) })
                                    if (debouncedValue > row.original.stock) {
                                        setError(true)
                                    } else {
                                        setError(false)
                                    }
                                }
                            }
                            updateHN()
                        }, [debouncedValue])
                        return <Input type="number" onFocus={(e) => e.target.select()} className={cn("w-20", error && "border-red-500")} value={value} onChange={(e) => setValue(Number(e.target.value))} />
                    }
                },
                {
                    meta: {
                        getClassName: (row: BalanceRow) => getClassName(row, header.id)
                    },
                    header: 'Total Ventes',
                    id: `h-${header.id}-totalSales`,
                    accessorFn: (row: BalanceRow) => row.details.find(d => d.receiverStoreId === header.id)?.totalSales
                },
                {
                    meta: {
                        getClassName: (row: BalanceRow) => getClassName(row, header.id),
                        className: "border-r border-default-300",
                        headerClassName: "border-r border-default-300",
                    },
                    header: 'DDV',
                    id: `h-${header.id}-lastLifeSpan`,
                    accessorFn: (row: BalanceRow) => row.details.find(d => d.receiverStoreId === header.id)?.lastLifeSpan
                }
            ]
        })),
        {
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-end gap-2">
                    {row.original.status === 'COMPLETED' ? <StatusBadge status={row.original.status} /> : 
                    <>
                     <Button tabIndex={-1} variant={'ghost'} color="success" onClick={() => onCompleteBalanceRow(row.original.id)} disabled={row.original.remaining === row.original.stock || row.original.remaining < 0} ><Check className="w-4 h-4" /></Button> 
                     <Button tabIndex={-1} variant={'ghost'} color="destructive" onClick={() => onDeleteBalanceRow(row.original.id)} ><Trash2 className="w-4 h-4" /></Button>
                    </>
                    }
                </div>
            )
        }
    ], [headers]);
    return (
        <Card>
            <CardHeader>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
                <div className={cn("col-span-3", selectedBalanceRow ? "col-span-2" : "")}>
                    <TableWithHeader
                        data={balance.rows}
                        columns={columns}
                        defaultSorting={[{ id: 'reference', desc: false }]}
                        // withFooter
                        fullHeight
                        dense
                    />
                    {/* <CustomTable data={balance.rows} columns={columns} defaultSorting={[{ id: 'reference', desc: false }]} /> */}
                </div>
                {selectedBalanceRow ? (
                    <div className="col-span-1">
                        <BalanceRowDetailCard balanceRow={selectedBalanceRow} />
                    </div>
                ) : null}

            </CardContent>
        </Card>
    )
}