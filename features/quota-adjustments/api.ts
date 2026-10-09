import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { CATALOGS } from "@/config/catalogs"
import { periodKey, shiftPeriod, type Period } from "@/lib/period"
import { STAGES, TYPES } from "./options"
import type { Adjustment, AdjustmentCriteria } from "./types"

export const adjustmentKeys = {
  all: ["quota-adjustments"] as const,
  search: (c: AdjustmentCriteria) => [...adjustmentKeys.all, "search", c] as const,
}

export const adjustmentsQueryOptions = (c: AdjustmentCriteria) =>
  queryOptions({
    queryKey: adjustmentKeys.search(c),
    queryFn: () => searchAdjustments(c),
    placeholderData: keepPreviousData,
  })

/* ------------------------------------------------------------------ */
/* Mock server — TODO: replace with the real adjustments search.       */
/* ------------------------------------------------------------------ */

let all: Adjustment[] | null = null

async function searchAdjustments(c: AdjustmentCriteria): Promise<Adjustment[]> {
  await new Promise((r) => setTimeout(r, 350))
  all ??= generate()
  const catalogCode = c.catalog === "indirect" ? "IND" : "DIR"
  const channel = CATALOGS.flatMap((cat) => cat.channels).find((ch) => ch.id === c.channel)
  const channelCode = channel ? code(channel.id) : null
  const who = c.createdBy.trim().toLowerCase()

  return all.filter(
    (a) =>
      a.locale.startsWith(catalogCode) &&
      (!channelCode || a.locale.split("-")[1] === channelCode) &&
      (c.allPeriods || !c.period || a.period === periodKey(c.period)) &&
      (!c.types.length || c.types.includes(TYPES.find((t) => t.label === a.type)?.value ?? "")) &&
      (!c.stages.length || c.stages.includes(a.stage)) &&
      (!who || a.createdBy.toLowerCase().includes(who))
  )
}

const CHANNEL_CODES: Record<string, string> = {
  business: "BUS",
  "direct-mbo": "DMB",
  "public-sector": "PS",
  retail: "RET",
  "retail-smb": "RSMB",
  "telesales-b": "TELB",
  "telesales-c": "TELC",
  "indirect-consumer": "IC",
  "indirect-mbo": "IMB",
  local: "LOC",
}
const code = (channelId: string) => CHANNEL_CODES[channelId] ?? channelId.slice(0, 3).toUpperCase()

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PEOPLE = ["Grebe, Justina", "Molina, Amari", "Church, Brock", "Castillo, Hugo", "Watts, Treasure", "Juarez, Sophie"]
const MARKETS = ["MN", "NE", "SE", "CE", "WE", "PA"]
const STORES = ["45th Street", "Grand Central", "Rookwood Commons", "Northville", "Clift Farms", "Waco"]
const REASONS = ["", "", "Store remodel", "Reorg", "HR correction", "Leave of absence", "Market realignment"]

function generate(): Adjustment[] {
  const r = rng(20260616)
  const pick = <T,>(list: readonly T[]) => list[Math.floor(r() * list.length)]
  const now = new Date()
  const current: Period = { year: now.getFullYear(), month: now.getMonth() }

  return Array.from({ length: 64 }, (_, i) => {
    const catalog = r() < 0.75 ? CATALOGS[0] : CATALOGS[1]
    const channel = pick(catalog.channels)
    const type = pick(TYPES)
    const subType = pick(type.subTypes)
    const period = shiftPeriod(current, -Math.floor(r() * 6))
    const created = new Date(Date.UTC(period.year, period.month, 1 + Math.floor(r() * 27), 13 + Math.floor(r() * 8), Math.floor(r() * 60)))
    const modified = r() < 0.5 ? new Date(created.getTime() + Math.floor(r() * 9) * 86_400_000 + 3_600_000) : null
    const store = pick(STORES)
    // Older periods are mostly loaded.
    const stage = period.month === current.month && period.year === current.year ? pick(STAGES.slice(0, 5)).value : r() < 0.7 ? "loaded" : pick(STAGES).value
    return {
      id: `adj-${i}`,
      group: r() < 0.25 ? `G-${1000 + Math.floor(r() * 90)}` : "",
      locale: `${catalog.id === "direct" ? "DIR" : "IND"}-${code(channel.id)}-${pick(MARKETS)}`,
      period: periodKey(period),
      type: type.label,
      subType,
      created: created.toISOString(),
      createdBy: pick(PEOPLE),
      size: 1 + Math.floor(r() ** 3 * 40),
      stage,
      description: `${store} ${subType.toLowerCase()} for ${channel.label.toLowerCase()} quota`,
      reason: pick(REASONS),
      reference: r() < 0.4 ? `CHG${String(Math.floor(r() * 999999)).padStart(6, "0")}` : "",
      modified: modified?.toISOString() ?? "",
      modifiedBy: modified ? pick(PEOPLE) : "",
      shared: r() < 0.6,
    }
  })
}
