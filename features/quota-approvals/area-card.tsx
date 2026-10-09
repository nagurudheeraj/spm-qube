"use client"

import { CircleCheck, Lock } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { ApprovalStatus, AreaApprovals } from "./types"

type AreaCardProps = {
  area: AreaApprovals
  selected: Set<string>
  /** Select or unselect these director ids. */
  onSelect: (ids: string[], selected: boolean) => void
  disabled?: boolean
}

export const countStatus = (area: AreaApprovals, status: ApprovalStatus) =>
  area.directors.filter((d) => d.status === status).length

/** Loaded quotas can't change, so they're never selectable. */
export const selectableIds = (area: AreaApprovals) => area.directors.filter((d) => d.status !== "loaded").map((d) => d.id)

/**
 * One area (legacy region button + its names). Clicking the header selects or
 * clears every director in the area; clicking a name toggles just that one.
 */
export function AreaCard({ area, selected, onSelect, disabled }: AreaCardProps) {
  const total = area.directors.length
  const approved = countStatus(area, "approved") + countStatus(area, "loaded")
  const selectable = selectableIds(area)
  const picked = selectable.filter((id) => selected.has(id)).length
  const all = selectable.length > 0 && picked === selectable.length

  return (
    <section
      aria-label={`${area.label} area`}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card transition-colors",
        picked > 0 && "border-primary/40"
      )}
    >
      <label
        className={cn(
          "flex items-center gap-3 border-b px-4 py-3 transition-colors",
          disabled || !selectable.length ? "cursor-default" : "cursor-pointer hover:bg-muted/50",
          all && "bg-primary/10 hover:bg-primary/15"
        )}
      >
        <Checkbox
          aria-label={`Select all in ${area.label}`}
          checked={all}
          indeterminate={picked > 0 && !all}
          disabled={disabled || selectable.length === 0}
          onCheckedChange={(checked) => onSelect(selectable, Boolean(checked))}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{area.label}</span>
          <span className="block text-xs text-muted-foreground tabular-nums">
            {total} {total === 1 ? "director" : "directors"}
            {approved > 0 && ` · ${approved} approved`}
          </span>
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
            picked > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
          title={`${picked} of ${selectable.length} selected`}
        >
          {picked}/{selectable.length}
        </span>
      </label>

      <ul className="divide-y">
        {area.directors.map((d) => {
          const locked = d.status === "loaded"
          const isSelected = selected.has(d.id)
          return (
            <li key={d.id}>
              <label
                className={cn(
                  "relative flex h-10 items-center gap-3 px-4 text-[13px] transition-colors",
                  locked || disabled ? "cursor-default" : "cursor-pointer hover:bg-muted/50",
                  isSelected && "bg-primary/10 font-medium hover:bg-primary/15",
                  locked && "text-muted-foreground"
                )}
              >
                {isSelected && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-primary" />}
                <Checkbox
                  aria-label={`Select ${d.director}`}
                  checked={isSelected}
                  disabled={locked || disabled}
                  onCheckedChange={(checked) => onSelect([d.id], Boolean(checked))}
                />
                <span className="min-w-0 flex-1 truncate">{d.director}</span>
                {d.status === "approved" && (
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-normal text-emerald-700 dark:text-emerald-400">
                    <CircleCheck className="size-3" />
                    Approved
                  </span>
                )}
                {locked && (
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-normal">
                    <Lock className="size-3" />
                    Loaded
                  </span>
                )}
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
