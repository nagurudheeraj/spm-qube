/**
 * Catalog → channel → market reference data, shared by every quota screen.
 * Catalogs and channels are the real lists.
 * TODO: markets are placeholders — replace with each channel's real markets
 * (ideally loaded from the reference-data API).
 */

export type ChannelRef = { id: string; label: string; markets: { id: string; label: string }[] }
export type CatalogRef = { id: "direct" | "indirect"; label: string; channels: ChannelRef[] }

const markets = (...labels: string[]) =>
  labels.map((label) => ({ id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label }))

const DIRECT_MARKETS = markets("Northeast", "Southeast", "Central", "South", "West", "Pacific")
const INDIRECT_MARKETS = markets("National", "East", "Central", "West")

export const CATALOGS: CatalogRef[] = [
  {
    id: "direct",
    label: "Direct",
    channels: [
      { id: "business", label: "Business", markets: DIRECT_MARKETS },
      { id: "direct-mbo", label: "Direct MBO", markets: DIRECT_MARKETS },
      { id: "public-sector", label: "Public Sector", markets: markets("Federal", "State & Local", "Education") },
      { id: "retail", label: "Retail", markets: DIRECT_MARKETS },
      { id: "retail-smb", label: "Retail SMB", markets: DIRECT_MARKETS },
      { id: "telesales-b", label: "Telesales (B)", markets: markets("Inbound", "Outbound") },
      { id: "telesales-c", label: "Telesales (C)", markets: markets("Inbound", "Outbound") },
    ],
  },
  {
    id: "indirect",
    label: "Indirect",
    channels: [
      { id: "indirect-consumer", label: "Indirect Consumer", markets: INDIRECT_MARKETS },
      { id: "indirect-mbo", label: "Indirect MBO", markets: INDIRECT_MARKETS },
      { id: "local", label: "Local", markets: INDIRECT_MARKETS },
    ],
  },
]

export const findCatalog = (id: string) => CATALOGS.find((c) => c.id === id)
export const findChannelRef = (catalogId: string, channelId: string) =>
  findCatalog(catalogId)?.channels.find((c) => c.id === channelId)
