"use client"

import { useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, UserRound, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { InputGroupAddon } from "@/components/ui/input-group"
import { matchesEmployee, plannerEmployeesQueryOptions } from "./api"
import type { PlannerEmployee } from "./types"

const fullName = (e: PlannerEmployee) => `${e.lastName}, ${e.firstName}`

type EmployeePickerProps = {
  id: string
  value: PlannerEmployee | null
  onChange: (employee: PlannerEmployee | null) => void
  invalid?: boolean
}

/** Type-ahead over HR number / Sales ID / name; the pick shows as a card with a "Change" action. */
export function EmployeePicker({ id, value, onChange, invalid }: EmployeePickerProps) {
  const { data: employees = [], isPending } = useQuery(plannerEmployeesQueryOptions())
  // Anchor results to the whole field (icon included), not just the text box.
  const fieldRef = useRef<HTMLDivElement>(null)

  if (value) return <EmployeeCard employee={value} onClear={() => onChange(null)} />

  return (
    <Combobox
      items={employees}
      value={null}
      onValueChange={(e) => e && onChange(e as PlannerEmployee)}
      itemToStringLabel={(e: PlannerEmployee) => fullName(e)}
      filter={(e: PlannerEmployee, query: string) => matchesEmployee(e, query)}
      limit={50}
    >
      <div ref={fieldRef}>
        <ComboboxInput
          id={id}
          showTrigger={false}
          aria-invalid={invalid || undefined}
          placeholder={isPending ? "Loading employees…" : "HR number, Sales ID or name (Last, First)"}
          className="h-9 w-full"
        >
          <InputGroupAddon align="inline-start">
            <Search className="text-muted-foreground" />
          </InputGroupAddon>
        </ComboboxInput>
      </div>
      <ComboboxContent anchor={fieldRef}>
        <ComboboxEmpty className="px-3 py-6 text-center text-[13px] text-muted-foreground">
          No employees match. Check the spelling, or switch to <span className="font-medium">New hire</span>.
        </ComboboxEmpty>
        <ComboboxList>
          {(e: PlannerEmployee) => (
            <ComboboxItem key={e.hrNumber} value={e} className="gap-3 py-1.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground">
                {e.firstName[0]}
                {e.lastName[0]}
              </span>
              <span className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate text-[13px] font-medium">{fullName(e)}</span>
                <span className="truncate text-xs text-muted-foreground">{e.title}</span>
              </span>
              <span className="shrink-0 text-right font-mono text-[11px] leading-tight text-muted-foreground tabular-nums">
                {e.hrNumber}
                <br />
                {e.salesId}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function EmployeeCard({ employee, onClear }: { employee: PlannerEmployee; onClear: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-foreground text-[13px] font-semibold text-background">
        {employee.firstName[0]}
        {employee.lastName[0]}
      </span>
      <div className="grid min-w-0 flex-1 gap-1">
        <span className="truncate text-sm font-medium">{fullName(employee)}</span>
        <dl className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
          <div className="flex gap-1">
            <dt>HR</dt>
            <dd className="font-mono text-foreground tabular-nums">{employee.hrNumber}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Sales ID</dt>
            <dd className="font-mono text-foreground tabular-nums">{employee.salesId}</dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="sr-only">Current title</dt>
            <UserRound className="size-3" />
            <dd>{employee.title}</dd>
          </div>
        </dl>
      </div>
      <Button variant="ghost" size="sm" onClick={onClear} aria-label={`Change employee (${fullName(employee)})`}>
        <X />
        Change
      </Button>
    </div>
  )
}
