"use client"

import * as React from "react"
import { format, isAfter, isBefore, isValid, parse } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SelectSingleEventHandler } from "react-day-picker"

interface DatePickerProps {
    minDate?: Date
    maxDate?: Date
    placeholder?: string,
    selected?: Date,
    onSelect?: (date: Date | undefined) => any
    readonly?: boolean
}

export function CustomDatePicker({ minDate, maxDate, placeholder, selected, onSelect, readonly }: DatePickerProps) {

    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

    const [date, setDate] = React.useState<Date | undefined>(selected ?? undefined)
    //TEMP FIX
    React.useEffect(() => setDate(selected), [selected])
    const [month, setMonth] = React.useState<number>(new Date().getMonth())
    const [year, setYear] = React.useState<number>(new Date().getFullYear())
    const [yearRange, setYearRange] = React.useState<number>(year)
    const scrollRef = React.useRef<HTMLDivElement>(null)

    const months = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ]

    const getYears = (base: number, delta: number = 25) => {
        const start = base - delta;
        const end = base + delta;
        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
            .filter(y => (!minDate || y >= minDate.getFullYear()) && (!maxDate || y <= maxDate.getFullYear()));
    };



    const handleMonthChange = (value: string) => {
        const newMonth = parseInt(value)
        setMonth(newMonth)
        if (date) {
            const newDate = new Date(date.getFullYear(), newMonth, 1)
            if (isDateInRange(newDate)) {
                setDate(newDate)
            }
        }
    }

    const handleYearChange = (value: string) => {
        const newYear = parseInt(value)
        setYear(newYear)
        setYearRange(newYear)
        if (date) {
            const newDate = new Date(newYear, date.getMonth(), 1)
            if (isDateInRange(newDate)) {
                setDate(newDate)
            }
        }
    }

    const [yearOptions, setYearOptions] = React.useState(() => getYears(yearRange));


    const isDateInRange = (date: Date) => {
        return (!minDate || isAfter(date, minDate) || date.getTime() === minDate.getTime()) &&
            (!maxDate || isBefore(date, maxDate) || date.getTime() === maxDate.getTime())
    }

    const isYearInRange = (year: number) => {
        return (!minDate || year >= minDate.getFullYear()) &&
            (!maxDate || year <= maxDate.getFullYear())
    }

    const isMonthDisabled = (monthIndex: number) => {
        const testDate = new Date(year, monthIndex, 1)
        return !isDateInRange(testDate)
    }

    const handleOnSelect: SelectSingleEventHandler = (date) => {
        setDate(date)
        onSelect?.(date)
        setIsPopoverOpen(false)
    }

    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
                <Button
                    disabled={readonly}
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-xs text-left font-normal",
                        "border-default-300 px-3 h-9",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-3 w-4" />
                    {date ? format(date, "PPP", { locale: fr }) : <span >{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                side="bottom"
                sideOffset={4}
                className="z-[9999] w-[340px] p-4 rounded-xl shadow-xl bg-white border border-gray-200 absolute left-0"
                align="start"
            >
                <div className="flex items-center justify-between gap-3 mb-4">
                    <Select value={month.toString()} onValueChange={handleMonthChange}>
                        <SelectTrigger className="h-9 w-[150px] rounded-md border border-gray-300 bg-gray-50 px-3 text-sm shadow-sm hover:bg-gray-100">
                            <SelectValue placeholder="Mois" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month, index) => (
                                <SelectItem
                                    key={index}
                                    value={index.toString()}
                                    disabled={isMonthDisabled(index)}
                                >
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={year.toString()} onValueChange={handleYearChange}>
                        <SelectTrigger className="h-9 w-[120px] rounded-md border border-gray-300 bg-gray-50 px-3 text-sm shadow-sm hover:bg-gray-100">
                            <SelectValue placeholder="Année" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            <ScrollArea
                                className="h-[200px] w-full"
                                ref={scrollRef}
                                onScrollCapture={(e) => {
                                    const target = e.currentTarget;
                                    if (target.scrollTop < 50) {
                                        const newYears = getYears(yearRange - 25);
                                        setYearOptions(prev => [...new Set([...newYears, ...prev])].sort((a, b) => a - b));
                                    } else if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
                                        const newYears = getYears(yearRange + 25);
                                        setYearOptions(prev => [...new Set([...prev, ...newYears])].sort((a, b) => a - b));
                                    }
                                }}
                            >
                                {yearOptions.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </ScrollArea>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-2">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleOnSelect}
                        month={new Date(year, month)}
                        onMonthChange={(newMonth) => {
                            setMonth(newMonth.getMonth());
                            setYear(newMonth.getFullYear());
                        }}
                        initialFocus
                        locale={fr}
                        disabled={(date) => !isDateInRange(date)}
                        fromDate={minDate}
                        toDate={maxDate}
                        className="w-full min-h-[320px] text-sm [&_table]:w-full [&_table]:table-fixed"
                    // 👆 les sélecteurs personnalisés assurent que le calendrier n’est pas écrasé
                    />

                </div>
            </PopoverContent>

        </Popover>
    )
}