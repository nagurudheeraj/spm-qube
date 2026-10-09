/*
 * Allocate is one screen serving ~100 grids: catalog → channel → view. Each
 * view declares which filters it needs and whether its grid is built yet.
 *
 * Catalogs and channels come from the shared `config/catalogs`. TODO: replace
 * views marked `sample` with each channel's real views.
 */

import { CATALOGS } from "@/config/catalogs"

/** Filters a view can ask for. Period + scope are always shown. */
export type ViewFilter = "area" | "director"

export type AllocateViewDef = {
  id: string
  label: string
  filters: ViewFilter[]
  /** Grid implemented in this app; others show a placeholder. */
  ready?: boolean
  sample?: boolean
}

export type ChannelDef = { id: string; label: string; views: AllocateViewDef[] }
export type CatalogDef = { id: string; label: string; channels: ChannelDef[] }

const STANDARD_VIEWS: AllocateViewDef[] = [
  { id: "team-vaults", label: "Team quota vaults", filters: ["area", "director"], ready: true },
  { id: "rep-quotas", label: "Rep quotas", filters: ["area", "director"], sample: true },
  { id: "store-quotas", label: "Store quotas", filters: ["area"], sample: true },
  { id: "manager-quotas", label: "Manager quotas", filters: ["area", "director"], sample: true },
  { id: "dollar-matrix", label: "Dollar matrix", filters: ["area"], sample: true },
  { id: "roll-percent", label: "Roll %", filters: ["area", "director"], sample: true },
  { id: "attributes", label: "Attributes", filters: [], sample: true },
]

// Every channel currently offers the same views; give a channel its own list when they differ.
export const CATALOG_TREE: CatalogDef[] = CATALOGS.map((catalog) => ({
  id: catalog.id,
  label: catalog.label,
  channels: catalog.channels.map((channel) => ({ id: channel.id, label: channel.label, views: STANDARD_VIEWS })),
}))

export function findChannel(catalogId: string, channelId: string) {
  const catalog = CATALOG_TREE.find((c) => c.id === catalogId) ?? CATALOG_TREE[0]
  const channel = catalog.channels.find((c) => c.id === channelId) ?? catalog.channels[0]
  return { catalog, channel }
}

export function findView(catalogId: string, channelId: string, viewId: string) {
  const { catalog, channel } = findChannel(catalogId, channelId)
  const view = channel.views.find((v) => v.id === viewId) ?? channel.views[0]
  return { catalog, channel, view }
}
