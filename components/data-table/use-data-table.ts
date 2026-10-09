"use client"

import { useMemo } from "react"
import { useTable, type RowData, type TableOptions } from "@tanstack/react-table"

import { sectionStubVisibility } from "./column-sections"
import { dataTableFeatures, type DataTableFeatures } from "./features"
import { ROW_CONTROL_COLUMN_ID, rowControlColumn, type RowControl } from "./row-controls"

export const DEFAULT_PAGE_SIZE = 100

type UseDataTableOptions<TData extends RowData> = Omit<TableOptions<DataTableFeatures, TData>, "features"> & {
  /** Leading per-row control: checkboxes ("select") or an accordion chevron ("expand"). */
  rowControl?: RowControl
}

/**
 * `useTable` with QUBE defaults: shared features, 100-row pages, global
 * search, an optional leading row control (always first and pinned), and
 * collapsed-section placeholders hidden initially.
 *
 * Server-driven tables pass `manualPagination` / `manualSorting` /
 * `manualFiltering` + `rowCount`, and put that state in their query key.
 */
export function useDataTable<TData extends RowData>({
  rowControl,
  columns: baseColumns,
  initialState,
  ...options
}: UseDataTableOptions<TData>) {
  // Columns must stay referentially stable, so only rebuild when inputs change.
  const columns = useMemo(
    () => (rowControl ? [rowControlColumn<TData>(rowControl), ...baseColumns] : baseColumns),
    [rowControl, baseColumns]
  )

  const pinnedStart = initialState?.columnPinning?.start ?? []

  return useTable({
    features: dataTableFeatures,
    globalFilterFn: "includesString",
    enableMultiSort: true,
    getRowCanExpand: rowControl === "expand" ? () => true : undefined,
    ...options,
    columns,
    initialState: {
      pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
      ...initialState,
      columnPinning: {
        end: initialState?.columnPinning?.end ?? [],
        start: rowControl ? [ROW_CONTROL_COLUMN_ID, ...pinnedStart] : pinnedStart,
      },
      // Collapsed-section placeholders start hidden.
      columnVisibility: { ...sectionStubVisibility(baseColumns), ...initialState?.columnVisibility },
    },
  })
}
