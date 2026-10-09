"use client"

import { useCallback, useMemo, useState } from "react"

import type { CellEdits } from "./features"

export type EditMap = Record<string, Record<string, unknown>>

/**
 * Tracks pending inline edits as `{ [rowId]: { [field]: value } }`.
 * Pass `edits` to `useDataTable({ meta: { edits } })`; render `EditableCell`s.
 */
export function useCellEdits({ readOnly = false }: { readOnly?: boolean } = {}) {
  const [changes, setChanges] = useState<EditMap>({})

  const set = useCallback<CellEdits["set"]>((rowId, field, value, original) => {
    setChanges((prev) => {
      const row = { ...prev[rowId] }
      if (Object.is(value, original)) delete row[field]
      else row[field] = value
      const next = { ...prev }
      if (Object.keys(row).length === 0) delete next[rowId]
      else next[rowId] = row
      return next
    })
  }, [])

  const edits = useMemo<CellEdits>(
    () => ({ get: (rowId, field) => changes[rowId]?.[field], set, readOnly }),
    [changes, set, readOnly]
  )

  const count = useMemo(
    () => Object.values(changes).reduce((n, row) => n + Object.keys(row).length, 0),
    [changes]
  )

  const reset = useCallback(() => setChanges({}), [])

  return { edits, changes, count, reset }
}
