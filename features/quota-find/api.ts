import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { EmployeeResult, FindCriteria, FindPage } from "./types"

/** Everything the server needs for one page; all of it is part of the query key. */
export type FindQuery = {
  criteria: FindCriteria
  pageIndex: number
  pageSize: number
  sorting: { id: string; desc: boolean }[]
  /** Text filter within the results. */
  filter: string
}

export const findKeys = {
  all: ["quota-find"] as const,
  results: (q: FindQuery) => [...findKeys.all, "results", q] as const,
}

export const findResultsQueryOptions = (q: FindQuery) =>
  queryOptions({
    queryKey: findKeys.results(q),
    queryFn: () => fetchFindResults(q),
    // Keep the current page visible while the next one loads.
    placeholderData: keepPreviousData,
  })

/* ------------------------------------------------------------------ */
/* Mock server — TODO: replace with the real search endpoint, which   */
/* should page, sort and filter server-side exactly like this.        */
/* ------------------------------------------------------------------ */

const cache = new Map<string, EmployeeResult[]>()

async function fetchFindResults({ criteria, pageIndex, pageSize, sorting, filter }: FindQuery): Promise<FindPage> {
  await new Promise((r) => setTimeout(r, 350))

  let rows = matches(criteria)
  if (filter.trim()) {
    const f = filter.trim().toLowerCase()
    rows = rows.filter((r) =>
      [r.eid, r.hrNumber, r.salesId, r.name, r.title, r.plan, r.locale, r.director, r.rollsTo].some((v) =>
        v.toLowerCase().includes(f)
      )
    )
  }
  if (sorting.length) {
    rows = [...rows].sort((a, b) => {
      for (const { id, desc } of sorting) {
        const av = a[id as keyof EmployeeResult]
        const bv = b[id as keyof EmployeeResult]
        const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv))
        if (cmp) return desc ? -cmp : cmp
      }
      return 0
    })
  }
  return { rows: rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), total: rows.length }
}

function matches(c: FindCriteria) {
  const key = JSON.stringify(c)
  if (!cache.has(key)) cache.set(key, generate(c))
  return cache.get(key)!
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST = ["Zyaire", "Avalynn", "Raiden", "Hezekiah", "Nancy", "Reginald", "Darius", "Joy", "Marlee", "Joziah", "Reese", "Natalia"]
const LAST = ["Cobb", "Duke", "Gray", "Burgess", "Saunders", "Sexton", "Gibson", "Huerta", "Kane", "Thornton", "Sandoval", "Wilcox"]
const TITLES = ["Spec-Retail", "Asst Manager-Retail", "Principal Mgr-Sols Arch", "Account Specialist-Sales", "Sr Acct Manager-Bus"]
const PLANS = ["VCG-US-Eng-RET", "VWB-US-Eng-SA B2B", "VWS-US-Eng-Acct Spec", "VWB-US-Eng-BAM"]
const LOCALES = ["DIR-RET-CP", "DIR-RET-AN", "DIR-RET-AS", "DIR-RET-GL", "DIR-BUS-WE", "DIR-DMO-WE", "DIR-DMO-EA", "DIR-DMO-HQ"]
const STORES = ["Waco", "Grand Central", "Clift Farms", "Houma Store", "Rookwood Commons", "Northville", "Rochester", ""]

function generate(c: FindCriteria): EmployeeResult[] {
  const r = rng(hash(JSON.stringify(c)))
  const pick = <T,>(list: readonly T[]) => list[Math.floor(r() * list.length)]
  // Exact matches are few; partial matches across several periods can be many.
  const perPeriod = c.exact ? 1 + Math.floor(r() * 6) : 400 + Math.floor(r() * 1400)
  const periods = c.periods.length ? c.periods : [1]
  const locales = c.locale === "all" ? LOCALES : [c.locale]

  return periods.flatMap((p) =>
    Array.from({ length: perPeriod }, (_, i) => {
      const eid = String(1_000_000_000 + Math.floor(r() * 8_999_999_999))
      const assigned = r() > 0.3
      const salesId = r() > 0.5 ? `E${Math.floor(r() * 36 ** 4).toString(36).toUpperCase().padStart(4, "0")}` : `A${pick(LAST).toUpperCase().slice(0, 4)}${pick(FIRST).toUpperCase().slice(0, 3)}`
      const net = assigned ? Math.floor(r() * 220) : 0
      return {
        id: `${p}-${i}-${eid}`,
        period: `${c.year}-${String(p).padStart(2, "0")}`,
        assigned,
        eid,
        hrNumber: eid,
        salesId,
        realSalesId: r() > 0.8 ? `R${eid.slice(-5)}` : salesId,
        name: `${pick(LAST).toUpperCase()}, ${pick(FIRST).toUpperCase()}`,
        title: pick(TITLES).toUpperCase(),
        plan: pick(PLANS),
        locale: pick(locales),
        atRisk: assigned ? Math.round(r() * 4000) : 0,
        gross: assigned ? Math.floor(r() * 100) : 0,
        net,
        sales: net * Math.round(30 + r() * 30),
        director: `${pick(LAST).toUpperCase()}, ${pick(FIRST).toUpperCase()}`,
        rollsTo: pick(STORES).toUpperCase(),
      }
    })
  )
}
