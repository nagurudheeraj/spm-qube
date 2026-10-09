# QUBE — Quota Business Environment

Redesigned QUBE front end. Next.js 16 (App Router, Cache Components), Tailwind CSS v4, shadcn/ui (Base UI), Redux Toolkit, TanStack Query, TanStack Table v9 + Virtual.

```bash
npm run dev
```

## Structure

```
app/
  (app)/layout.tsx                 App shell (sidebar + header + ⌘K)
  (app)/page.tsx                   Home: modules, pinned, recent
  (app)/[module]/page.tsx          Module overview (Quota, Manage, …)
  (app)/[module]/[...screen]/      Any screen, including nested ones
config/
  navigation.ts                    Single source of truth for modules & screens
  app.ts                           Env, version, (mock) user
components/
  ui/                              shadcn primitives — don't edit for app logic
  common/                          Reusable app building blocks
  layout/                          Shell: sidebar, header, breadcrumbs, command menu
components/data-table/             Reusable virtualized data table (TanStack Table)
features/<domain>/                 Per-domain API (query options), columns, tables
lib/query/                         QueryClient defaults
store/                             Redux Toolkit store + slices (UI state only)
providers/                         Theme, Redux, Tooltip providers
hooks/
```

## Adding a screen

1. Add an entry under the right module in `config/navigation.ts`. Sidebar, breadcrumbs, ⌘K search and module pages pick it up automatically.
2. To replace the placeholder with a real screen, add a static route, e.g. `app/(app)/quota/allocate/page.tsx`. It takes priority over the catch-all route.

## Reusable components (`components/common`)

| Component | Purpose |
| --- | --- |
| `PageHeader` | Title, description, actions |
| `Section` | Titled content block |
| `ScreenCard` / `ModuleCard` | Navigation cards |
| `ScreenList` | Compact row list of screens |
| `IconTile` | Bordered icon container |
| `PlaceholderScreen` | Empty state for screens that aren't built yet |
| `PageSkeleton` | Loading state |
| `PinButton`, `ScreenShortcuts`, `TrackVisit` | Pinned and recent screens (Redux) |
| `BrandMark` | Logo |

## Data & tables

- **TanStack Query** owns server data. **Redux** holds client UI state only (pinned/recent screens, palette).
- Each domain lives in `features/<domain>/`: `api.ts` (query keys + `queryOptions`), `columns.tsx`, `*-table.tsx`.
  See `features/employees/` (Manage → Employees, 25k mock rows).
- Tables use `useDataTable` + `<DataTable>` from `components/data-table`:
  - Only visible rows are rendered (TanStack Virtual), so 1,000-row pages stay smooth.
  - Built in: sorting (shift-click for multi-sort), global search, column filters, column visibility, row selection, pagination.
  - Define `columns` and fallback data (`const EMPTY = []`) at module scope — TanStack Table v9 needs stable inputs.
  - Use `meta: { align: "right" }` for numeric columns and `meta: { label }` for the column menu.
  - Leading row control: `useDataTable({ rowControl: "select" })` for checkboxes, or `"expand"` for an accordion
    with `<DataTable renderExpanded={(row) => …} />`. Add new kinds in `components/data-table/row-controls.tsx`.
  - Collapsible column sections: wrap column groups in `columnSection({ id, label, columns })`.
- **Server-side** paging/sorting/filtering: pass `manualPagination`, `manualSorting`, `manualFiltering` and `rowCount` to
  `useDataTable`, control that state, and include it in the query key.
