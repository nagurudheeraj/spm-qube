import { format, parseISO } from "date-fns"

import { findChannelRef } from "@/config/catalogs"
import { formatPeriod, type Period } from "@/lib/period"
import type { CompPlan, JobTitle, PlannerDraft, PlannerErrors } from "./types"

/*
 * TODO: job titles and comp plans come from the reference-data API per channel.
 * These placeholders follow the legacy naming (e.g. "DUMMY1BH – Sr Dir-Business Sls").
 */
const ROLES = [
  { suffix: "BH", label: "Sr Dir", plan: "Dir" },
  { suffix: "DR", label: "Dir", plan: "Dir" },
  { suffix: "MG", label: "Sales Mgr", plan: "Mgr" },
  { suffix: "AE", label: "Account Exec", plan: "Rep" },
  { suffix: "SR", label: "Sales Rep", plan: "Rep" },
] as const

const planValue = (channel: string, tier: string) => `${channel}-${tier}`.toLowerCase()

export function compPlansFor(catalogId: string, channelId: string): CompPlan[] {
  const name = findChannelRef(catalogId, channelId)?.label ?? channelId
  const prefix = catalogId === "direct" ? "VWB-US-Eng" : "VWI-US-Eng"
  return [
    { value: planValue(channelId, "Dir"), label: `${prefix}-Dir ${name} Sales` },
    { value: planValue(channelId, "Mgr"), label: `${prefix}-Mgr ${name} Sales` },
    { value: planValue(channelId, "Rep"), label: `${prefix}-Rep ${name} Sales` },
  ]
}

export function jobTitlesFor(catalogId: string, channelId: string): JobTitle[] {
  const name = findChannelRef(catalogId, channelId)?.label ?? channelId
  return ROLES.map((role, i) => ({
    value: `${channelId}-${role.suffix}`.toLowerCase(),
    code: `DUMMY${i + 1}${role.suffix}`,
    label: `${role.label}-${name} Sls`,
    defaultPlan: planValue(channelId, role.plan),
  }))
}

export const periodStart = ({ year, month }: Period) =>
  `${year}-${String(month + 1).padStart(2, "0")}-01`

export const effectiveStartDate = (draft: PlannerDraft) => draft.startDate ?? periodStart(draft.period)

export const formatDate = (value: string) => format(parseISO(value), "MMM d, yyyy")

/** Everything that must be fixed before the planner can be saved. */
export function validate(draft: PlannerDraft): PlannerErrors {
  const errors: PlannerErrors = {}

  if (draft.employeeType === "existing") {
    if (!draft.existing) errors.employee = "Search for and select an employee."
  } else {
    const { firstName, lastName, hrNumber } = draft.newEmployee
    if (!firstName.trim()) errors.firstName = "Enter a first name."
    if (!lastName.trim()) errors.lastName = "Enter a last name."
    if (!hrNumber.trim()) errors.hrNumber = "Enter the HR number."
    else if (!/^\d{5,9}$/.test(hrNumber.trim())) errors.hrNumber = "HR numbers are 5–9 digits."
  }

  if (!draft.jobTitle) errors.jobTitle = "Choose a job title."
  if (!draft.compPlan) errors.compPlan = "Choose a compensation plan."

  const start = parseISO(effectiveStartDate(draft))
  if (start.getFullYear() !== draft.period.year || start.getMonth() !== draft.period.month) {
    errors.startDate = `Start date must fall in ${formatPeriod(draft.period)}.`
  }

  return errors
}
