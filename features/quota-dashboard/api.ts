import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { periodKey, type Period } from "@/lib/period"
import type {
  DirectorStage,
  DiscrepancyEmployee,
  DiscrepancyReport,
  EmployeeDiscrepancyView,
  QuotaStage,
  QuotaStageQuery,
} from "./types"

export const dashboardKeys = {
  all: ["quota-dashboard"] as const,
  stage: (q: QuotaStageQuery) => [...dashboardKeys.all, "stage", q] as const,
  employees: (q: EmployeeDiscrepancyQuery) => [...dashboardKeys.all, "discrepancy-employees", q] as const,
}

export type EmployeeDiscrepancyQuery = { period: Period; view: EmployeeDiscrepancyView; term: string }

export const discrepancyEmployeesQueryOptions = (q: EmployeeDiscrepancyQuery) =>
  queryOptions({
    queryKey: dashboardKeys.employees(q),
    queryFn: () => fetchDiscrepancyEmployees(q),
    placeholderData: keepPreviousData,
  })

export const quotaStageQueryOptions = (q: QuotaStageQuery) =>
  queryOptions({
    queryKey: dashboardKeys.stage(q),
    queryFn: () => fetchQuotaStage(q),
    placeholderData: keepPreviousData,
  })

/** Sets a load flag on the given directors. */
export type SetFlagInput = {
  query: QuotaStageQuery
  ids: string[]
  flag: "approved" | "executeLoad"
  value: boolean
}

export async function setLoadFlag({ query, ids, flag, value }: SetFlagInput) {
  await new Promise((r) => setTimeout(r, 500))
  const rows = directors(query)
  const wanted = new Set(ids)
  let updated = 0
  for (const row of rows) {
    if (!wanted.has(row.id) || row[flag] === value) continue
    row[flag] = value
    updated++
  }
  return { updated }
}

export type GenerateReportsInput = { period: Period; reports: DiscrepancyReport[]; channels: string[] }

/** Queues discrepancy reports; they're delivered through the report queue. TODO: real endpoint. */
export async function generateDiscrepancyReports({ reports, channels }: GenerateReportsInput) {
  await new Promise((r) => setTimeout(r, 700))
  return { queued: reports.length * channels.length }
}

/* ------------------------------------------------------------------ */
/* Mock server — TODO: replace with the real quota-stage endpoint.     */
/* Rows are per period + catalog/channel/area; filters apply on read.  */
/* ------------------------------------------------------------------ */

const store = new Map<string, DirectorStage[]>()

async function fetchQuotaStage(q: QuotaStageQuery): Promise<DirectorStage[]> {
  await new Promise((r) => setTimeout(r, 300))
  return directors(q)
    .filter((d) => !q.stages.length || q.stages.includes(d.stage))
    .filter((d) => !q.severities.length || q.severities.some((s) => d.validation[s] > 0))
    .map((d) => ({ ...d, validation: { ...d.validation } }))
}

function directors(q: QuotaStageQuery) {
  const key = [periodKey(q.period), q.catalog, q.channel, q.area].join("|")
  if (!store.has(key)) store.set(key, generate(key, q))
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
  "MOLINA, AMARI",
  "CHURCH, BROCK",
  "KEITH, EVA",
  "CASTILLO, HUGO",
  "CHRISTIAN, JADE",
  "CHRISTIAN, MARCELINE",
  "VACANT, RETIRED EA B2B",
  "JUAREZ, SOPHIE",
  "WATTS, TREASURE",
  "BENNETT, LAURA",
  "OKAFOR, JAMES",
  "LINDQVIST, ERIK",
  "MORENO, ANA",
  "TANAKA, KEN",
]

const code = (s: string, n = 3) => s.replace(/[^a-z]/gi, "").slice(0, n).toUpperCase()

