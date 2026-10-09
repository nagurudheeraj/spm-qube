import type { Metadata } from "next"

import { TrackVisit } from "@/components/common/track-visit"
import { FindView } from "@/features/quota-find/find-view"

export const metadata: Metadata = { title: "Find" }

export default function FindPage() {
  return (
    <>
      <TrackVisit href="/quota/find" />
      <FindView />
    </>
  )
}
