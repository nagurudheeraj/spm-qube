"use client"

import { useRef, useState } from "react"
import type { RowData, Table } from "@tanstack/react-table"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { DataTableFeatures } from "./features"

type EditableCellProps<TData extends RowData> = {
  /** The `table` from the cell context. */
  table: Pick<Table<DataTableFeatures, TData>, "options">
  rowId: string
  /** Edit key, e.g. "notes" or "c0.target". */
  field: string
  /** Accessible name, e.g. "Target for CE 4C Dana Whitfield". Defaults to `field`. */
  label?: string
  value: string | number | null | undefined
  type?: "number" | "text"
  placeholder?: string
  /** Display formatter for numbers when not focused. */
  format?: (value: number) => string
  className?: string
}

const defaultFormat = (n: number) => n.toLocaleString("en-US")

/**
 * Inline-editable cell. Looks like plain text until hovered/focused; edited
 * cells get an amber marker. Commits on blur/Enter, reverts on Escape.
 * Edits are stored in `table.options.meta.edits` (see `useCellEdits`).
 */
export function EditableCell<TData extends RowData>({
  table,
  rowId,
  field,
  label,
  value,
  type = "text",
  placeholder,
  format = defaultFormat,
  className,
}: EditableCellProps<TData>) {
  const edits = table.options.meta?.edits
  const edited = edits?.get(rowId, field)
  const dirty = edited !== undefined
  const current = (dirty ? edited : value) as string | number | null | undefined
  const [draft, setDraft] = useState<string | null>(null)
  const cancelled = useRef(false)
  // The mouseup that ends a focusing click would place the caret and undo select-all.
  const keepSelection = useRef(false)

  const display =
    current === null || current === undefined || current === ""
      ? ""
      : type === "number" && typeof current === "number"
        ? format(current)
        : String(current)

  if (!edits || edits.readOnly) {
    return (
      <span
        className={cn(
          "block truncate px-2",
          type === "number" && "text-right tabular-nums",
          !display && "text-muted-foreground/60",
          className
        )}
      >
        {display || placeholder}
      </span>
    )
  }

  const commit = () => {
    if (draft === null) return
    if (cancelled.current) {
      cancelled.current = false
    } else if (type === "number") {
      const parsed = Number(draft.replace(/[^0-9.-]/g, ""))
      if (draft.trim() !== "" && Number.isFinite(parsed)) edits.set(rowId, field, parsed, value)
    } else {
      edits.set(rowId, field, draft, value ?? "")
    }
    setDraft(null)
  }

  return (
    <div className="relative w-full" onClick={(e) => e.stopPropagation()}>
      <Input
        value={draft ?? display}
        placeholder={placeholder}
        inputMode={type === "number" ? "decimal" : undefined}
        aria-label={label ?? field}
        onFocus={(e) => {
          setDraft(current === null || current === undefined ? "" : String(current))
          keepSelection.current = true
          // Select after React swaps the formatted value for the raw draft.
          requestAnimationFrame(() => e.target.select())
        }}
        onMouseUp={(e) => {
          if (keepSelection.current) e.preventDefault()
          keepSelection.current = false
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur()
          if (e.key === "Escape") {
            cancelled.current = true
            e.currentTarget.blur()
          }
        }}
        // shadcn Input, styled to read as plain text until hovered or focused.
        className={cn(
          "h-7 rounded-md border-transparent bg-transparent px-2 text-[13px] shadow-none placeholder:text-muted-foreground/50 md:text-[13px] dark:bg-transparent",
          "hover:border-input focus-visible:bg-background",
          type === "number" && "text-right tabular-nums",
          dirty && "bg-amber-500/10 text-amber-900 dark:text-amber-200",
          className
        )}
      />
      {dirty && draft === null && (
        <span aria-hidden className="pointer-events-none absolute top-1 right-1 size-1.5 rounded-full bg-amber-500" />
      )}
    </div>
  )
}
