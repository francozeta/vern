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

    const timeout = setTimeout(() => {
      NProgress.done()
    }, 1000)

    return () => clearTimeout(timeout)
  }, [pathname, searchParams])

  return null
}
