import type { Metadata } from "next"

import { TrackVisit } from "@/components/common/track-visit"
import { AllocateView } from "@/features/quota-allocate/allocate-view"

export const metadata: Metadata = { title: "Allocate" }

export default function AllocatePage() {
  return (
    <>
      <TrackVisit href="/quota/allocate" />
      <AllocateView />
    </>
  )
}
