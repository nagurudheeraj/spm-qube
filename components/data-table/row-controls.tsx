"use client"

import type { ColumnDef, RowData } from "@tanstack/react-table"
import { ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { DataTableFeatures } from "./features"

/**
 * The leading per-row control of a grid, chosen with `useDataTable({ rowControl })`:
 * - "select": checkboxes for row selection (with select-all in the header)
 * - "expand": accordion chevron; pair with `<DataTable renderExpanded={…} />`
 * Add new kinds here.
 */
export type RowControl = "select" | "expand"

export const ROW_CONTROL_COLUMN_ID = "rowControl"

type ControlColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData, unknown>

const base = {
  id: ROW_CONTROL_COLUMN_ID,
  size: 40,
  enableSorting: false,
  enableHiding: false,
  enableGlobalFilter: false,
  meta: { align: "center" as const },
}

function selectColumn<TData extends RowData>(): ControlColumn<TData> {
  return {
    ...base,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows"
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllRowsSelected(checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
        onClick={(e) => e.stopPropagation()}
      />
    ),
  }
}

function expandColumn<TData extends RowData>(): ControlColumn<TData> {
  return {
    ...base,
    header: ({ table }) => {
      const all = table.getIsAllRowsExpanded()
      return (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={all ? "Collapse all rows" : "Expand all rows"}
          title={all ? "Collapse all" : "Expand all"}
          onClick={() => table.toggleAllRowsExpanded(!all)}
          className="text-muted-foreground"
        >
          <ChevronRight className={cn("size-4! transition-transform", all && "rotate-90")} />
        </Button>
      )
    },
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
          aria-expanded={row.getIsExpanded()}
          onClick={(e) => {
            e.stopPropagation()
            row.toggleExpanded()
          }}
          className="text-muted-foreground"
        >
          <ChevronRight className={cn("size-4! transition-transform duration-200", row.getIsExpanded() && "rotate-90 text-foreground")} />
        </Button>
      ) : null,
  }
}

export function rowControlColumn<TData extends RowData>(control: RowControl): ControlColumn<TData> {
  return control === "select" ? selectColumn<TData>() : expandColumn<TData>()
}
