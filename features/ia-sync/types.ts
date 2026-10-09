export type IaSegment = "business" | "consumer"

/** One rep whose IA (incentive allowance) status differs between QUBE and CCRS. */
export type IaSyncRow = {
  id: string
  salesId: string
  name: string
  jobTitle: string
  channel: string
  market: string
  /** IA flag in QUBE today, and the value to sync. */
  qube: { current: boolean; sync: boolean }
  /** IA flag in CCRS today, and the value to sync. */
  ccrs: { current: boolean; sync: boolean }
  alert: string
  /** Additional details / proposed corrections, e.g. "IA 08-09". */
  proposed: string
}

export type IaSyncData = Record<IaSegment, IaSyncRow[]>

/** Edit keys used with `useCellEdits`. */
export type IaSyncField = "qube.sync" | "ccrs.sync" | "proposed"
