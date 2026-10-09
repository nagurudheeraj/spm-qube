"use client"

import type { RowData } from "@tanstack/react-table"
import { Columns3, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import type { DataTableInstance } from "./features"

type TableProp<TData extends RowData> = { table: DataTableInstance<TData> }

/** Global search box bound to the table's global filter. */
export function DataTableSearch<TData extends RowData>({
  table,
  placeholder = "Search…",
  className,
}: TableProp<TData> & { placeholder?: string; className?: string }) {
  const search = (table.state.globalFilter as string | undefined) ?? ""
  return (
    <InputGroup className={cn("h-8 min-w-48 flex-1 sm:max-w-72", className)}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        value={search}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        placeholder={placeholder}
        aria-label="Search table"
      />
      {search && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => table.setGlobalFilter("")}>
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

/** "Columns" menu for showing/hiding columns. */
export function DataTableColumnsMenu<TData extends RowData>({ table }: TableProp<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <Columns3 />
        <span className="hidden sm:inline">Columns</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {table
          .getAllLeafColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
              closeOnClick={false}
            >
              {column.columnDef.meta?.label ??
                (typeof column.columnDef.header === "string" ? column.columnDef.header : column.id)}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** "N selected ×" chip; renders nothing when no rows are selected. */
export function DataTableSelection<TData extends RowData>({ table }: TableProp<TData>) {
  const selected = Object.keys(table.state.rowSelection).length
  if (!selected) return null
  return (
    <Button variant="ghost" className="text-muted-foreground" onClick={() => table.resetRowSelection(true)}>
      {selected.toLocaleString()} selected
      <X />
    </Button>
  )
}

type DataTableToolbarProps<TData extends RowData> = TableProp<TData> & {
  /** Rendered first, before the search box (e.g. a view picker). */
  leading?: React.ReactNode
  searchPlaceholder?: string
  /** Extra filters rendered right after the search box. */
  children?: React.ReactNode
  /** Context or actions rendered on the right, before the Columns menu. */
  end?: React.ReactNode
}

/** Standard toolbar: [leading] search + filters on the left; selection, extras and Columns on the right. */
export function DataTableToolbar<TData extends RowData>({
  table,
  leading,
  searchPlaceholder,
  children,
  end,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {leading}
      <DataTableSearch table={table} placeholder={searchPlaceholder} />
      {children}
      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        <DataTableSelection table={table} />
        {end}
        <DataTableColumnsMenu table={table} />
      </div>
    </div>
  )
}
