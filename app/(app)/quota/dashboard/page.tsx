import type { Metadata } from "next"

import { TrackVisit } from "@/components/common/track-visit"
import { DashboardView } from "@/features/quota-dashboard/dashboard-view"

export const metadata: Metadata = { title: "Dashboard" }

export default function DashboardPage() {
  return (
    <>
      <TrackVisit href="/quota/dashboard" />
      <DashboardView />
    </>
  )
}
