import { Skeleton } from "../ui/skeleton"

type TableSkeletonProps = {
    rows: number
    columns: number
    height?: string,
    header?: boolean
}

export const TableSkeleton = ({rows, columns, height, header}: TableSkeletonProps) => {
    return (
        <div className={`h-[${height}] space-y-8 p-4`}>
            <div className="rounded-lg border">                
                <div className="p-4">
                {header && (
                    <div className="p-4">
                        <Skeleton className="h-6 w-1/4 mb-4" />
                    </div>
                )}
                    <div className="space-y-2">
                        {[...Array(rows)].map((_, rowIndex) => (
                            <div key={rowIndex} className="flex items-center space-x-4">
                                {[...Array(columns)].map((_, columnIndex) => (
                                    <Skeleton key={columnIndex} className="h-4 w-1/4" />
                                ))}                                
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}