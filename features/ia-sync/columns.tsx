"use client"

import type { Table } from "@tanstack/react-table"
import { Check, Minus } from "lucide-react"

import { createDataTableColumnHelper, DataTableColumnHeader, EditableCell, type DataTableFeatures } from "@/components/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { IaSyncField, IaSyncRow } from "./types"

const col = createDataTableColumnHelper<IaSyncRow>()

/** Read-only IA flag as the system has it today. */
function CurrentFlag({ on, system }: { on: boolean; system: string }) {
  return on ? (
    <Check aria-label={`IA on in ${system}`} className="size-4 text-muted-foreground" />
  ) : (
    <Minus aria-label={`IA off in ${system}`} className="size-4 text-muted-foreground/40" />
  )
}

/** Editable IA flag to sync; differs-from-current and edited states are marked. */
function SyncFlag({
  table,
  row,
  field,
  system,
}: {
  table: Pick<Table<DataTableFeatures, IaSyncRow>, "options">
  row: IaSyncRow
  field: Extract<IaSyncField, "qube.sync" | "ccrs.sync">
  system: "QUBE" | "CCRS"
}) {
  const edits = table.options.meta?.edits
  const flag = field === "qube.sync" ? row.qube : row.ccrs
  const edited = edits?.get(row.id, field) as boolean | undefined
  const value = edited ?? flag.sync
  const changes = value !== flag.current
  return (
    <span
      className={cn(
        "relative inline-flex size-7 items-center justify-center rounded-md",
        edited !== undefined && "bg-amber-500/10",
      )}
      title={changes ? `Will turn IA ${value ? "on" : "off"} in ${system}` : undefined}
    >
      <Checkbox
        aria-label={`Sync IA ${system}, ${row.name}`}
        checked={value}
        disabled={!edits || edits.readOnly}
        onCheckedChange={(checked) => edits?.set(row.id, field, Boolean(checked), flag.sync)}
      />
      {edited !== undefined && <span aria-hidden className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-amber-500" />}
    </span>
  )
}

const text = (id: "salesId" | "name" | "jobTitle" | "channel" | "market", title: string, size: number, mono = false) =>
  col.accessor(id, {
    header: ({ header }) => <DataTableColumnHeader header={header} title={title} />,
    meta: { label: title },
    size,
    cell: ({ getValue }) => (
      <span title={getValue()} className={cn("truncate", mono && "font-mono text-xs")}>
        {getValue()}
      </span>
    ),
  })

const flagGroup = (system: "QUBE" | "CCRS") => {
  const key = system === "QUBE" ? "qube" : "ccrs"
  return col.group({
    id: key,
    header: system,
    columns: col.columns([
      col.accessor((r) => r[key].current, {
        id: `${key}.current`,
        header: "Current",
        meta: { label: `${system} current`, align: "center", divider: true },
        size: 76,
        enableGlobalFilter: false,
        cell: ({ getValue }) => <CurrentFlag on={getValue()} system={system} />,
      }),
      col.accessor((r) => r[key].sync, {
        id: `${key}.sync`,
        header: "Sync",
        meta: { label: `${system} sync`, align: "center" },
        size: 64,
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row, table }) => <SyncFlag table={table} row={row.original} field={`${key}.sync`} system={system} />,
      }),
    ]),
  })
}

export const IA_PINNED = ["index", "salesId", "name"]

export const iaSyncColumns = col.columns([
  col.display({
    id: "index",
    header: () => <span className="sr-only">Row</span>,
    size: 48,
    enableHiding: false,
    meta: { align: "right" },
    cell: ({ row, table }) => (
      <span className="text-xs text-muted-foreground tabular-nums">{table.getRowModel().rows.indexOf(row) + 1}</span>
    ),
  }),
  text("salesId", "Sales ID", 112, true),
  col.accessor("name", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Name" />,
    meta: { label: "Name" },
    size: 200,
    enableHiding: false,
    cell: ({ getValue }) => <span className="truncate font-medium">{getValue()}</span>,
  }),
  text("jobTitle", "Job code / title", 200),
  text("channel", "Channel", 84, true),
  text("market", "Market", 76, true),
  flagGroup("QUBE"),
  flagGroup("CCRS"),
  col.accessor("alert", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Alert" />,
    meta: { label: "Alert", divider: true },
    size: 460,
    cell: ({ getValue }) => (
      <span title={getValue()} className="truncate">
        {getValue()}
      </span>
    ),
  }),
  col.accessor("proposed", {
    header: "Addtl. details / proposed corrections",
    meta: { label: "Proposed corrections", divider: true },
    size: 240,
    enableSorting: false,
    cell: ({ row, table, getValue }) => (
      <EditableCell
        table={table}
        rowId={row.id}
        field="proposed"
        label={`Proposed correction, ${row.original.name}`}
        value={getValue()}
        placeholder="Add details…"
      />
    ),
  }),
])
