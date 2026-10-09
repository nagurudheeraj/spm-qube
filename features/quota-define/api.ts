import { queryOptions } from "@tanstack/react-query"

import { formatPeriod } from "@/lib/period"
import { effectiveStartDate } from "./options"
import type { PlannerDraft, PlannerEmployee } from "./types"

// TODO: real endpoints for everything below.
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const defineKeys = {
  all: ["quota-define"] as const,
  employees: () => [...defineKeys.all, "employees"] as const,
}

export const plannerEmployeesQueryOptions = () =>
  queryOptions({
    queryKey: defineKeys.employees(),
    queryFn: async () => {
      await wait(300)
      return EMPLOYEES
    },
    staleTime: Infinity,
  })

export async function createPlanner(draft: PlannerDraft) {
  await wait(700)
  const employee = draft.employeeType === "existing" ? draft.existing! : draft.newEmployee
  return {
    name: `${employee.lastName.trim()}, ${employee.firstName.trim()}`,
    period: formatPeriod(draft.period),
    startDate: effectiveStartDate(draft),
  }
}

/** Case-insensitive match on HR number, Sales ID, "Last, First" or "First Last". */
export function matchesEmployee(e: PlannerEmployee, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [e.hrNumber, e.salesId, `${e.lastName}, ${e.firstName}`, `${e.firstName} ${e.lastName}`].some((s) =>
    s.toLowerCase().includes(q)
  )
}

/* ---------- mock data (deterministic) ---------- */

const FIRST = ["Hugo", "Laura", "James", "Erik", "Ana", "Ken", "Jordan", "Amari", "Justina", "Treasure", "Priya", "Mateo", "Grace", "Ravi", "Chloe", "Omar", "Sofia", "Liam"]
const LAST = ["Castillo", "Bennett", "Okafor", "Lindqvist", "Moreno", "Tanaka", "Price", "Molina", "Grebe", "Watts", "Reddy", "Silva", "Chen", "Khan", "Nguyen", "Rossi", "Walker", "Ito"]
const TITLES = ["Sales Rep", "Account Exec", "Sales Mgr", "Dir-Business Sls", "Retail Specialist"]

const EMPLOYEES: PlannerEmployee[] = (() => {
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)]
  return Array.from({ length: 400 }, (_, i) => ({
    hrNumber: String(4_100_000 + i * 37),
    salesId: `S${Math.floor(rand() * 900_000 + 100_000)}`,
    firstName: pick(FIRST),
    lastName: pick(LAST),
    title: pick(TITLES),
  }))
})()
