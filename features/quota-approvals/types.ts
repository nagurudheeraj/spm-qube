/**
 * A director's quota for the period:
 * - pending: not yet approved for load (legacy white button)
 * - approved: approved for load (legacy green button)
 * - loaded: already loaded downstream; can't be changed here
 */
export type ApprovalStatus = "pending" | "approved" | "loaded"

export type DirectorApproval = {
  id: string
  director: string
  status: ApprovalStatus
}

export type AreaApprovals = {
  id: string
  label: string
  directors: DirectorApproval[]
}

/** Every channel's areas for one period. */
export type ApprovalsData = Record<string, AreaApprovals[]>
