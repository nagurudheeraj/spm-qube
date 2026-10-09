export type SearchFor = "employee" | "store" | "agent" | "planner"

/** What the user is searching with; submitted as a whole when they press Search. */
export type FindCriteria = {
  searchFor: SearchFor
  searchBy: string[]
  term: string
  exact: boolean
  /** "all", "direct" or "indirect". Channel/market only apply to a specific catalog. */
  catalog: string
  /** Channel id or "all"; only used when a catalog is chosen. */
  channel: string
  /** Market id or "all"; only used when a channel is chosen. */
  market: string
  locale: string
  year: number
  periods: number[]
  relief: boolean
  adjustments: boolean
}

/** One employee/period match. */
export type EmployeeResult = {
  id: string
  period: string
  /** Has a quota assignment for the period (legacy green check). */
  assigned: boolean
  eid: string
  hrNumber: string
  salesId: string
  /** Real sales ID behind a temporary one, when different. */
  realSalesId: string
  name: string
  title: string
  plan: string
  locale: string
  atRisk: number
  gross: number
  net: number
  sales: number
  director: string
  rollsTo: string
}

export type FindPage = { rows: EmployeeResult[]; total: number }
