"use client"

import { CircleCheck } from "lucide-react"

import { createDataTableColumnHelper, DataTableColumnHeader } from "@/components/data-table"
import type { EmployeeResult } from "./types"

const col = createDataTableColumnHelper<EmployeeResult>()

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const num = new Intl.NumberFormat("en-US")

const text = (id: keyof EmployeeResult, title: string, size: number, mono = false) =>
  col.accessor(id, {
    header: ({ header }) => <DataTableColumnHeader header={header} title={title} />,
    meta: { label: title },
    size,
    cell: ({ getValue }) => <span className={mono ? "font-mono text-xs" : "truncate"}>{String(getValue())}</span>,
  })

const number = (id: keyof EmployeeResult, title: string, money = false) =>
  col.accessor(id, {
    header: ({ header }) => <DataTableColumnHeader header={header} title={title} />,
    meta: { label: title, align: "right" },
    size: 96,
    cell: ({ getValue }) => {
      const v = getValue() as number
      return <span className={v === 0 ? "text-muted-foreground" : undefined}>{money ? usd.format(v) : num.format(v)}</span>
    },
  })

export const FIND_PINNED = ["period", "name"]

export const employeeResultColumns = col.columns([
  col.accessor("period", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Period" />,
    meta: { label: "Period" },
    size: 104,
    enableHiding: false,
    cell: ({ row, getValue }) => (
      <span className="flex items-center gap-1.5 tabular-nums">
        {row.original.assigned ? (
          <CircleCheck aria-label="Quota assigned" className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <span aria-hidden className="size-3.5" />
        )}
        {getValue()}
      </span>
    ),
  }),
  col.accessor("name", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Name" />,
    meta: { label: "Name" },
    size: 180,
    enableHiding: false,
    cell: ({ getValue }) => <span className="truncate font-medium">{getValue()}</span>,
  }),
  text("eid", "EID", 116, true),
  text("hrNumber", "HR #", 116, true),
  text("salesId", "Sales ID", 104, true),
  text("realSalesId", "Real sales ID", 116, true),
  text("title", "Title", 200),
  text("plan", "Plan", 180),
  text("locale", "Locale", 116),
  number("atRisk", "At-risk", true),
  number("gross", "Gross"),
  number("net", "Net"),
  number("sales", "Sales", true),
  text("director", "Director", 180),
  text("rollsTo", "Rolls to", 160),
])
