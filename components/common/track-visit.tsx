"use client"

import { useEffect } from "react"

import { useAppDispatch } from "@/store/hooks"
import { visitScreen } from "@/store/slices/ui-slice"

/** Records a screen visit in the "recent" list. Renders nothing. */
export function TrackVisit({ href }: { href: string }) {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(visitScreen(href))
  }, [dispatch, href])
  return null
}
