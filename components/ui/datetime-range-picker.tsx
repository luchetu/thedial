"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DateTimePickerWithRangeProps {
    date?: DateRange
    setDate: (date: DateRange | undefined) => void
    className?: string
}

export function DateTimePickerWithRange({
    date,
    setDate,
    className,
}: DateTimePickerWithRangeProps) {
    // Helper to update time for a specific date (from or to)
    const updateTime = (
        timeStr: string,
        target: "from" | "to",
        currentRange: DateRange | undefined
    ) => {
        if (!currentRange) return
        if (target === "from" && !currentRange.from) return
        if (target === "to" && !currentRange.to) return

        const [hours, minutes] = timeStr.split(":").map(Number)
        if (isNaN(hours) || isNaN(minutes)) return

        const baseDate = target === "from" ? currentRange.from! : currentRange.to!
        const newDate = new Date(baseDate)
        newDate.setHours(hours)
        newDate.setMinutes(minutes)
        newDate.setSeconds(0) // Reset seconds/millis for cleaner queries

        setDate({
            ...currentRange,
            [target]: newDate,
        })
    }

    // Handlers for time inputs
    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateTime(e.target.value, "from", date)
    }

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateTime(e.target.value, "to", date)
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal bg-white/50 backdrop-blur-sm",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, HH:mm")} -{" "}
                                    {format(date.to, "LLL dd, HH:mm")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, HH:mm")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    <div className="p-3 border-t flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs" htmlFor="start-time">Start Time</Label>
                            <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="start-time"
                                    type="time"
                                    className="h-8 w-[110px]"
                                    value={date?.from ? format(date.from, "HH:mm") : ""}
                                    disabled={!date?.from}
                                    onChange={handleStartTimeChange}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs" htmlFor="end-time">End Time</Label>
                            <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="end-time"
                                    type="time"
                                    className="h-8 w-[110px]"
                                    value={date?.to ? format(date.to, "HH:mm") : ""}
                                    disabled={!date?.to}
                                    onChange={handleEndTimeChange}
                                />
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
