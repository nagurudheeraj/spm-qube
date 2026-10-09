import { queryOptions } from "@tanstack/react-query"

import type { Channel, Employee, EmployeeStatus } from "./types"

// TODO: replace the mock with the real endpoint, e.g. `fetch("/api/employees")`.
async function fetchEmployees(): Promise<Employee[]> {
  await new Promise((r) => setTimeout(r, 600))
  return generateEmployees(25_000)
}

export const employeeKeys = {
  all: ["employees"] as const,
  list: () => [...employeeKeys.all, "list"] as const,
}

export const employeesQueryOptions = () =>
  queryOptions({
    queryKey: employeeKeys.list(),
    queryFn: fetchEmployees,
  })

/* ---------- mock data (deterministic) ---------- */

const FIRST = ["Ava", "Liam", "Maya", "Noah", "Priya", "Ethan", "Sofia", "Lucas", "Aisha", "Mateo", "Chloe", "Ravi", "Emma", "Diego", "Hana", "Omar", "Grace", "Arjun", "Zoe", "Kai"]
const LAST = ["Patel", "Johnson", "Garcia", "Kim", "Nguyen", "Smith", "Reddy", "Brown", "Lopez", "Chen", "Davis", "Khan", "Martin", "Rossi", "Singh", "Walker", "Silva", "Ito", "Moore", "Clark"]
const TITLES = ["Sales Rep", "Senior Sales Rep", "Store Manager", "Assistant Manager", "Account Executive", "Solutions Consultant", "Retail Specialist"]
const CHANNELS: Channel[] = ["Retail", "Business", "Telesales", "Indirect"]
const REGIONS = ["Northeast", "Southeast", "Midwest", "Central", "Southwest", "West", "Pacific NW"]
const STATUSES: EmployeeStatus[] = ["Active", "Active", "Active", "Active", "Active", "Active", "On leave", "Terminated"]

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateEmployees(count: number): Employee[] {
  const rand = mulberry32(42)
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)]

  return Array.from({ length: count }, (_, i) => {
    const hire = new Date(2010 + Math.floor(rand() * 16), Math.floor(rand() * 12), 1 + Math.floor(rand() * 28))
    return {
      id: `V${String(100000 + i).padStart(7, "0")}`,
      name: `${pick(FIRST)} ${pick(LAST)}`,
      title: pick(TITLES),
      channel: pick(CHANNELS),
      region: pick(REGIONS),
      salesId: `S${Math.floor(rand() * 900000 + 100000)}`,
      quota: Math.round((rand() * 450_000 + 50_000) / 1000) * 1000,
      attainment: Math.round(rand() * 1400) / 10,
      status: pick(STATUSES),
      hireDate: hire.toISOString().slice(0, 10),
    }
  })
}
