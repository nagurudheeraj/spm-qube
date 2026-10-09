import type { Metadata } from "next"

import { TrackVisit } from "@/components/common/track-visit"
import { PeriodsView } from "@/features/quota-periods/periods-view"

export const metadata: Metadata = { title: "Periods" }

export default function PeriodsPage() {
  return (
    <>
      <TrackVisit href="/quota/periods" />
      <PeriodsView />
    </>
  )
}
