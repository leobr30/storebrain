import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import clsx from "clsx";
import { useState } from "react";
import { TableVirtuoso } from "react-virtuoso"

export const Analyze1DialogTableProduct = ({
    columns,
    data,
    defaultSorting,
    dense
}: any) => {

    const [sorting, setSorting] = useState(defaultSorting ? [defaultSorting] : []);
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    });

    const { rows } = table.getRowModel();
    

    return (
        <TableVirtuoso
            totalCount={rows.length}
            components={{
                Table: ({ style, ...props }) => (
                    <Table
                        wrapperClass="max-h-90 w-full overflow-x-visible"
                        className="text-center text-bold"
                        {...props} />
                ),
                TableHead: ({ style, ...props }) => (
                    <TableHeader className="bg-default-100 m-0" {...props} style={style} />
                ),
                TableRow: (props) => {
                    const index = props["data-index"];
                    const row = rows[index];

                    return (
                        <TableRow
                            {...props}
                            className={clsx((index % 2 !== 0) && "bg-default-100")} 
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className={clsx("font-medium text-default-900",
                                    "border border-default-300",
                                    "text-sm h-0 p-1")}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    )
                }

            }}
            fixedHeaderContent={() => {
                return table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            return (
                                <TableHead
                                    key={header.id}
                                    colSpan={header.colSpan}
                                    style={{ width: header.getSize() }}
                                    className={clsx("font-medium bg-default-100 text-gray-900 ",
                                        "border border-default-300",
                                        "text-sm p-1 h-0")}>
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
                ))
            }}
            fixedFooterContent={() => {
                return table.getFooterGroups().map(footerGroup => (
                    <TableRow key={footerGroup.id}>
                        {footerGroup.headers.map((footer) => {
                            return (
                                <TableCell key={footer.id} colSpan={footer.colSpan} className={clsx("font-medium bg-default-100 text-default-900",
                                    "border border-default-300",
                                    "text-sm p-1 h-0")}>
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
                ))
            }}
        />
    )
}