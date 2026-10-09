import type { FilterOption } from "@/components/common/filter-select"
import { CATALOGS, findCatalog, findChannelRef } from "@/config/catalogs"
import type { SearchFor } from "./types"

type SearchType = {
  value: SearchFor
  label: string
  /** "Search by" fields for this type. */
  searchBy: FilterOption[]
  /** Results grid implemented in this app. */
  ready?: boolean
}

// TODO: confirm "Search by" fields for store, agent and quota planner (employee is confirmed).
export const SEARCH_TYPES: SearchType[] = [
  {
    value: "employee",
    label: "Employee",
    ready: true,
    searchBy: [
      { value: "salesId", label: "Sales ID" },
      { value: "hrNumber", label: "HR number" },
      { value: "name", label: "Name" },
      { value: "eid", label: "Enterprise ID" },
    ],
  },
  {
    value: "store",
    label: "Store",
    searchBy: [
      { value: "storeId", label: "Store ID" },
      { value: "storeName", label: "Store name" },
    ],
  },
  {
    value: "agent",
    label: "Agent",
    searchBy: [
      { value: "agentId", label: "Agent ID" },
      { value: "agentName", label: "Agent name" },
    ],
  },
  {
    value: "planner",
    label: "Quota planner",
    searchBy: [
      { value: "plannerId", label: "Planner ID" },
      { value: "plannerName", label: "Planner name" },
    ],
  },
]

export const searchType = (value: SearchFor) => SEARCH_TYPES.find((t) => t.value === value) ?? SEARCH_TYPES[0]

/** Default "Search by" for a type: its first two fields (legacy: Sales ID, HR number). */
export const defaultSearchBy = (value: SearchFor) => searchType(value).searchBy.slice(0, 2).map((o) => o.value)

export const catalogOptions: FilterOption[] = [
  { value: "all", label: "All" },
  ...CATALOGS.map((c) => ({ value: c.id, label: c.label })),
]

export const channelOptions = (catalog: string): FilterOption[] => [
  { value: "all", label: "All" },
  ...(findCatalog(catalog)?.channels ?? []).map((c) => ({ value: c.id, label: c.label })),
]

export const marketOptions = (catalog: string, channel: string): FilterOption[] => [
  { value: "all", label: "All" },
  ...(findChannelRef(catalog, channel)?.markets ?? []).map((m) => ({ value: m.id, label: m.label })),
]

const catalogCode = (catalog: string) => (catalog === "direct" ? "DIR" : catalog === "indirect" ? "IND" : "ALL")

const channelCode = (channel: string) => {
  const map: Record<string, string> = {
    business: "BUS",
    "direct-mbo": "DMB",
    "public-sector": "PS",
    retail: "RET",
    "retail-smb": "RSMB",
    "telesales-b": "TEL-B",
    "telesales-c": "TEL-C",
    "indirect-consumer": "IC",
    "indirect-mbo": "IMB",
    local: "LOC",
  }
  return map[channel] ?? channel.toUpperCase().replace(/[^A-Z0-9]+/g, "-")
}

const marketCode = (market: string) => {
  const map: Record<string, string> = {
    northeast: "NE",
    southeast: "SE",
    central: "CE",
    south: "SO",
    west: "WE",
    pacific: "PA",
    national: "NA",
    east: "ES",
    "state-local": "SL",
    federal: "FD",
    education: "ED",
    inbound: "IN",
    outbound: "OUT",
  }
  return map[market] ?? market.toUpperCase().slice(0, 2)
}

export const localeCode = (catalog: string, channel: string, market: string) => {
  if (catalog === "all" || !catalog) return "all"
  if (channel === "all" || !channel) return `${catalogCode(catalog)}-${channelCode(channel || "all")}`
  if (market === "all" || !market) return `${catalogCode(catalog)}-${channelCode(channel)}-${marketCode(market || "all")}`
  return `${catalogCode(catalog)}-${channelCode(channel)}-${marketCode(market)}`
}

export const localeSelectionFromValue = (value: string) => {
  if (!value || value === "all") return { catalog: "all", channel: "all", market: "all" }

  for (const catalog of CATALOGS) {
    for (const channel of catalog.channels) {
      for (const market of channel.markets) {
        if (localeCode(catalog.id, channel.id, market.id) === value) return { catalog: catalog.id, channel: channel.id, market: market.id }
      }
    }
  }

  return { catalog: "all", channel: "all", market: "all" }
}

// TODO: load locales from reference data.
export const LOCALES: FilterOption[] = [
  { value: "all", label: "All" },
  ...["DIR-RET-CP", "DIR-RET-AN", "DIR-RET-AS", "DIR-RET-GL", "DIR-BUS-WE", "DIR-DMO-WE", "DIR-DMO-EA", "DIR-DMO-HQ"].map(
    (l) => ({ value: l, label: l })
  ),
]

export const PERIOD_OPTIONS: FilterOption[] = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}))

export const yearOptions = (current: number): FilterOption[] =>
  Array.from({ length: 7 }, (_, i) => current + 1 - i).map((y) => ({ value: String(y), label: String(y) }))

/** "1–3, 9" style summary for selected period numbers. */
export function summarizePeriods(periods: number[]) {
  if (periods.length === 0) return "None"
  if (periods.length === 12) return "All"
  const sorted = [...periods].sort((a, b) => a - b)
  const ranges: string[] = []
  let start = sorted[0]
  let prev = sorted[0]
  for (const p of [...sorted.slice(1), Infinity]) {
    if (p === prev + 1) {
      prev = p
      continue
    }
    ranges.push(start === prev ? String(start) : prev === start + 1 ? `${start}, ${prev}` : `${start}–${prev}`)
    start = prev = p
  }
  return ranges.join(", ")
}
