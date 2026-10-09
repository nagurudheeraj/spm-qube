"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import type { Column, RowData } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { ChevronsLeft, ChevronsRight, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toggleSection } from "./column-sections"
import type { DataTableFeatures, DataTableInstance } from "./features"

type DataTableProps<TData extends RowData> = {
  table: DataTableInstance<TData>
  /** First load — renders skeleton rows. */
  isLoading?: boolean
  /** Background refetch — shows a thin progress bar. */
  isFetching?: boolean
  /** Height of the scroll viewport. Rows outside it are not rendered. */
  height?: number | string
  /** Grow to fill a flex-column parent instead of using `height`. */
  fill?: boolean
  rowHeight?: number
  emptyMessage?: string
  onRowClick?: (row: TData) => void
  /**
   * Accordion panel shown under an expanded row (use with `rowControl: "expand"`).
   * Clicking a row toggles it when no `onRowClick` is given.
   */
  renderExpanded?: (row: TData) => ReactNode
  className?: string
}

type AnyColumn<TData extends RowData> = Column<DataTableFeatures, TData, unknown>

const alignClass = { left: "justify-start text-left", center: "justify-center text-center", right: "justify-end text-right" }

// Opaque surfaces so pinned (sticky) cells hide what scrolls underneath.
const headBg = "bg-[color-mix(in_oklch,var(--card),var(--muted)_70%)]"
// Column-group tints (see .dt-group-a/b in globals.css). Group band > sub-header > body.
const groupBand = "bg-[color-mix(in_oklch,var(--card),var(--dt-group)_20%)] border-t-2 border-t-(--dt-group)"
const groupHead = "bg-[color-mix(in_oklch,var(--card),var(--dt-group)_11%)]"
const groupBody = "bg-[color-mix(in_oklch,transparent,var(--dt-group)_5%)]"

/** Top-level group of a column (itself if it has no parent). */
function rootColumn<TData extends RowData>(column: AnyColumn<TData>) {
  let c = column
  while (c.parent) c = c.parent
  return c
}

// Diagonal hatching for the body of a collapsed section placeholder.
const collapsedBody = "bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--border)_6px_7px)] opacity-60"

const pinnedBodyBg =
  "bg-card group-hover/row:bg-[color-mix(in_oklch,var(--card),var(--muted)_40%)] group-data-[state=selected]/row:bg-[color-mix(in_oklch,var(--card),var(--muted)_70%)]"

/**
 * Width + pinning for a cell. Text columns start at their size and grow to
 * fill; pinned, numeric and placeholder columns stay at their size.
 */
function cellLayout<TData extends RowData>(column: AnyColumn<TData>, size: number, pinnedCount: number) {
  const pinned = column.getIsPinned() === "start"
  // Numeric (right-aligned) columns and section placeholders keep their size; text columns absorb spare width.
  const meta = column.columnDef.meta
  const fixedWidth = Boolean(meta?.sectionStub) || meta?.align === "right"
  const style: CSSProperties = pinned
    ? { width: size, flex: "none", position: "sticky", left: column.getStart("start"), zIndex: 1 }
    : fixedWidth
      ? { width: size, flex: "none" }
      : { width: size, flex: `${size} 0 auto`, minWidth: size }
  const lastPinned = pinned && column.getPinnedIndex() === pinnedCount - 1
  return { style, pinned, lastPinned }
}

/**
 * Virtualized table: only rows in view are mounted, so thousands of rows
 * per page stay smooth. Supports grouped headers, pinned columns and inline
 * editing (via `EditableCell`). Pair with `useDataTable`, `DataTableToolbar`
 * and `DataTablePagination`.
 */
