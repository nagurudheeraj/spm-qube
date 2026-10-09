"use client"

import { Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { findChannelRef, findCatalog } from "@/config/catalogs"
import { AREAS } from "@/features/quota-allocate/options"
import { formatPeriod } from "@/lib/period"
import { cn } from "@/lib/utils"
import { effectiveStartDate, formatDate } from "./options"
import type { CompPlan, JobTitle, PlannerDraft, PlannerErrors } from "./types"

type PlannerSummaryProps = {
  draft: PlannerDraft
  errors: PlannerErrors
  jobTitle?: JobTitle
  compPlan?: CompPlan
  saving: boolean
  dirty: boolean
  onReset: () => void
}

/** Live recap of the planner with a completion checklist and the save actions. */
export function PlannerSummary({ draft, errors, jobTitle, compPlan, saving, dirty, onReset }: PlannerSummaryProps) {
  const employee = draft.employeeType === "existing" ? draft.existing : draft.newEmployee
  const employeeName = employee?.firstName.trim() || employee?.lastName.trim()
    ? `${employee.lastName.trim()}, ${employee.firstName.trim()}`.replace(/^, |, $/, "")
    : null
  const employeeDone = draft.employeeType === "existing"
    ? !errors.employee
    : !errors.firstName && !errors.lastName && !errors.hrNumber

  const rows = [
    {
      label: "Scope",
      value: [
        findCatalog(draft.catalog)?.label,
        findChannelRef(draft.catalog, draft.channel)?.label,
        AREAS.find((a) => a.value === draft.area)?.label,
      ].join(" · "),
      done: true,
    },
    { label: "Period", value: formatPeriod(draft.period), done: true },
    {
      label: draft.employeeType === "existing" ? "Employee" : "New hire",
      value: employeeName,
      detail: employee?.hrNumber ? `HR ${employee.hrNumber}` : undefined,
      done: employeeDone,
    },
    { label: "Job title", value: jobTitle?.label, detail: jobTitle?.code, done: !errors.jobTitle },
    { label: "Comp plan", value: compPlan?.label, done: !errors.compPlan },
    { label: "Start date", value: formatDate(effectiveStartDate(draft)), done: !errors.startDate },
  ]
  const remaining = rows.filter((r) => !r.done).length

  return (
    <aside aria-label="Planner summary" className="overflow-hidden rounded-xl border bg-card lg:sticky lg:top-6">
      <header className="flex items-baseline justify-between gap-2 border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Summary</h2>
        <span className={cn("text-xs", remaining ? "text-muted-foreground" : "text-emerald-600 dark:text-emerald-400")}>
          {remaining ? `${remaining} to complete` : "Ready to save"}
        </span>
      </header>

      <ol className="space-y-3.5 px-4 py-4">
        {rows.map((row) => (
          <li key={row.label} className="flex gap-3">
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                row.done ? "bg-emerald-500 text-white" : "border border-dashed border-muted-foreground/50"
              )}
            >
              {row.done && <Check className="size-2.5" strokeWidth={3} />}
            </span>
            <div className="grid min-w-0 flex-1 gap-0.5 leading-tight">
              <span className="text-xs text-muted-foreground">
                {row.label}
                <span className="sr-only">{row.done ? " (complete)" : " (incomplete)"}</span>
              </span>
              <span className={cn("truncate text-[13px]", row.value ? "font-medium" : "text-muted-foreground/70")} title={row.value ?? undefined}>
                {row.value || "Not set"}
              </span>
              {row.detail && <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{row.detail}</span>}
            </div>
          </li>
        ))}
      </ol>

      <footer className="space-y-2 border-t bg-muted/30 p-4">
        <Button type="submit" className="h-9 w-full" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          {saving ? "Creating planner…" : "Create planner"}
          {!saving && <Kbd className="ml-auto h-5 bg-primary-foreground/15 px-1.5 text-[11px] text-primary-foreground">⌘↵</Kbd>}
        </Button>
        <Button type="button" variant="ghost" className="h-9 w-full text-muted-foreground" disabled={!dirty || saving} onClick={onReset}>
          Discard
        </Button>
      </footer>
    </aside>
  )
}
