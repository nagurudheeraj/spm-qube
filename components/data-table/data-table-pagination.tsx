"use client"

import type { RowData } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DataTableInstance } from "./features"

const PAGE_SIZES = [50, 100, 250, 500, 1000].map((n) => ({ value: String(n), label: String(n) }))

export function DataTablePagination<TData extends RowData>({ table }: { table: DataTableInstance<TData> }) {
  const { pageIndex, pageSize } = table.state.pagination
  const total = table.getRowCount()
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min(total, (pageIndex + 1) * pageSize)
  const pageCount = Math.max(1, table.getPageCount())

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted-foreground">
      <p className="tabular-nums">
        {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}
      </p>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span>Rows</span>
          <Select items={PAGE_SIZES} value={String(pageSize)} onValueChange={(v) => v && table.setPageSize(Number(v))}>
            <SelectTrigger size="sm" aria-label="Rows per page" className="min-w-20">
              <SelectValue className="tabular-nums" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="end" side="top">
              <SelectGroup>
                {PAGE_SIZES.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="tabular-nums">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <span className="tabular-nums">
          Page {(pageIndex + 1).toLocaleString()} of {pageCount.toLocaleString()}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" aria-label="First page" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronsLeft />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Previous page" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Next page" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Last page" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
