import { TableVirtuoso } from "react-virtuoso"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { ColumnDef, SortingState, ColumnFiltersState, useReactTable, flexRender, Row } from "@tanstack/react-table"
import { HTMLAttributes, useMemo, useState } from "react"
import { getCoreRowModel } from "@tanstack/react-table"
import { getSortedRowModel } from "@tanstack/react-table"
import { getFilteredRowModel } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

const TableRowComponent = <TData,>(rows: Row<TData>[]) =>
    function getTableRow(props: HTMLAttributes<HTMLTableRowElement>) {
      // @ts-expect-error data-index is a valid attribute
      const index = props["data-index"];
      const row = rows[index];
  
      if (!row) return null;
  
      return (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && "selected"}
          {...props}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      );
    };


export const CustomTable = ({ data, columns, defaultSorting }: { data: any[], columns: ColumnDef<any>[], defaultSorting?: SortingState }) => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>(defaultSorting || [])
    const memoizedData = useMemo(() => data, [data])
    const table = useReactTable({
        columns,
        data: memoizedData,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            columnFilters,
            sorting
        },
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
    })

    const { rows } = table.getRowModel();


    return <>
        <div className="rounded-md border h-[500px] text-center">
            <TableVirtuoso
                className='w-full h-[500px]'
                
                components={{
                    Table: ({ ...props }) => {
                        return <Table  {...props} />
                    },
                    TableRow: TableRowComponent(rows),
                    TableBody: (props) => {
                        return <TableBody {...props} />
                    },
                    TableHead: (props) => {
                        return <TableHeader {...props} />
                    }
                }}
                totalCount={rows.length}
                fixedHeaderContent={() => {
                    return table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} colSpan={header.colSpan}
                                        className={cn("bg-default-100", header.column.columnDef.meta?.headerClassName ?? "")}
                                    // className={cn("font-medium sticky top-0 bg-default-100  text-center text-default-900",
                                    //     "border border-default-300",
                                    // )}
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
                    ))
                }}
            />
        </div>
    </>
}