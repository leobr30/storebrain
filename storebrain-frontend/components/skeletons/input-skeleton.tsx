import { Skeleton } from "../ui/skeleton"

export const InputSkeleton = () => {
    return (
        <div className="space-y-2 w-full mx-auto">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full rounded-md" />
        </div>
    )
}