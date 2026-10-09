export type EmployeeStatus = "Active" | "On leave" | "Terminated"
export type Channel = "Retail" | "Business" | "Telesales" | "Indirect"

export type Employee = {
  id: string
  name: string
  title: string
  channel: Channel
  region: string
  salesId: string
  quota: number
  attainment: number
  status: EmployeeStatus
  hireDate: string
}
