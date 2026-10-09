import type { Metadata } from "next"

import { TrackVisit } from "@/components/common/track-visit"
import { AdjustmentsView } from "@/features/quota-adjustments/adjustments-view"

export const metadata: Metadata = { title: "Adjustments" }

export default function AdjustmentsPage() {
  return (
    <>
      <TrackVisit href="/quota/adjustments" />
      <AdjustmentsView />
    </>
  )
}
