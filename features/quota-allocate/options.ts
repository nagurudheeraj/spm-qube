import type { FilterOption } from "@/components/common/filter-select"
import { formatPeriod, shiftPeriod, type Period } from "@/lib/period"

// TODO: load from the reference-data API once available.
export const AREAS: FilterOption[] = [
  { value: "east", label: "East" },
  { value: "central", label: "Central" },
  { value: "west", label: "West" },
]

/** "Current" plus the following period, e.g. November 2026 → Current / December 2026. */
export const scopeOptions = (period: Period): FilterOption[] => [
  { value: "current", label: "Current" },
  { value: "next", label: formatPeriod(shiftPeriod(period, 1)) },
]

type Director = FilterOption & { businessCenter: string }

export const DIRECTORS: Record<string, Director[]> = {
  east: [
    { value: "castillo-hugo", label: "Castillo, Hugo", businessCenter: "BCSOSE05 – SOSE 05" },
    { value: "bennett-laura", label: "Bennett, Laura", businessCenter: "BCNENY02 – NY Metro 02" },
    { value: "okafor-james", label: "Okafor, James", businessCenter: "BCMAPA01 – Mid-Atlantic 01" },
  ],
  central: [
    { value: "lindqvist-erik", label: "Lindqvist, Erik", businessCenter: "BCGLCH03 – Great Lakes 03" },
    { value: "moreno-ana", label: "Moreno, Ana", businessCenter: "BCTXDA01 – Texas 01" },
  ],
  west: [
    { value: "tanaka-ken", label: "Tanaka, Ken", businessCenter: "BCPCSF04 – Pacific 04" },
    { value: "price-jordan", label: "Price, Jordan", businessCenter: "BCMTDV02 – Mountain 02" },
  ],
}

export const ALL_DIRECTORS = "all"

export const directorOptions = (area: string): FilterOption[] => [
  { value: ALL_DIRECTORS, label: "All directors" },
  ...(DIRECTORS[area] ?? []),
]

export const businessCenterFor = (area: string, director: string) =>
  DIRECTORS[area]?.find((d) => d.value === director)?.businessCenter ?? null

/** Server-generated exports from the legacy "Actions" menu. TODO: wire to report endpoints. */
export const REPORT_EXPORTS = [
  { id: "planner", label: "Export planner" },
  { id: "attributes", label: "Export attributes" },
  { id: "hierarchy", label: "Export hierarchy" },
  { id: "validation", label: "Validation results" },
  { id: "reloadable", label: "Reloadable entities" },
] as const
