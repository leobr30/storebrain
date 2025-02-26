import { Skeleton } from "../ui/skeleton"

type TextareaSkeletonProps = {
    fullWidth?: boolean
}
export const TextareaSkeleton = ({fullWidth = false}: TextareaSkeletonProps) => {
    return (
        <div className={`w-full mx-auto space-y-4 ${fullWidth ? 'w-full' : 'max-w-md'}`}>
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-32 w-full rounded-md" />
        </div>
    )
}