"use client"

import { useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { comparePeriods, currentPeriod, formatPeriod, shiftPeriod, type Period } from "@/lib/period"
import { cn } from "@/lib/utils"

const MONTHS = Array.from({ length: 12 }, (_, m) =>
  new Date(Date.UTC(2000, m, 1)).toLocaleString("en-US", { month: "short", timeZone: "UTC" })
)

type PeriodStepperProps = {
  value: Period
  onChange: (period: Period) => void
  /** Marks months that can't be edited (shown with a lock). */
  isLocked?: (period: Period) => boolean
  /** Control attached to the right end of the stepper (e.g. a period scope select). */
  addon?: React.ReactNode
  className?: string
}

/** ‹ Month Year › stepper with a month picker (shadcn Popover, Select, ButtonGroup and ToggleGroup). */
export function PeriodStepper({ value, onChange, isLocked, addon, className }: PeriodStepperProps) {
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(value.year)
  const today = currentPeriod()

  // A few years back and two ahead, always including the year being viewed.
  const years = Array.from({ length: 8 }, (_, i) => today.year - 5 + i)
  if (!years.includes(year)) years.push(year)
  years.sort((a, b) => a - b)
  const yearItems = years.map((y) => ({ value: String(y), label: String(y) }))

  const pick = (p: Period) => {
    onChange(p)
    setOpen(false)
  }

  return (
    <ButtonGroup className={className}>
      <Button variant="outline" size="icon" aria-label="Previous period" onClick={() => onChange(shiftPeriod(value, -1))}>
        <ChevronLeft />
      </Button>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (next) setYear(value.year)
        }}
      >
        <PopoverTrigger render={<Button variant="outline" className="justify-start font-normal sm:min-w-36" />}>
          <CalendarDays className="text-muted-foreground" />
          {/* "Oct 2026" on phones, "October 2026" otherwise. */}
          <span className="sm:hidden">{formatPeriod(value, "short")}</span>
          <span className="hidden sm:inline">{formatPeriod(value)}</span>
          {isLocked?.(value) && <Lock className="ml-auto size-3! text-muted-foreground" />}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 gap-3 p-3">
          {/* Header: year on the left, year stepping grouped on the right (shadcn calendar style). */}
          <div className="flex items-center justify-between">
            <Select items={yearItems} value={String(year)} onValueChange={(v) => v && setYear(Number(v))}>
              <SelectTrigger size="sm" aria-label="Year" className="gap-1.5 font-semibold tabular-nums">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} align="start">
                <SelectGroup>
                  {yearItems.map((y) => (
                    <SelectItem key={y.value} value={y.value} className="tabular-nums">
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <ButtonGroup>
              <Button variant="outline" size="icon-sm" aria-label="Previous year" onClick={() => setYear((y) => y - 1)}>
                <ChevronLeft />
              </Button>
              <Button variant="outline" size="icon-sm" aria-label="Next year" onClick={() => setYear((y) => y + 1)}>
                <ChevronRight />
              </Button>
            </ButtonGroup>
          </div>

          <ToggleGroup
            aria-label="Month"
            value={value.year === year ? [String(value.month)] : []}
            onValueChange={(next) => next[0] !== undefined && pick({ year, month: Number(next[0]) })}
            spacing={1}
            className="grid w-full grid-cols-3 gap-1"
          >
            {MONTHS.map((label, month) => {
              const p = { year, month }
              const isToday = comparePeriods(p, today) === 0
              const locked = isLocked?.(p)
              return (
                <ToggleGroupItem
                  key={label}
                  value={String(month)}
                  aria-label={`${formatPeriod(p)}${locked ? ", finalized" : ""}${isToday ? ", current month" : ""}`}
                  className={cn(
                    "h-9 w-full gap-1 font-normal",
                    locked && "text-muted-foreground",
                    isToday && "font-medium text-foreground ring-1 ring-foreground/25 ring-inset",
                    "data-pressed:bg-primary data-pressed:text-primary-foreground data-pressed:ring-0 data-pressed:hover:bg-primary/90"
                  )}
                >
                  {label}
                  {locked && <Lock className="size-2.5! opacity-50" />}
                </ToggleGroupItem>
              )
            })}
          </ToggleGroup>

          <Separator />
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="xs" onClick={() => pick(today)}>
              This month
            </Button>
            <Button variant="ghost" size="xs" onClick={() => pick(shiftPeriod(today, 1))}>
              Next month
            </Button>
            {isLocked && (
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="size-3" />
                Finalized
              </span>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <Button variant="outline" size="icon" aria-label="Next period" onClick={() => onChange(shiftPeriod(value, 1))}>
        <ChevronRight />
      </Button>
      {addon}
    </ButtonGroup>
  )
}
