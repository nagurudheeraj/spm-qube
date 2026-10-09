import { queryOptions } from "@tanstack/react-query"

import { mockUser } from "@/config/app"
import { periodKey, shiftPeriod, type Period } from "@/lib/period"
import { nextStatus, statusIndex, STATUSES, TASKS } from "./options"
import type { PeriodConfig, PeriodSettings, PeriodStatus, TaskId, TaskLog } from "./types"

export const periodKeys = {
  all: ["quota-periods"] as const,
  config: (p: Period) => [...periodKeys.all, periodKey(p)] as const,
}

export const periodConfigQueryOptions = (period: Period) =>
  queryOptions({
    queryKey: periodKeys.config(period),
    queryFn: () => fetchConfig(period),
  })

// TODO: real endpoints for everything below.
const ME = `${mockUser.lastName}, ${mockUser.firstName}`
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function saveSettings({ period, settings }: { period: Period; settings: PeriodSettings }) {
  await wait(500)
  const c = config(period)
  c.settings = { ...settings }
  log(c, "settings", "success", "Configuration saved.")
}

export async function promote({ period }: { period: Period }) {
  await wait(600)
  const c = config(period)
  const next = nextStatus(c.status)
  if (!next) throw new Error("Already closed")
  c.status = next.value
  c.history[next.value] = { at: new Date().toISOString(), by: ME }
  log(c, "promote", "success", `Status changed to ${next.label}.`)
  return next
}

export async function runTask({ period, task }: { period: Period; task: TaskId }) {
  await wait(900)
  const c = config(period)
  const i = c.tasks.findIndex((t) => t.id === task)
  const at = new Date().toISOString()
  c.tasks[i] = { id: task, state: "done", lastRun: { at, by: ME, result: "success" } }
  // Finishing a task unlocks the next one.
  if (c.tasks[i + 1]?.state === "blocked") c.tasks[i + 1].state = "ready"
  log(c, task, "success", "Completed.")
}

/* ------------------------------------------------------------------ */
/* Mock server                                                         */
/* ------------------------------------------------------------------ */

const store = new Map<string, PeriodConfig>()

async function fetchConfig(period: Period): Promise<PeriodConfig> {
  await wait(350)
  return structuredClone(config(period))
}

function log(c: PeriodConfig, task: TaskLog["task"], result: TaskLog["result"], message: string) {
  c.logs.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), task, by: ME, result, message })
}

const pad = (n: number) => String(n).padStart(2, "0")
const day = (p: Period, d: number) => `${p.year}-${pad(p.month + 1)}-${pad(d)}`
const lastDay = (p: Period) => new Date(p.year, p.month + 1, 0).getDate()

function config(period: Period): PeriodConfig {
  const key = periodKey(period)
  if (store.has(key)) return store.get(key)!

  const now = new Date()
  const age = (now.getFullYear() - period.year) * 12 + now.getMonth() - period.month
  // Past periods are closed with every task done; upcoming ones are waiting to initialize.
  const status: PeriodStatus = age > 1 ? "closed" : age === 1 ? "frozen" : age === 0 ? "open" : "initialize-pending"
  const doneUpTo = age >= 1 ? TASKS.length : age === 0 ? 3 : 1
  const prev = shiftPeriod(period, -1)
  const next = shiftPeriod(period, 1)

  const tasks = TASKS.map((t, i) => {
    // Runs happened before the period started (and never in the future).
    const start = Math.min(Date.UTC(period.year, period.month, 1), now.getTime())
    const at = new Date(start - (TASKS.length - i) * 2 * 86_400_000 + (9 + i) * 3_600_000).toISOString()
    return i < doneUpTo
      ? { id: t.id, state: "done" as const, lastRun: { at, by: i % 2 ? "Grebe, Justina" : "Molina, Amari", result: i === 1 ? ("warning" as const) : ("success" as const) } }
      : { id: t.id, state: i === doneUpTo ? ("ready" as const) : ("blocked" as const) }
  })

  // Each reached status was entered a few days apart, ending no later than today.
  const reached = STATUSES.slice(0, statusIndex(status) + 1)
  const end = Math.min(Date.UTC(period.year, period.month, 1) + (age > 0 ? age * 20 : 0) * 86_400_000, now.getTime())
  const history: PeriodConfig["history"] = Object.fromEntries(
    reached.map((s, i) => [
      s.value,
      { at: new Date(end - (reached.length - 1 - i) * 6 * 86_400_000 - 3 * 3_600_000).toISOString(), by: i % 2 ? "Grebe, Justina" : "Molina, Amari" },
    ])
  )

  const c: PeriodConfig = {
    status,
    history,
    settings: {
      cutoffDate: day(next, 17),
      deactivateSalesIdsDate: day(shiftPeriod(period, -2), lastDay(shiftPeriod(period, -2))),
      reliefDate: day(next, 7),
      displayLoad: `${day(prev, 28)}T23:59`,
      displayReload: `${day(period, 9)}T16:00`,
      displayVbgReload: `${day(period, 2)}T00:00`,
      displayVcgReload: `${day(period, 9)}T00:00`,
      runStageCheck: true,
    },
    tasks,
    logs: tasks
      .filter((t) => t.lastRun)
      .map((t) => ({
        id: `${key}-${t.id}`,
        at: t.lastRun!.at,
        task: t.id,
        by: t.lastRun!.by,
        result: t.lastRun!.result,
        message: t.lastRun!.result === "warning" ? "Completed with 3 warnings: directors still in Allocate stage." : "Completed.",
      }))
      .reverse(),
  }
  store.set(key, c)
  return c
}
