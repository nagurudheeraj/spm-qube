import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/**
 * `false` during SSR and hydration, `true` afterwards. Use to gate UI that
 * depends on client-only state (e.g. preferences restored from localStorage).
 */
export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
