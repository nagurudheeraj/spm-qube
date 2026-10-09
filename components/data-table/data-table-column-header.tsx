"use client"

import type { Header, RowData } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DataTableFeatures } from "./features"

/** Sortable header label. Use as `header: ({ header }) => <DataTableColumnHeader header={header} title="Name" />` */
export function DataTableColumnHeader<TData extends RowData, TValue>({
  header,
  title,
}: {
  header: Header<DataTableFeatures, TData, TValue>
  title: string
}) {
  const column = header.column
  if (!column.getCanSort()) return <span className="truncate">{title}</span>

  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown
  const sortIndex = column.getSortIndex()

  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "-mx-1.5 min-w-0 gap-1 px-1.5 font-medium text-muted-foreground",
        sorted && "text-foreground",
        column.columnDef.meta?.align === "right" && "flex-row-reverse"
      )}
    >
      <span className="truncate">{title}</span>
      <Icon className={cn("size-3 shrink-0", !sorted && "opacity-40")} />
      {sorted && sortIndex > 0 && <span className="text-[10px] tabular-nums opacity-60">{sortIndex + 1}</span>}
    </Button>
  )
}
