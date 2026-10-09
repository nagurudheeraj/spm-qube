import type { ColumnDef, ColumnVisibilityState as VisibilityState, RowData, Table } from "@tanstack/react-table"

import type { DataTableFeatures } from "./features"

/*
 * Collapsible column sections: a run of column groups (e.g. Component 1–3)
 * that the user can fold away from the group header row. Each section is
 * independent, so a grid can have several. While collapsed, a slim
 * placeholder column keeps the section discoverable and holds the expand
 * button. Implemented purely with column visibility, so it composes with
 * the Columns menu and pinning.
 */

type AnyColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData, any> // eslint-disable-line @typescript-eslint/no-explicit-any
type AnyTable<TData extends RowData> = Pick<Table<DataTableFeatures, TData>, "getAllColumns" | "setColumnVisibility">

export const sectionStubId = (sectionId: string) => `${sectionId}__collapsed`

/** Wraps column groups into a collapsible section. Spread the result into your columns. */
export function columnSection<TData extends RowData>({
  id,
  label,
  columns,
}: {
  id: string
  label: string
  columns: AnyColumnDef<TData>[]
}): AnyColumnDef<TData>[] {
  const stub: AnyColumnDef<TData> = {
    id: sectionStubId(id),
    header: () => null,
    cell: () => null,
    size: 128,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    meta: { sectionStub: { id, label }, divider: true },
  }
  return [stub, ...columns.map((c) => ({ ...c, meta: { ...c.meta, section: id } }))]
}

/** Placeholders start hidden; merge into `initialState.columnVisibility`. */
export function sectionStubVisibility<TData extends RowData>(columns: readonly AnyColumnDef<TData>[]): VisibilityState {
  return Object.fromEntries(
    columns.flatMap((c) => (c.meta?.sectionStub ? [[sectionStubId(c.meta.sectionStub.id), false]] : []))
  )
}

export function isSectionCollapsed(visibility: VisibilityState, sectionId: string) {
  return visibility[sectionStubId(sectionId)] !== false
}

export function toggleSection<TData extends RowData>(table: AnyTable<TData>, visibility: VisibilityState, sectionId: string) {
  const collapse = !isSectionCollapsed(visibility, sectionId)
  const leafIds = table
    .getAllColumns()
    .filter((c) => c.columnDef.meta?.section === sectionId)
    .flatMap((c) => c.getLeafColumns().map((leaf) => leaf.id))

  table.setColumnVisibility((prev) => ({
    ...prev,
    [sectionStubId(sectionId)]: collapse,
    ...Object.fromEntries(leafIds.map((leafId) => [leafId, !collapse])),
  }))
}
