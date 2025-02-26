import { useRef } from "react";
import { useVirtualizer } from '@tanstack/react-virtual'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    Row,
    useReactTable,
  } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

  export const VirtualizedTable = ({
    columns,
    data,
}) => {


    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        debugTable: true,
      })

    const { rows } = table.getRowModel();
    const tableContainerRef = useRef<HTMLDivElement>(null)
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        estimateSize: () => 33, //estimate row height for accurate scrollbar dragging
        getScrollElement: () => tableContainerRef.current,
        //measure dynamic row height, except in firefox because it measures table border height incorrectly
        measureElement:
            typeof window !== 'undefined' &&
                navigator.userAgent.indexOf('Firefox') === -1
                ? element => element?.getBoundingClientRect().height
                : undefined,
        overscan: 5,
    })
    return (
        <div>
            <div                
                ref={tableContainerRef}
                className="h-[800px] w-full overflow-auto relative"
                                
            >
                {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
                <Table                 
                
                style={{ display: 'grid' }}>
                    <TableHeader
                        style={{
                            display: 'grid',
                            position: 'sticky',
                            top: 0,
                            zIndex: 999999,
                        }}
                    >
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow
                                key={headerGroup.id}
                                style={{ display: 'flex', width: '100%' }}
                            >
                                {headerGroup.headers.map(header => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{
                                                display: 'flex',
                                                width: header.getSize(),
                                            }}
                                        >
                                            <div
                                                {...{
                                                    className: header.column.getCanSort()
                                                        ? 'cursor-pointer select-none'
                                                        : '',
                                                    onClick: header.column.getToggleSortingHandler(),
                                                }}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {{
                                                    asc: ' 🔼',
                                                    desc: ' 🔽',
                                                }[header.column.getIsSorted() as string] ?? null}
                                            </div>
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody
                        style={{
                            display: 'grid',
                            height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
                            position: 'relative', //needed for absolute positioning of rows
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map(virtualRow => {
                            const row = rows[virtualRow.index] as Row<Person>
                            return (
                                <TableRow
                                    data-index={virtualRow.index} //needed for dynamic row height measurement
                                    ref={node => rowVirtualizer.measureElement(node)} //measure dynamic row height
                                    key={row.id}
                                    style={{
                                        display: 'flex',
                                        position: 'absolute',
                                        transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                                        width: '100%',
                                    }}
                                >
                                    {row.getVisibleCells().map(cell => {
                                        return (
                                            <TableCell
                                                key={cell.id}
                                                style={{
                                                    display: 'flex',
                                                    width: cell.column.getSize(),
                                                }}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}