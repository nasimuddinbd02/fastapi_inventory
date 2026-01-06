"use client"

import * as React from "react"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { subscribeToLoading, getLoadingState } from "@/lib/loading"

/**
 * Global loading overlay component that listens to imperative loading state.
 * This allows showing/hiding the loading overlay from anywhere in the app,
 * including outside React components (e.g., API interceptors).
 */
export function GlobalLoading() {
  const [state, setState] = React.useState(() => getLoadingState())
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    
    // Get initial state after mount
    setState(getLoadingState())
    
    // Subscribe to loading state changes
    const unsubscribe = subscribeToLoading((newState) => {
      setState({ ...newState })
    })

    return () => {
      unsubscribe()
      setIsMounted(false)
    }
  }, [])

  // Don't render until mounted on client
  if (!isMounted) return null

  return (
    <LoadingOverlay
      open={state.isLoading}
      message={state.message}
      description={state.description}
      variant={state.variant}
      spinnerSize="xl"
    />
  )
}
