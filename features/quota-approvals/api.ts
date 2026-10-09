import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { periodKey, type Period } from "@/lib/period"
import { APPROVAL_CHANNELS } from "./options"
import type { ApprovalsData, AreaApprovals, DirectorApproval } from "./types"

export const approvalKeys = {
  all: ["quota-approvals"] as const,
  period: (p: Period) => [...approvalKeys.all, periodKey(p)] as const,
}

export const approvalsQueryOptions = (period: Period) =>
  queryOptions({
    queryKey: approvalKeys.period(period),
    queryFn: () => fetchApprovals(period),
    placeholderData: keepPreviousData,
  })

export type SetApprovalInput = { period: Period; ids: string[]; approved: boolean }

/** Approves directors for load (or removes approval). Loaded quotas are left alone. TODO: real endpoint. */
export async function setApproval({ period, ids, approved }: SetApprovalInput) {
  await new Promise((r) => setTimeout(r, 550))
  const wanted = new Set(ids)
  let updated = 0
  for (const areas of Object.values(data(period))) {
    for (const d of areas.flatMap((a) => a.directors)) {
      if (!wanted.has(d.id) || d.status === "loaded") continue
      const next = approved ? "approved" : "pending"
      if (d.status !== next) {
        d.status = next
        updated++
      }
    }
  }
  return { updated }
}

/* ------------------------------------------------------------------ */
/* Mock server — TODO: replace with the real approvals endpoint.       */
/* ------------------------------------------------------------------ */

const store = new Map<string, ApprovalsData>()

async function fetchApprovals(period: Period): Promise<ApprovalsData> {
  await new Promise((r) => setTimeout(r, 400))
  return structuredClone(data(period))
}

function data(period: Period) {
  const key = periodKey(period)
  if (!store.has(key)) store.set(key, generate(key, period))
  return store.get(key)!
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

const NAMES = [
  "CASTILLO, HUGO", "CHRISTIAN, JADE", "CHRISTIAN, MARCELINE", "CHURCH, BROCK", "KEITH, EVA", "MOLINA, AMARI",
  "SIMS, FAYE", "WATTS, TREASURE", "BRADSHAW, JUNIPER", "DOYLE, SIMON", "GIBSON, DARIUS", "HINTON, CONNER",
  "NGUYEN, KALEB", "TORRES, HARRISON", "BENNETT, LAURA", "OKAFOR, JAMES", "LINDQVIST, ERIK", "MORENO, ANA",
  "TANAKA, KEN", "PRICE, JORDAN", "REYES, NOVA", "FOSTER, MILES",
]
const EXTRA_NAMES = [
  "CAMPBELL, BRANTLEY", "GILL, CARSON", "GRAY, RAIDEN", "LYONS, AURELIA", "RILEY, REIGN", "WEBB, SKYLER",
  "CHERRY, MAKAYLA", "HUERTA, JOY", "MALONE, THEODORE", "NOLAN, MILA", "DUKE, AVALYNN", "NEAL, MALAYAH",
  "SEXTON, REGINALD", "SKINNER, HECTOR", "ANDRADE, ZOLA", "BURNS, ELISE", "COOK, BAILEE", "KANE, MARLEE",
]
const AREA_SETS = [
  [["east", "East"], ["west", "West"]],
  [["east", "East"], ["central", "Central"], ["west", "West"]],
  [["national", "National"]],
] as const
const RETAIL_AREAS = [
  ["atlantic-north", "Atlantic North"],
  ["atlantic-south", "Atlantic South"],
  ["coastal-plains", "Coastal Plains"],
  ["great-lakes", "Great Lakes"],
  ["mountain", "Mountain"],
] as const

function generate(key: string, period: Period): ApprovalsData {
  const r = rng(hash(key))
  const now = new Date()
  const age = (now.getFullYear() - period.year) * 12 + now.getMonth() - period.month
  const out: ApprovalsData = {}

  for (const channel of APPROVAL_CHANNELS) {
    const set = AREA_SETS[Math.floor(r() * AREA_SETS.length)]
    const areas = channel.id === "retail" ? RETAIL_AREAS : set
    const pool = [...NAMES, ...EXTRA_NAMES].sort(() => r() - 0.5)
    out[channel.id] = areas.map(([id, label]): AreaApprovals => {
      const count = Math.min(pool.length, areas.length > 3 ? 4 + Math.floor(r() * 3) : 3 + Math.floor(r() * 8))
      const directors = pool.splice(0, count).sort().map((director, i): DirectorApproval => {
        const x = r()
        // Past periods are loaded; the current one is mostly still to approve.
        const status = age > 1 ? "loaded" : age === 1 ? (x < 0.8 ? "loaded" : "approved") : x < 0.75 ? "pending" : "approved"
        return { id: `${key}|${channel.id}|${id}|${i}`, director, status }
      })
      if (r() < 0.4) directors.push({ id: `${key}|${channel.id}|${id}|vacant`, director: `VACANT, NEW`, status: age > 1 ? "loaded" : "pending" })
      return { id, label, directors }
    })
  }
  return out
}
