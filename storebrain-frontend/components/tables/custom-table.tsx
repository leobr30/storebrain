"use client"

import {
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { ReactNode, useMemo, useState } from "react";
import { clsx } from "clsx";
import { Input } from "../ui/input";

type Props = {
    columns: [],
    data: [],
    defaultSorting?: any,
    dense?: boolean,
    bordered?: boolean,
    columnFilterName?: string,
    rightBtn?: ReactNode,

}

export const TempNameTable = ({ columns,
    data,
    defaultSorting,
    dense,
    bordered,
    columnFilterName,
    rightBtn }: Props) => {
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState({});
    const [columnFilters, setColumnFilters] = useState([]);
    const [sorting, setSorting] = useState(defaultSorting ? [defaultSorting] : []);



    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    return (
        <>
            <div className="flex items-center flex-wrap gap-2 px-4">
                {columnFilterName ?
                    <Input
                        placeholder='Filter...'
                        value={table.getColumn(columnFilterName)?.getFilterValue() || ""}
                        onChange={(event) =>
                            table.getColumn(columnFilterName)?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm min-w-[200px] h-10"
                    />
                    : ''}
                {rightBtn}
            </div>

            <div className="rounded-md border mt-3">
                <Table wrapperClass="max-h-90" className="text-center text-bold">
                    <TableHeader className="bg-default-100">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan} className={clsx("font-medium sticky top-0 bg-default-100 text-gray-900 ",
                                            bordered && "border border-default-300",
                                            dense && "text-sm ")}>
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
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className={clsx("font-medium text-default-900",
                                            bordered && "border border-default-300",
                                            dense && "text-sm h-0 p-1")}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        {table.getFooterGroups().map(footerGroup => (
                            <TableRow key={footerGroup.id} className="sticky bottom-0">
                                {footerGroup.headers.map((footer) => {
                                    return (
                                        <TableCell key={footer.id} colSpan={footer.colSpan} className={clsx("font-medium sticky bottom-0 bg-default-100 text-default-900",
                                            bordered && "border border-default-300",
                                            dense && "text-sm ")}>
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
                    </TableFooter>
                </Table>
            </div>

        </>
        // <div className="space-y-4 ">

        // </div>
    )
}