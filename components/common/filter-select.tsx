"use client"

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type FilterOption = { value: string; label: string }

type FilterSelectProps = {
  label: string
  /** Keep the label for screen readers only (e.g. when attached to another control). */
  hideLabel?: boolean
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
  className?: string
}

/** shadcn Select with its label inside the trigger, e.g. "Channel  Business ▾". */
export function FilterSelect({ label, hideLabel, value, options, onChange, className }: FilterSelectProps) {
  return (
    <Select items={options} value={value} onValueChange={(v) => v !== null && onChange(v as string)}>
      <SelectTrigger aria-label={label} className={cn("gap-1.5", className)}>
        {!hideLabel && <span className="text-muted-foreground">{label}</span>}
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start">
        <SelectGroup>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
