import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { EditMap } from "@/components/data-table"
import { periodKey, shiftPeriod, type Period } from "@/lib/period"
import type { IaSegment, IaSyncData, IaSyncRow } from "./types"

export const iaSyncKeys = {
  all: ["ia-sync"] as const,
  period: (p: Period) => [...iaSyncKeys.all, periodKey(p)] as const,
}

export const iaSyncQueryOptions = (period: Period) =>
  queryOptions({
    queryKey: iaSyncKeys.period(period),
    queryFn: () => fetchIaSync(period),
    placeholderData: keepPreviousData,
  })

export type SaveIaSyncInput = { period: Period; segment: IaSegment; changes: EditMap }

/** Applies the edited sync flags / corrections. TODO: real endpoint. */
export async function saveIaSync({ period, segment, changes }: SaveIaSyncInput) {
  await new Promise((r) => setTimeout(r, 600))
  const rows = store.get(periodKey(period))?.[segment] ?? []
  for (const row of rows) {
    const c = changes[row.id]
    if (!c) continue
    if ("qube.sync" in c) row.qube.sync = Boolean(c["qube.sync"])
    if ("ccrs.sync" in c) row.ccrs.sync = Boolean(c["ccrs.sync"])
    if ("proposed" in c) row.proposed = String(c.proposed)
  }
  return { saved: Object.keys(changes).length }
}

/* ------------------------------------------------------------------ */
/* Mock server — TODO: replace with the real IA sync endpoint.         */
/* ------------------------------------------------------------------ */

const store = new Map<string, IaSyncData>()

async function fetchIaSync(period: Period): Promise<IaSyncData> {
  await new Promise((r) => setTimeout(r, 450))
  const key = periodKey(period)
  if (!store.has(key)) store.set(key, generate(key, period))
  const data = store.get(key)!
  const copy = (rows: IaSyncRow[]) => rows.map((r) => ({ ...r, qube: { ...r.qube }, ccrs: { ...r.ccrs } }))
  return { business: copy(data.business), consumer: copy(data.consumer) }
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

const FIRST = ["Marceline", "Eugene", "Keira", "Oscar", "Belle", "Raiden", "Marlee", "Maximo", "Carolina", "Leia", "Alistair", "Addison", "Jovie", "Hadassah", "Aurelia"]
const LAST = ["Christian", "Coffey", "Ferguson", "Fitzgerald", "Flowers", "Gray", "Kane", "Kennedy", "Lamb", "Randolph", "Salgado", "Sanchez", "Wells", "Walton"]
const JOBS: [title: string, channel: string][] = [
  ["Act Manager Rtl SMB-Bus", "R2B"],
  ["Act Manager Rtl SMB-Bus", "R2B"],
  ["Assoc Dir-Business Sales", "BUS"],
  ["Sr Acct Manager-Bus", "BUS"],
]
const CONSUMER_JOBS: [title: string, channel: string][] = [
  ["Spec-Retail", "RET"],
  ["Asst Manager-Retail", "RET"],
]
const MARKETS = ["EA", "EA", "EA", "CE", "WE"]

const mmdd = (p: Period, day: number) => `${p.month + 1}/${day}/${String(p.year).slice(-2)}`
const mm = (p: Period) => String(p.month + 1).padStart(2, "0")
const short = (p: Period) => `${p.month + 1}/${String(p.year).slice(-2)}`

function generate(key: string, period: Period): IaSyncData {
  const r = rng(hash(key))
  const pick = <T,>(list: readonly T[]) => list[Math.floor(r() * list.length)]

  const row = (segment: IaSegment, i: number): IaSyncRow => {
    const [jobTitle, channel] = pick(segment === "business" ? JOBS : CONSUMER_JOBS)
    const eff = shiftPeriod(period, -(2 + Math.floor(r() * 3)))
    const jm = shiftPeriod(eff, 0)
    const nq = shiftPeriod(eff, 1)
    const ia = shiftPeriod(eff, 2)
    const iaEnd = shiftPeriod(eff, 4)
    const day = 1 + Math.floor(r() * 27)
    const kind = r()
    const alert =
      kind < 0.45
        ? `New to Sales eff ${mmdd(eff, day)}; IA JM ${short(jm)}; IA NQ ${short(nq)}; IA ${short(ia)}-${short(iaEnd)}; IA50 ${short(shiftPeriod(iaEnd, 1))}; SPSMB to SPSMB`
        : kind < 0.85
          ? `CHANNEL CHANGE FROM RET (${pick(["GSM", "GSS", "GGM"])}) to R2B (SPSMB) eff ${mmdd(eff, day)}; IA JM ${short(jm)}; IA NQ ${short(nq)}; IA ${short(ia)}-${short(iaEnd)}`
          : `COMP PLAN CHG (J${40000 + Math.floor(r() * 999)}) eff ${mmdd(eff, day)}; IA JM ${short(jm)}-${short(nq)}; IA ${short(ia)}-${short(iaEnd)}`
    const qube = r() < 0.92
    const ccrs = r() < 0.08
    return {
      id: `${key}|${segment}|${i}`,
      salesId: channel === "BUS" ? `MB${pick(LAST).toUpperCase().slice(0, 4)}` : `E3${Math.floor(r() * 36 ** 2).toString(36).toUpperCase().padStart(2, "0")}${"PSJDLMYXEGK"[i % 11]}`,
      name: `${pick(LAST).toUpperCase()}, ${pick(FIRST).toUpperCase()}`,
      jobTitle,
      channel,
      market: pick(MARKETS),
      qube: { current: qube, sync: qube },
      ccrs: { current: ccrs, sync: ccrs },
      alert,
      proposed: `IA ${mm(ia)}-${mm(iaEnd)}`,
    }
  }

  const business = Array.from({ length: 90 + Math.floor(r() * 40) }, (_, i) => row("business", i))
  // Consumer is often empty (legacy screenshot shows 0).
  const consumer = r() < 0.5 ? [] : Array.from({ length: 3 + Math.floor(r() * 8) }, (_, i) => row("consumer", i))
  // Legacy order: R2B before BUS, then by name.
  const byName = (a: IaSyncRow, b: IaSyncRow) => b.channel.localeCompare(a.channel) || a.name.localeCompare(b.name)
  return { business: business.sort(byName), consumer: consumer.sort(byName) }
}