export function DataTable<TData extends RowData>({
  table,
  isLoading,
  isFetching,
  height = "min(70svh, 720px)",
  fill,
  rowHeight = 40,
  emptyMessage = "No results.",
  onRowClick,
  renderExpanded,
  className,
}: DataTableProps<TData>) {
  const scrollRef = useRef<HTMLDivElement>(null)
  // Expanded panels span the visible width, not the full (scrollable) table width.
  const [viewportWidth, setViewportWidth] = useState(0)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const rows = table.getRowModel().rows

  // eslint-disable-next-line react-hooks/incompatible-library -- virtualizer returns fresh functions by design
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    getItemKey: (index) => rows[index].id,
    overscan: 12,
  })

  const visibleColumns = table.getVisibleLeafColumns()
  const pinnedCount = table.state.columnPinning.start.length
  const headerGroups = table.getHeaderGroups()
  const visibility = table.state.columnVisibility

  // Alternate a/b tones across visible top-level column groups.
  const groupTone: Record<string, "dt-group-a" | "dt-group-b"> = {}
  if (headerGroups.length > 1) {
    headerGroups[0].headers
      .filter((h) => !h.isPlaceholder && h.subHeaders.length > 0)
      .forEach((h, i) => (groupTone[rootColumn(h.column).id] = i % 2 ? "dt-group-b" : "dt-group-a"))
  }
  const toneOf = (column: AnyColumn<TData>) => groupTone[rootColumn(column).id]

  // Section labels, for the collapse buttons' accessible names.
  const sectionLabels = Object.fromEntries(
    table.getAllLeafColumns().flatMap((c) => {
      const stub = c.columnDef.meta?.sectionStub
      return stub ? [[stub.id, stub.label]] : []
    })
  )
  const showEmpty = !isLoading && rows.length === 0

  return (
    <div className={cn("relative overflow-hidden rounded-lg border bg-card", fill && "flex min-h-0 flex-1 flex-col", className)}>
      {isFetching && !isLoading && (
        <div className="absolute inset-x-0 top-0 z-30 h-0.5 overflow-hidden bg-primary/10">
          <div className="h-full w-1/3 animate-[data-table-progress_1s_ease-in-out_infinite] bg-primary/60" />
        </div>
      )}
      <div
        ref={scrollRef}
        className={cn("relative overflow-auto overscroll-contain", fill && "min-h-0 flex-1")}
        style={fill ? undefined : { height }}
      >
        <table className="grid text-[13px]" style={{ minWidth: table.getTotalSize() }}>
          <thead className={cn("sticky top-0 z-20 grid border-b", headBg)}>
            {headerGroups.map((group, depth) => {
              const isLeafRow = depth === headerGroups.length - 1
              // Expand buttons live in the group row; with no groups left (all collapsed) use the only row.
              const isStubRow = depth === 0
              const sectionsSeen = new Set<string>()
              return (
                <tr key={group.id} className="flex w-full">
                  {group.headers.map((header) => {
                    const leaf = header.subHeaders.length === 0
                    const meta = header.column.columnDef.meta
                    const align = leaf ? (meta?.align ?? "left") : "center"
                    const { style, lastPinned } = cellLayout(header.column, header.getSize(), pinnedCount)
                    const stub = meta?.sectionStub
                    const tone = header.isPlaceholder ? undefined : toneOf(header.column)
                    // The first group of each section carries that section's collapse button.
                    const section = !leaf && meta?.section && !sectionsSeen.has(meta.section) ? meta.section : null
                    if (section) sectionsSeen.add(section)
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        style={style}
                        className={cn(
                          "relative flex items-center px-3 text-xs font-medium text-muted-foreground",
                          tone ? [tone, leaf ? groupHead : groupBand] : headBg,
                          isLeafRow ? "h-9" : "h-8",
                          alignClass[align],
                          !leaf && "border-b border-l text-foreground",
                          leaf && meta?.divider && "border-l",
                          stub && "px-1.5",
                          stub && isStubRow && !isLeafRow && "border-b",
                          lastPinned && "border-r"
                        )}
                      >
                        {section && (
                          <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() => toggleSection(table, visibility, section)}
                            aria-label={`Collapse ${sectionLabels[section] ?? section}`}
                            title={`Collapse ${sectionLabels[section] ?? section}`}
                            className="absolute left-1.5 size-5 text-muted-foreground"
                          >
                            <ChevronsLeft />
                          </Button>
                        )}
                        {stub && isStubRow ? (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => toggleSection(table, visibility, stub.id)}
                            aria-label={`Expand ${stub.label}`}
                            title={`Expand ${stub.label}`}
                            className="min-w-0 font-medium hover:bg-background"
                          >
                            <ChevronsRight />
                            <span className="truncate">{stub.label}</span>
                          </Button>
                        ) : header.isPlaceholder ? null : (
                          <table.FlexRender header={header} />
                        )}
                      </th>
                    )
                  })}
                </tr>
              )
            })}
          </thead>

          {isLoading ? (
            <tbody className="grid">
              {Array.from({ length: 12 }, (_, i) => (
                <tr key={i} className="flex w-full border-b last:border-0" style={{ height: rowHeight }}>
                  {visibleColumns.map((column) => (
                    <td key={column.id} style={cellLayout(column, column.getSize(), pinnedCount).style} className="flex items-center bg-card px-3">
                      <Skeleton className="h-3.5 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody className="relative grid" style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((item) => {
                const row = rows[item.index]
                const expanded = Boolean(renderExpanded) && row.getIsExpanded()
                const handleClick = onRowClick
                  ? () => onRowClick(row.original)
                  : renderExpanded && row.getCanExpand()
                    ? () => row.toggleExpanded()
                    : undefined
                return (
                  <tr
                    key={row.id}
                    data-index={item.index}
                    // Rows are measured, so expanded panels can have any height.
                    ref={virtualizer.measureElement}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    data-expanded={expanded || undefined}
                    onClick={handleClick}
                    className={cn(
                      "group/row absolute flex w-full flex-wrap border-b transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted/70 data-expanded:bg-muted/30",
                      handleClick && "cursor-pointer"
                    )}
                    style={{ transform: `translateY(${item.start}px)` }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta
                      const align = meta?.align ?? "left"
                      const { style, pinned, lastPinned } = cellLayout(cell.column, cell.column.getSize(), pinnedCount)
                      const tone = toneOf(cell.column)
                      return (
                        <td
                          key={cell.id}
                          style={{ ...style, height: rowHeight }}
                          className={cn(
                            "flex min-w-0 items-center truncate px-3",
                            alignClass[align],
                            align === "right" && "tabular-nums",
                            meta?.divider && "border-l",
                            meta?.sectionStub && collapsedBody,
                            tone,
                            tone && groupBody,
                            pinned && pinnedBodyBg,
                            lastPinned && "border-r"
                          )}
                        >
                          <table.FlexRender cell={cell} />
                        </td>
                      )
                    })}
                    {expanded && (
                      // Wraps onto its own line; sticky so it stays in view while scrolling sideways.
                      <td
                        className="sticky left-0 cursor-default border-t bg-card"
                        style={{ width: viewportWidth || "100%", flex: "none" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {renderExpanded?.(row.original)}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          )}
        </table>

        {showEmpty && (
          <div className="absolute inset-0 top-9 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <SearchX className="size-5" strokeWidth={1.75} />
            <p className="text-[13px]">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
}
