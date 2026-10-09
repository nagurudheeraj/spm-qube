import {
  columnFilteringFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrIncludesSome,
  filterFn_equalsString,
  filterFn_includesString,
  globalFilteringFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type CellData,
  type ReactTable,
  type RowData,
  type TableFeatures,
} from "@tanstack/react-table"

/**
 * The one feature registry every QUBE table uses. Module-scoped so it stays
 * referentially stable (TanStack Table v9 requirement).
 */
/** Shared `table.options.meta` shape. */
export type DataTableMeta = {
  /** Pending inline edits; see `EditableCell` and `useCellEdits`. */
  edits?: CellEdits
}

export type CellEdits = {
  /** Edited value, or `undefined` when the cell is unchanged. */
  get: (rowId: string, field: string) => unknown
  /** Records an edit; passing the original value clears it. */
  set: (rowId: string, field: string, value: unknown, original: unknown) => void
  readOnly?: boolean
}

export const dataTableFeatures = tableFeatures({
  tableMeta: {} as DataTableMeta,
  columnVisibilityFeature,
  columnSizingFeature,
  columnPinningFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
    equalsString: filterFn_equalsString,
    arrIncludesSome: filterFn_arrIncludesSome,
  },
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
    datetime: sortFn_datetime,
    basic: sortFn_basic,
  },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
  // Detail panels only (no sub-rows), so no expanded row model is needed.
  rowExpandingFeature,
})

export type DataTableFeatures = typeof dataTableFeatures
export type DataTableInstance<TData extends RowData> = ReactTable<DataTableFeatures, TData>

/** Typed column helper bound to the shared features. Call at module scope. */
export const createDataTableColumnHelper = <TData extends RowData>() =>
  createColumnHelper<DataTableFeatures, TData>()

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TFeatures extends TableFeatures, TData extends RowData, TValue extends CellData = CellData> {
    /** Cell/header alignment. Use "right" for numbers. */
    align?: "left" | "center" | "right"
    /** Human label for menus (column toggle) when `header` isn't a string. */
    label?: string
    /** Draw a vertical divider before this column (e.g. between column groups). */
    divider?: boolean
    /** Set by `columnSection`: the collapsible section a column group belongs to. */
    section?: string
    /** Set by `columnSection`: marks the slim placeholder shown while a section is collapsed. */
    sectionStub?: { id: string; label: string }
  }
}
