import type { ApprovalStatus } from "./types"

/** Channels in legacy tab order. TODO: load from reference data (includes Tech Sales Organization, not in config/catalogs). */
export const APPROVAL_CHANNELS = [
  { id: "business", label: "Business" },
  { id: "direct-mbo", label: "Direct MBO" },
  { id: "indirect-mbo", label: "Indirect MBO" },
  { id: "local", label: "Local" },
  { id: "public-sector", label: "Public Sector" },
  { id: "retail-smb", label: "Retail SMB" },
  { id: "tech-sales", label: "Tech Sales Organization" },
  { id: "telesales-b", label: "Telesales (B)" },
  { id: "indirect-consumer", label: "Indirect Consumer" },
  { id: "retail", label: "Retail" },
  { id: "telesales-c", label: "Telesales (C)" },
] as const

export const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  loaded: "Loaded",
}
