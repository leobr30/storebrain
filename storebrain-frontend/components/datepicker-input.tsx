import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns/format"
import { forwardRef } from "react"

export const DatePickerInput = forwardRef(({ value, onClick }, ref) => (

    <Button    
    ref={ref}
    type="button"
        onClick={onClick}
        variant="outline"
        className={cn(
            "w-[240px] ltr:pl-3 rtl:pr-3 text-left font-normal",
            !value && "text-muted-foreground"
        )}
    >
        {
            value ? (
                format(value, "PPP")
            ) : (
                <span>Choisissez une date</span>
            )}
        <CalendarIcon className="ltr:ml-auto rtl:mr-auto h-4 w-4 opacity-50" />
    </Button>
))
