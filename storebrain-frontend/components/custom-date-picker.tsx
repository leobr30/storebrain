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
    React.useEffect(() => setDate(selected),[selected])
    const [month, setMonth] = React.useState<number>(new Date().getMonth())
    const [year, setYear] = React.useState<number>(new Date().getFullYear())
    const [yearRange, setYearRange] = React.useState<number>(year)
    const scrollRef = React.useRef<HTMLDivElement>(null)

    const months = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ]

    const getYears = (baseYear: number) => {
        const years = Array.from({ length: 101 }, (_, i) => baseYear - 50 + i)
        return years.filter(year =>
            (!minDate || year >= minDate.getFullYear()) &&
            (!maxDate || year <= maxDate.getFullYear())
        )
    }


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

    const scrollYears = (direction: 'up' | 'down') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'up' ? -100 : 100
            scrollRef.current.scrollTop += scrollAmount
            setYearRange(prev => {
                const newYear = prev + (direction === 'up' ? -1 : 1)
                return isYearInRange(newYear) ? newYear : prev
            })
        }
    }

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
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex justify-between p-3">
                    <Select value={month.toString()} onValueChange={handleMonthChange}>
                        <SelectTrigger className="w-[120px]">
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
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Année" />
                        </SelectTrigger>
                        <SelectContent>
                            <div className="flex flex-col items-center">
                                {/* <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        scrollYears('up')
                                    }}
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </Button> */}
                                <ScrollArea className="h-[200px] w-full" ref={scrollRef}>
                                    {getYears(yearRange).map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </ScrollArea>
                                {/* <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        scrollYears('down')
                                    }}
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </Button> */}
                            </div>
                        </SelectContent>
                    </Select>
                </div>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleOnSelect}
                    month={new Date(year, month)}
                    onMonthChange={(newMonth) => {
                        setMonth(newMonth.getMonth())
                        setYear(newMonth.getFullYear())
                    }}
                    initialFocus
                    locale={fr}
                    disabled={(date) => !isDateInRange(date)}
                    fromDate={minDate}
                    toDate={maxDate}
                />
            </PopoverContent>
        </Popover>
    )
}