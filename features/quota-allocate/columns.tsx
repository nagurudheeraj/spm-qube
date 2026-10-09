"use client"

import {
  columnSection,
  createDataTableColumnHelper,
  DataTableColumnHeader,
  EditableCell,
} from "@/components/data-table"
import { cn } from "@/lib/utils"
import { formatTarget } from "./format"
import type { TeamQuotaVault } from "./types"

const col = createDataTableColumnHelper<TeamQuotaVault>()

export const PINNED_COLUMNS = ["name"]

/** Name · Weight · Target for one comp-plan component. */
function componentGroup(index: 0 | 1 | 2) {
  const n = index + 1
  return col.group({
    id: `c${index}`,
    header: `Component ${n}`,
    columns: col.columns([
      col.accessor((v) => v.components[index].metric, {
        id: `c${index}.metric`,
        header: "Name",
        meta: { label: `Component ${n} name`, divider: true },
        size: 150,
        cell: ({ row, getValue }) => (
          <span className={cn("truncate", row.original.components[index].weight === 0 && "text-muted-foreground")}>
            {getValue()}
          </span>
        ),
      }),
      col.accessor((v) => v.components[index].weight, {
        id: `c${index}.weight`,
        header: ({ header }) => <DataTableColumnHeader header={header} title="Weight" />,
        meta: { label: `Component ${n} weight`, align: "right" },
        size: 84,
        enableGlobalFilter: false,
        cell: ({ getValue }) => (
          <span className={cn(getValue() === 0 && "text-muted-foreground")}>{getValue()}%</span>
        ),
      }),
      col.accessor((v) => v.components[index].target, {
        id: `c${index}.target`,
        header: ({ header }) => <DataTableColumnHeader header={header} title="Target" />,
        meta: { label: `Component ${n} target`, align: "right" },
        size: 120,
        enableGlobalFilter: false,
        cell: ({ row, table, getValue }) => (
          <EditableCell
            table={table}
            rowId={row.id}
            field={`c${index}.target`}
            label={`Component ${n} target, ${row.original.name}`}
            value={getValue()}
            type="number"
            format={(v) => formatTarget(row.original.components[index].metric, v)}
          />
        ),
      }),
    ]),
  })
}

export const vaultColumns = col.columns([
  col.accessor("name", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Team quota vault" />,
    meta: { label: "Team quota vault" },
    size: 240,
    enableHiding: false,
    cell: ({ row, getValue }) => (
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate font-medium">{getValue()}</span>
        {!row.original.assigned && (
          <span className="shrink-0 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-px text-[11px] text-amber-700 dark:text-amber-300">
            Unassigned
          </span>
        )}
      </span>
    ),
  }),
  col.accessor("compPlan", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="Compensation plan" />,
    meta: { label: "Compensation plan" },
    size: 210,
    cell: ({ getValue }) => <span className="truncate text-muted-foreground">{getValue()}</span>,
  }),
  ...columnSection<TeamQuotaVault>({
    id: "components",
    label: "Components",
    columns: [componentGroup(0), componentGroup(1), componentGroup(2)],
  }),
  col.accessor("ft", {
    header: ({ header }) => <DataTableColumnHeader header={header} title="F/T" />,
    meta: { label: "F/T", align: "right", divider: true },
    size: 70,
    enableGlobalFilter: false,
  }),
  col.accessor("notes", {
    header: "Notes",
    meta: { label: "Notes", divider: true },
    size: 220,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row, table, getValue }) => (
      <EditableCell
        table={table}
        rowId={row.id}
        field="notes"
        label={`Notes, ${row.original.name}`}
        value={getValue()}
        placeholder="Add a note…"
      />
    ),
  }),
])
