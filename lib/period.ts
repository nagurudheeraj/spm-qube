/** A fiscal month. `month` is 0-based (0 = January). */
export type Period = { year: number; month: number }

export const currentPeriod = (): Period => {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() }
}

export const shiftPeriod = ({ year, month }: Period, delta: number): Period => {
  const index = year * 12 + month + delta
  return { year: Math.floor(index / 12), month: index % 12 }
}

export const comparePeriods = (a: Period, b: Period) => a.year * 12 + a.month - (b.year * 12 + b.month)

export const formatPeriod = ({ year, month }: Period, style: "long" | "short" = "long") =>
  new Date(Date.UTC(year, month, 1)).toLocaleString("en-US", { month: style, year: "numeric", timeZone: "UTC" })

export const periodKey = ({ year, month }: Period) => `${year}-${String(month + 1).padStart(2, "0")}`
