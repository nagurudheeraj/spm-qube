import type { Metadata } from "next"

import { TrackVisit } from "@/components/common/track-visit"
import { ApprovalsView } from "@/features/quota-approvals/approvals-view"

export const metadata: Metadata = { title: "Approvals" }

export default function ApprovalsPage() {
  return (
    <>
      <TrackVisit href="/quota/approvals" />
      <ApprovalsView />
    </>
  )
}
