import type { Metric } from "./types"

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const num = new Intl.NumberFormat("en-US")
const compactUsd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 })

export const formatTarget = (metric: Metric, value: number) => (metric === "Sales Dollars" ? usd.format(value) : num.format(value))
export const formatCompactUsd = (value: number) => compactUsd.format(value)
export const formatNumber = (value: number) => num.format(value)
