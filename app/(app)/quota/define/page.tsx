import type { Metadata } from "next"

import { TrackVisit } from "@/components/common/track-visit"
import { DefineView } from "@/features/quota-define/define-view"

export const metadata: Metadata = { title: "Define" }

export default function DefinePage() {
  return (
    <>
      <TrackVisit href="/quota/define" />
      <DefineView />
    </>
  )
}
