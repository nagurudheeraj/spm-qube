"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DatePickerProps = {
  /** "yyyy-MM-dd", or "" for none. */
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

/** Button showing the date ("Dec 17, 2026") that opens a calendar. */
export function DatePicker({ value, onChange, id, placeholder = "Pick a date", disabled, className }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const date = value ? parseISO(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn("w-full justify-start font-normal", !date && "text-muted-foreground", className)}
          />
        }
      >
        <CalendarDays className="text-muted-foreground" />
        {date ? format(date, "MMM d, yyyy") : placeholder}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(d) => {
            if (d) onChange(format(d, "yyyy-MM-dd"))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

type DateTimePickerProps = {
  /** "yyyy-MM-ddTHH:mm" (local), or "" for none. */
  value: string
  onChange: (value: string) => void
  id?: string
  label?: string
  disabled?: boolean
}

/** Date picker + native time input, side by side. */
export function DateTimePicker({ value, onChange, id, label = "Time", disabled }: DateTimePickerProps) {
  const [date = "", time = ""] = value.split("T")
  return (
    <div className="flex gap-2">
      <DatePicker
        id={id}
        value={date}
        disabled={disabled}
        onChange={(d) => onChange(`${d}T${time || "00:00"}`)}
        className="min-w-0 flex-1 shrink"
      />
      <Input
        type="time"
        aria-label={label}
        value={time}
        disabled={disabled || !date}
        onChange={(e) => onChange(`${date}T${e.target.value}`)}
        className="w-32 shrink-0 tabular-nums [&::-webkit-calendar-picker-indicator]:opacity-60 dark:[&::-webkit-calendar-picker-indicator]:invert"
      />
    </div>
  )
}
