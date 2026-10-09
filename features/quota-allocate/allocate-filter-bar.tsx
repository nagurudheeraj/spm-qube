"use client"

import { Building2 } from "lucide-react"

import { FilterSelect } from "@/components/common/filter-select"
import { PeriodStepper } from "@/components/common/period-stepper"
import type { Period } from "@/lib/period"
import { isPeriodFinalized } from "./api"
import type { AllocateViewDef } from "./catalog"
import { AREAS, businessCenterFor, directorOptions, scopeOptions } from "./options"
import type { AllocateFilters } from "./types"

type AllocateFilterBarProps = {
  view: AllocateViewDef
  filters: AllocateFilters
  period: Period
  onFilterChange: <K extends keyof AllocateFilters>(key: K, value: AllocateFilters[K]) => void
  onPeriodChange: (period: Period) => void
  /** Context picker (channel / view) shown first, before a divider. */
  leading?: React.ReactNode
}

/** Context picker, then period + the filters the current view declares. */
export function AllocateFilterBar({
  view,
  filters,
  period,
  onFilterChange,
  onPeriodChange,
  leading,
}: AllocateFilterBarProps) {
  const businessCenter = view.filters.includes("director") ? businessCenterFor(filters.area, filters.director) : null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {leading && (
        <>
          {leading}
          <div aria-hidden className="mx-1 hidden h-5 w-px bg-border sm:block" />
        </>
      )}
      <PeriodStepper
        value={period}
        onChange={onPeriodChange}
        isLocked={filters.scope === "current" ? isPeriodFinalized : undefined}
        addon={
          <FilterSelect
            label="Period"
            hideLabel
            value={filters.scope}
            options={scopeOptions(period)}
            onChange={(v) => onFilterChange("scope", v as AllocateFilters["scope"])}
          />
        }
      />
      {view.filters.includes("area") && (
        <FilterSelect label="Area" value={filters.area} options={AREAS} onChange={(v) => onFilterChange("area", v)} />
      )}
      {view.filters.includes("director") && (
        <FilterSelect
          label="Sr. director"
          value={filters.director}
          options={directorOptions(filters.area)}
          onChange={(v) => onFilterChange("director", v)}
        />
      )}
      {businessCenter && <BusinessCenter value={businessCenter} />}
    </div>
  )
}

/** Read-only business center for the selected director. */
function BusinessCenter({ value }: { value: string }) {
  return (
    <span
      title="Business center"
      className="inline-flex h-8 max-w-full items-center gap-1.5 px-1 text-[13px] text-muted-foreground"
    >
      <Building2 className="size-3.5 shrink-0" strokeWidth={1.75} />
      <span className="truncate">{value}</span>
    </span>
  )
}
