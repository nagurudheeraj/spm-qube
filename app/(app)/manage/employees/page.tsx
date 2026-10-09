import type { Metadata } from "next"

import { FullHeightPage } from "@/components/common/page-layout"
import { PinButton } from "@/components/common/pin-button"
import { TrackVisit } from "@/components/common/track-visit"
import { HeaderActions } from "@/components/layout/header-actions"
import { EmployeesTable } from "@/features/employees/employees-table"

const HREF = "/manage/employees"

export const metadata: Metadata = { title: "Employees" }

export default function EmployeesPage() {
  return (
    <FullHeightPage>
      <TrackVisit href={HREF} />
      <HeaderActions>
        <PinButton variant="button" href={HREF} title="Employees" />
      </HeaderActions>
      <EmployeesTable />
    </FullHeightPage>
  )
}
