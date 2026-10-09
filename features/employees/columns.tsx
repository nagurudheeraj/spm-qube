"use client"

import { Badge } from "@/components/ui/badge"
import { createDataTableColumnHelper, DataTableColumnHeader } from "@/components/data-table"
import { cn } from "@/lib/utils"
import type { Employee, EmployeeStatus } from "./types"

const col = createDataTableColumnHelper<Employee>()

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })

const statusDot: Record<EmployeeStatus, string> = {
  Active: "bg-emerald-500",
  "On leave": "bg-amber-500",
  Terminated: "bg-muted-foreground/40",
}

// Module scope: columns must be referentially stable.
export const employeeColumns = col.columns([
  col.accessor("id", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Employee ID" />,
    meta: { label: "Employee ID" },
    size: 120,
    cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue()}</span>,
  }),
  col.accessor("name", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Name" />,
    meta: { label: "Name" },
    size: 180,
    cell: ({ getValue }) => <span className="truncate font-medium">{getValue()}</span>,
  }),
  col.accessor("title", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Title" />,
    meta: { label: "Title" },
    size: 170,
  }),
  col.accessor("channel", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Channel" />,
    meta: { label: "Channel" },
    size: 110,
    filterFn: "equalsString",
    cell: ({ getValue }) => <Badge variant="outline" className="font-normal">{getValue()}</Badge>,
  }),
  col.accessor("region", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Region" />,
    meta: { label: "Region" },
    size: 120,
  }),
  col.accessor("salesId", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Sales ID" />,
    meta: { label: "Sales ID" },
    size: 100,
    cell: ({ getValue }) => <span className="font-mono text-xs">{getValue()}</span>,
  }),
  col.accessor("quota", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Quota" />,
    meta: { label: "Quota", align: "right" },
    size: 110,
    enableGlobalFilter: false,
    cell: ({ getValue }) => currency.format(getValue()),
  }),
  col.accessor("attainment", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Attainment" />,
    meta: { label: "Attainment", align: "right" },
    size: 110,
    enableGlobalFilter: false,
    cell: ({ getValue }) => {
      const value = getValue()
      return (
        <span className={cn(value >= 100 ? "text-emerald-600 dark:text-emerald-400" : value < 60 && "text-muted-foreground")}>
          {value.toFixed(1)}%
        </span>
      )
    },
  }),
  col.accessor("status", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Status" />,
    meta: { label: "Status" },
    size: 110,
    filterFn: "equalsString",
    cell: ({ getValue }) => (
      <span className="inline-flex items-center gap-1.5">
        <span className={cn("size-1.5 rounded-full", statusDot[getValue()])} />
        {getValue()}
      </span>
    ),
  }),
  col.accessor("hireDate", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Hire date" />,
    meta: { label: "Hire date", align: "right" },
    size: 120,
    sortFn: "alphanumeric",
    enableGlobalFilter: false,
    cell: ({ getValue }) => dateFmt.format(new Date(getValue())),
  }),
])
