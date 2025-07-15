
'use client';

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Set the initial state on the client
    setIsMobile(mql.matches)

    // Create a handler for media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    // Add the listener for changes
    mql.addEventListener("change", handleChange)

    // Clean up the listener on unmount
    return () => {
      mql.removeEventListener("change", handleChange)
    }
  }, [])

  return isMobile
}
