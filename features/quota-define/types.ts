import type { Period } from "@/lib/period"

export type EmployeeType = "existing" | "new"

/** An employee found by HR number, Sales ID or name. */
export type PlannerEmployee = {
  hrNumber: string
  salesId: string
  firstName: string
  lastName: string
  /** Current job title, shown in search results to tell people apart. */
  title: string
}

export type NewEmployee = Pick<PlannerEmployee, "hrNumber" | "salesId" | "firstName" | "lastName">

export type JobTitle = { value: string; code: string; label: string; defaultPlan: string }
export type CompPlan = { value: string; label: string }

export type PlannerDraft = {
  catalog: string
  channel: string
  area: string
  period: Period
  employeeType: EmployeeType
  existing: PlannerEmployee | null
  newEmployee: NewEmployee
  jobTitle: string | null
  compPlan: string | null
  /** "yyyy-MM-dd"; null follows the first day of the period. */
  startDate: string | null
}

export type PlannerField = "employee" | "firstName" | "lastName" | "hrNumber" | "jobTitle" | "compPlan" | "startDate"
export type PlannerErrors = Partial<Record<PlannerField, string>>