function generate(key: string, q: QuotaStageQuery): DirectorStage[] {
  const r = rng(hash(key))
  const count = 6 + Math.floor(r() * 8)
  // Past periods are mostly finalized and loaded; the current one is in flight.
  const age = (Date.now() - Date.UTC(q.period.year, q.period.month, 1)) / (1000 * 60 * 60 * 24 * 30)
  const pickStage = (): QuotaStage => {
    const x = r()
    if (age > 1) return x < 0.9 ? "finalized" : "submitted"
    return x < 0.2 ? "not-started" : x < 0.5 ? "in-progress" : x < 0.75 ? "submitted" : "finalized"
  }

  return NAMES.slice(0, count).map((director) => {
    const stage = pickStage()
    const finalized = stage === "finalized"
    const fatal = r() < 0.12 ? 1 + Math.floor(r() * 2) : 0
    const approved = finalized && !fatal && r() < (age > 1 ? 0.95 : 0.6)
    return {
      id: `${key}|${director}`,
      director,
      catalog: q.catalog === "direct" ? "DIR" : "IND",
      channel: code(q.channel),
      area: code(q.area, 2),
      stage,
      approved,
      executeLoad: approved && r() < 0.8,
      validation: {
        fatal,
        warning: r() < 0.6 ? 1 + Math.floor(r() * 2) : 0,
        info: Math.floor(r() * 10),
      },
    }
  })
}

/* ------------------------------------------------------------------ */
/* Mock server — TODO: replace with the real discrepancy endpoints.    */
/* The search term matches any column, case-insensitively.             */
/* ------------------------------------------------------------------ */

const FIRST = ["Amari", "Brock", "Eva", "Hugo", "Jade", "Marceline", "Sophie", "Treasure", "Darius", "Natalia", "Reese", "Joy"]
const LAST = ["Molina", "Church", "Keith", "Castillo", "Christian", "Juarez", "Watts", "Gibson", "Huerta", "Kane", "Sandoval"]
const TITLES = ["Sr Acct Manager-Bus", "Account Specialist-Sales", "Principal Mgr-Sols Arch", "Spec-Retail", "Asst Manager-Retail"]
const PLANS = ["VWB-US-Eng-BAM", "VWB-US-Eng-SA B2B", "VWS-US-Eng-Acct Spec", "VCG-US-Eng-RET"]
const LOCALES = ["DIR-BUS-EA", "DIR-BUS-WE", "DIR-RET-CP", "DIR-DMO-EA", "IND-LOC-NA"]
const ALERTS: Record<EmployeeDiscrepancyView, string[]> = {
  "incentive-allowance": ["Allowance differs from CCRS", "No allowance in CCRS", "Allowance missing in QUBE"],
  "missing-employees": ["Active in CCRS, not in QUBE", "Sales ID not assigned", "Hired after cut-off"],
  "extra-employees": ["Not found in CCRS", "Terminated in CCRS", "Sales ID inactive in CCRS"],
}

const employeeStore = new Map<string, DiscrepancyEmployee[]>()

async function fetchDiscrepancyEmployees({ period, view, term }: EmployeeDiscrepancyQuery) {
  await new Promise((r) => setTimeout(r, 400))
  const key = `${periodKey(period)}|${view}`
  if (!employeeStore.has(key)) employeeStore.set(key, generateEmployees(key, view))
  const t = term.trim().toLowerCase()
  const rows = employeeStore.get(key)!
  return t ? rows.filter((r) => Object.values(r).some((v) => v.toLowerCase().includes(t))) : rows
}

function generateEmployees(key: string, view: EmployeeDiscrepancyView): DiscrepancyEmployee[] {
  const r = rng(hash(key))
  const pick = <T,>(list: readonly T[]) => list[Math.floor(r() * list.length)]
  return Array.from({ length: 8 + Math.floor(r() * 10) }, (_, i) => {
    const hr = String(1_000_000 + Math.floor(r() * 8_999_999))
    return {
      id: `${key}|${i}`,
      hrNumber: hr,
      salesId: r() > 0.5 ? `E${hr.slice(-4)}` : `A${pick(LAST).toUpperCase().slice(0, 4)}${hr.slice(-2)}`,
      name: `${pick(LAST).toUpperCase()}, ${pick(FIRST).toUpperCase()}`,
      jobTitle: pick(TITLES).toUpperCase(),
      compPlan: pick(PLANS),
      locale: pick(LOCALES),
      ccrsAlert: pick(ALERTS[view]),
    }
  })
}
