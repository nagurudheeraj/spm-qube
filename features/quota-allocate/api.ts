import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { comparePeriods, currentPeriod, periodKey, type Period } from "@/lib/period"
import { ALL_DIRECTORS, businessCenterFor, DIRECTORS } from "./options"
import type { Metric, TeamQuotaVault, VaultChanges, VaultComponent, VaultsQuery, VaultsResponse } from "./types"

export const allocateKeys = {
  all: ["quota-allocate"] as const,
  vaults: (q: VaultsQuery) => [...allocateKeys.all, "vaults", q] as const,
}

/** Mock rule: past periods are finalized (read-only). TODO: comes from the periods API. */
export const isPeriodFinalized = (period: Period) => comparePeriods(period, currentPeriod()) < 0

export const vaultsQueryOptions = (q: VaultsQuery) =>
  queryOptions({
    queryKey: allocateKeys.vaults(q),
    queryFn: () => fetchVaults(q),
    // Keep the current grid on screen while the next filter combo loads.
    placeholderData: keepPreviousData,
  })

/* ------------------------------------------------------------------ */
/* Mock server — TODO: replace these three functions with real calls. */
/* ------------------------------------------------------------------ */

const db = new Map<string, TeamQuotaVault[]>()
const latency = (ms = 450) => new Promise((r) => setTimeout(r, ms))

const dbKey = (q: VaultsQuery) => [q.catalog, q.channel, q.area, q.director, q.view, q.scope, periodKey(q.period)].join("|")

function table(q: VaultsQuery) {
  const key = dbKey(q)
  if (!db.has(key)) db.set(key, generateVaults(q))
  return db.get(key)!
}

export async function fetchVaults(q: VaultsQuery): Promise<VaultsResponse> {
  await latency()
  return {
    vaults: structuredClone(table(q)),
    // Past periods are locked; current and future periods are editable.
    status: q.scope === "current" && isPeriodFinalized(q.period) ? "finalized" : "open",
    businessCenter: q.director === ALL_DIRECTORS ? null : businessCenterFor(q.area, q.director),
  }
}

export async function saveVaultChanges({ query, changes }: { query: VaultsQuery; changes: VaultChanges }) {
  await latency(700)
  const rows = table(query)
  for (const [id, fields] of Object.entries(changes)) {
    const vault = rows.find((v) => v.id === id)
    if (!vault) continue
    for (const [field, value] of Object.entries(fields)) {
      const m = /^c(\d)\.target$/.exec(field)
      if (m) vault.components[Number(m[1])].target = value as number
      else if (field === "notes") vault.notes = value as string
    }
  }
  return { saved: Object.keys(changes).length }
}

export async function removeUnassignedVaults({ query }: { query: VaultsQuery }) {
  await latency(600)
  const rows = table(query)
  const kept = rows.filter((v) => v.assigned)
  db.set(dbKey(query), kept)
  return { removed: rows.length - kept.length }
}

/* ---------- deterministic mock data ---------- */

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

const REPS = ["Krista Rocha", "Marcus Lee", "Dana Whitfield", "Owen Park", "Leah Moretti", "Sam Ortiz", "Nina Bauer", "Theo Grant", "Ivy Chen", "Raj Mehta"]
const SEGMENTS = [
  { prefix: "CE", plan: "VWB-US-Eng-Sales CE B2B" },
  { prefix: "SAM", plan: "VWB-US-Eng-Sales SAM B2B" },
  { prefix: "FL", plan: "VWB-US-Eng-Sales FL SMB" },
]
const METRICS: Metric[] = ["Sales Dollars", "Gross Activations", "Net Activations"]
const WEIGHT_SETS = [[50, 0, 50], [50, 50, 0], [0, 50, 50]]

function component(metric: Metric, weight: number, r: () => number): VaultComponent {
  const target = metric === "Sales Dollars" ? Math.round((r() * 60_000 + 6_000) / 10) * 10 : Math.round(r() * 330 + 50)
  return { metric, weight, target }
}

function generateVaults(q: VaultsQuery): TeamQuotaVault[] {
  const r = rng(hash(dbKey(q)))
  const directors = q.director === ALL_DIRECTORS ? (DIRECTORS[q.area] ?? []).length : 1
  // A single director has a handful of vaults; "All" fans out to a large grid.
  const count = q.director === ALL_DIRECTORS ? 400 * directors : 12 + Math.floor(r() * 18)

  return Array.from({ length: count }, (_, i) => {
    const seg = SEGMENTS[Math.floor(r() * SEGMENTS.length)]
    const assigned = r() > 0.12
    const order = [...METRICS].sort(() => r() - 0.5)
    const weights = WEIGHT_SETS[Math.floor(r() * WEIGHT_SETS.length)]
    const rep = REPS[Math.floor(r() * REPS.length)]
    const slot = `${1 + Math.floor(r() * 5)}${"ABC"[Math.floor(r() * 3)]}`
    return {
      id: `${hash(dbKey(q)).toString(36)}-${i}`,
      name: assigned ? `${seg.prefix} ${slot} ${rep}` : `${seg.prefix} ${slot} Floater`,
      compPlan: seg.plan,
      components: [component(order[0], weights[0], r), component(order[1], weights[1], r), component(order[2], weights[2], r)],
      ft: 1 + Math.floor(r() * 26),
      notes: "",
      assigned,
    }
  })
}
