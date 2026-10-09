"use client"

import { useQuery } from "@tanstack/react-query"

import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  useDataTable,
  type DataTableInstance,
} from "@/components/data-table"
import { FilterSelect } from "@/components/common/filter-select"
import { employeesQueryOptions } from "./api"
import { employeeColumns } from "./columns"
import type { Employee } from "./types"

// Stable fallback: a new [] each render would rebuild every row model.
const EMPTY: Employee[] = []

export function EmployeesTable() {
  const { data, isPending, isFetching } = useQuery(employeesQueryOptions())

  const table = useDataTable({
    columns: employeeColumns,
    rowControl: "select",
    data: data ?? EMPTY,
    getRowId: (row) => row.id,
    initialState: { sorting: [{ id: "name", desc: false }] },
  })

  return (
    <>
      <DataTableToolbar table={table} searchPlaceholder="Search name, ID, title, region…">
        <ColumnSelectFilter table={table} columnId="channel" label="Channel" options={["Retail", "Business", "Telesales", "Indirect"]} />
        <ColumnSelectFilter table={table} columnId="status" label="Status" options={["Active", "On leave", "Terminated"]} />
      </DataTableToolbar>
      <DataTable fill table={table} isLoading={isPending} isFetching={isFetching} emptyMessage="No employees match your filters." />
      <DataTablePagination table={table} />
    </>
  )
}

const ALL = "all"

/** Filters one column by exact value; "All" clears the filter. */
function ColumnSelectFilter({
  table,
  columnId,
  label,
  options,
}: {
  table: DataTableInstance<Employee>
  columnId: keyof Employee
  label: string
  options: string[]
}) {
  const value = (table.state.columnFilters.find((f) => f.id === columnId)?.value as string | undefined) ?? ALL

  return (
    <FilterSelect
      label={label}
      value={value}
      options={[{ value: ALL, label: "All" }, ...options.map((o) => ({ value: o, label: o }))]}
      onChange={(v) => table.getColumn(columnId)?.setFilterValue(v === ALL ? undefined : v)}
    />
  )
}
