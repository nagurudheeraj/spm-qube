"use client"

import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { FilterOption } from "./filter-select"

type MultiSelectFilterProps = {
  label: string
  options: FilterOption[]
  value: string[]
  onChange: (value: string[]) => void
  /** Custom trigger text for the current selection (default: "All", "None", names, or "N selected"). */
  summarize?: (selected: FilterOption[]) => string
  /** Lay options out in a grid (e.g. 3 for months). */
  columns?: number
  /** Extra one-click selections shown next to All / None (e.g. "Pending"). */
  presets?: { label: string; value: string[] }[]
  className?: string
}

function defaultSummary(selected: FilterOption[], total: number) {
  if (selected.length === 0) return "None"
  if (selected.length === total) return "All"
  if (selected.length <= 2) return selected.map((o) => o.label).join(", ")
  return `${selected.length} selected`
}

/** Multi-select dropdown with "All" / "None" shortcuts; trigger reads "Label  Selection ▾". */
export function MultiSelectFilter({
  label,
  options,
  value,
  onChange,
  summarize,
  columns = 1,
  presets,
  className,
}: MultiSelectFilterProps) {
  const selected = options.filter((o) => value.includes(o.value))
  const summary = summarize ? summarize(selected) : defaultSummary(selected, options.length)

  const toggle = (v: string, checked: boolean) =>
    // Keep options in their declared order.
    onChange(options.map((o) => o.value).filter((o) => (o === v ? checked : value.includes(o))))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            aria-label={`${label}: ${summary}`}
            className={cn("gap-1.5 font-normal", className)}
          />
        }
      >
        <span className="text-muted-foreground">{label}</span>
        <span className="max-w-48 truncate">{summary}</span>
        <ChevronDown className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={cn("w-auto", columns > 1 ? "min-w-64" : "min-w-52")}>
        <DropdownMenuGroup>
          <div className="flex items-center justify-between gap-4 pr-1">
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <div className="flex items-center gap-0.5">
              {presets?.map((p) => (
                <Button key={p.label} variant="ghost" size="xs" onClick={() => onChange(p.value)}>
                  {p.label}
                </Button>
              ))}
              <Button variant="ghost" size="xs" onClick={() => onChange(options.map((o) => o.value))}>
                All
              </Button>
              <Button variant="ghost" size="xs" onClick={() => onChange([])}>
                None
              </Button>
            </div>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup
          style={columns > 1 ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
          className={cn(columns > 1 && "grid gap-0.5")}
        >
          {options.map((o) => (
            <DropdownMenuCheckboxItem
              key={o.value}
              checked={value.includes(o.value)}
              onCheckedChange={(checked) => toggle(o.value, Boolean(checked))}
              closeOnClick={false}
            >
              {o.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
