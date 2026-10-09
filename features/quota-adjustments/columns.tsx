"use client"

import { Check } from "lucide-react"

import { createDataTableColumnHelper, DataTableColumnHeader } from "@/components/data-table"
import { cn } from "@/lib/utils"
import { stageLabel } from "./options"
import type { Adjustment, AdjustmentStage } from "./types"

const col = createDataTableColumnHelper<Adjustment>()

const dateTime = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

const STAGE_DOT: Record<AdjustmentStage, string> = {
  allocate: "bg-sky-500",
  freeze: "bg-indigo-500",
  "request-approval": "bg-amber-500",
  approved: "bg-emerald-500",
  load: "bg-teal-500",
  loaded: "bg-muted-foreground/40",
}

const STAGE_ORDER = Object.fromEntries(Object.keys(STAGE_DOT).map((s, i) => [s, i])) as Record<AdjustmentStage, number>

/** Plain text column; `search` makes it count for the results filter. */
const text = (id: keyof Adjustment, title: string, size: number, opts: { mono?: boolean; search?: boolean } = {}) =>
  col.accessor(id, {
    header: ({ header }) => <DataTableColumnHeader header={header} title={title} />,
    meta: { label: title },
    size,
    enableGlobalFilter: Boolean(opts.search),
    cell: ({ getValue }) => {
      const v = String(getValue() ?? "")
      return v ? (
        <span title={v} className={cn("truncate", opts.mono && "font-mono text-xs")}>
          {v}
        </span>
      ) : (
        <span className="text-muted-foreground/50">—</span>
      )
    },
  })

const timestamp = (id: "created" | "modified", title: string) =>
  col.accessor(id, {
    header: ({ header }) => <DataTableColumnHeader header={header} title={title} />,
    meta: { label: title },
    size: 168,
    enableGlobalFilter: false,
    cell: ({ getValue }) => {
      const v = getValue()
      return v ? (
        <span className="tabular-nums">{dateTime.format(new Date(v))}</span>
      ) : (
        <span className="text-muted-foreground/50">—</span>
      )
    },
  })

export const adjustmentColumns = col.columns([
  text("group", "Group", 84, { mono: true }),
  text("locale", "Locale", 120, { mono: true }),
  text("period", "Period", 84, { mono: true }),
  text("type", "Type", 120),
  text("subType", "Sub-type", 150),
  timestamp("created", "Created"),
  text("createdBy", "Created by", 140),
  col.accessor("size", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Size" />,
    meta: { label: "Size", align: "right" },
    size: 72,
    enableGlobalFilter: false,
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  }),
  col.accessor("stage", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Stage" />,
    meta: { label: "Stage" },
    size: 150,
    enableGlobalFilter: false,
    sortFn: (a, b) => STAGE_ORDER[a.original.stage] - STAGE_ORDER[b.original.stage],
    cell: ({ getValue }) => (
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden className={cn("size-1.5 rounded-full", STAGE_DOT[getValue()])} />
        {stageLabel(getValue())}
      </span>
    ),
  }),
  text("description", "Description", 280, { search: true }),
  text("reason", "Reason", 150, { search: true }),
  text("reference", "Reference", 120, { mono: true, search: true }),
  timestamp("modified", "Modified"),
  text("modifiedBy", "Modified by", 140),
  col.accessor("shared", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Shared" />,
    meta: { label: "Shared", align: "center" },
    size: 80,
    enableGlobalFilter: false,
    cell: ({ getValue }) =>
      getValue() ? (
        <Check aria-label="Shared" className="size-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <span className="sr-only">Not shared</span>
      ),
  }),
])
