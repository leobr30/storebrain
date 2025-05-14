import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Tabs } from "@radix-ui/react-tabs"
import { ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table"
import { Search } from "lucide-react"
import { useMemo, useState } from "react"

// ✅ Ajout de la nouvelle prop pour gérer les changements d'onglets dynamiquement
interface TableWithHeaderProps {
    tabs?: { text: string, value: string }[],
    columns: any[],
    data: any[],
    columnFilterName?: string,
    tabFilterName?: string,
    fixedHeader?: boolean,
    withFooter?: boolean,
    updateData?: (rowIndex: number, columnId: string, value: string) => any,
    defaultSorting?: SortingState,
    fullHeight?: boolean,
    dense?: boolean,
    onTabChange?: (value: string) => void // ✅ Nouvelle prop
}

export const TableWithHeader = ({
    tabs,
    columns,
    data,
    columnFilterName,
    tabFilterName,
    fixedHeader,
    withFooter,
    updateData,
    defaultSorting,
    fullHeight,
    dense,
    onTabChange // ✅ Destructure ici aussi
}: TableWithHeaderProps) => {

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>(defaultSorting || [])

    const table = useReactTable({
        columns,
        data: useMemo(() => data, [data]),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            columnFilters,
            sorting
        },
        meta: {
            updateData: updateData
        },
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
    })

    return (
        <>
            <div className="flex flex-col md:flex-row">
                {tabs && <Tabs
                    className="pb-2.5"
                    defaultValue={""}
                    // ✅ Appelle à la fois le filtre de colonne et le onTabChange personnalisé
                    onValueChange={(value) => {
                        table.getColumn('status')?.setFilterValue(value);
                        if (onTabChange) onTabChange(value);
                    }}
                >
                    <TabsList>
                        {tabs.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.text}</TabsTrigger>)}
                    </TabsList>
                </Tabs>
                }
                {columnFilterName && <div className="ml-auto flex items-center gap-2 ">
                    <div className="relative ml-auto flex-1 md:grow-0">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Recherche..."
                            value={table.getColumn(columnFilterName)?.getFilterValue() as string || ""}
                            onChange={(event) =>
                                table.getColumn(columnFilterName)?.setFilterValue(event.target.value)
                            }
                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                        />
                    </div>
                </div>}
            </div>
            <div className="rounded-md border">
                <Table wrapperClass={cn("h-[500px] overflow-auto custom-scrollbar", fullHeight ? "h-[calc(100vh-200px)]" : "")} className="text-center ">
                    <TableHeader className={cn("sticky top-0 ")}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan}
                                            className={cn("bg-default-100", dense && "h-10 p-2.5", header.column.columnDef.meta?.headerClassName ?? "")}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {data && data.length > 0 && table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <TableCell key={cell.id}
                                                className={cn(cell.column.columnDef.meta?.className ?? "", dense && "p-2.5", cell.column.columnDef.meta?.getClassName?.(row.original) ?? "")}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className="">
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Aucun résultat.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    {withFooter && data.length > 0 ? <TableFooter className="bg-default-100 border-t border-default-300 sticky bottom-0" >
                        {table.getFooterGroups().map(footerGroup => (
                            <TableRow key={footerGroup.id} >
                                {footerGroup.headers.map((footer) => {
                                    return (
                                        <TableCell key={footer.id} colSpan={footer.colSpan} >
                                            {footer.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    footer.column.columnDef.footer,
                                                    footer.getContext()
                                                )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableFooter> : null}
                </Table>
            </div>
        </>
    )
}
