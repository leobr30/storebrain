import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import clsx from "clsx";
import { useState } from "react";
import { TableVirtuoso } from "react-virtuoso"
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const Analyze1DialogTableProduct = ({
    columns,
    data,
    defaultSorting,
    dense,
    showExport = false
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
    
    const exportToCsv = () => {
        // Get headers from columns - extract the label text instead of the component
        const headers = columns.map((column: any) => {
            // Check if column has a header with a label property
            if (column.header && typeof column.header === 'function') {
                // For complex header components, use accessorKey or id as fallback
                return column.meta?.columnName || column.accessorKey || column.id || '';
            }
            // For simple string headers
            return column.header || column.accessorKey || column.id || '';
        });
        
        // Get data rows
        const csvRows = [
            headers.join(','), // Header row
            ...rows.map((row) => {
                return columns.map((column: any) => {
                    // Get the raw value for each cell
                    const value = (row.original as any)[column.accessorKey];
                    // Handle values that might contain commas
                    return typeof value === 'string' && value.includes(',') 
                        ? `"${value}"` 
                        : value;
                }).join(',');
            })
        ];
        
        // Create CSV content
        const csvContent = csvRows.join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col w-full h-full">
            {showExport && (
                <div className="flex justify-end mb-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={exportToCsv}
                        className="flex items-center gap-1"
                    >
                        <Download size={16} />
                        Export CSV
                    </Button>
                </div>
            )}
            <div className="flex-1 min-h-[500px]">
                <TableVirtuoso
                    style={{ height: '100%' }}
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
            </div>
        </div>
    )
}