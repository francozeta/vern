"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import NProgress from "nprogress"

NProgress.configure({
  minimum: 0.08,
  easing: "ease",
  speed: 500,
  showSpinner: false,
})

export function ProgressProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.start()

    // Complete progress after a short delay
    const timeout = setTimeout(() => {
      NProgress.done()
    }, 300)

    return () => clearTimeout(timeout)
  }, [pathname, searchParams])

  return null
}
