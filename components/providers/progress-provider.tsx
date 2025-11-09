"use client"

import { useEffect, useRef, useCallback } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import NProgress from "nprogress"
import { useQueryClient } from "@tanstack/react-query"

NProgress.configure({
  minimum: 0.08,
  easing: "ease-in-out",
  speed: 200,
  showSpinner: false,
})

export function ProgressProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const intervalRef = useRef<NodeJS.Timeout>()
  const progressRef = useRef(0)
  const isNavigatingRef = useRef(false)
  const queryClient = useQueryClient()

  const completeProgress = useCallback(() => {
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false
      NProgress.done()
      progressRef.current = 0

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const startProgress = useCallback(() => {
    if (isNavigatingRef.current) return

    isNavigatingRef.current = true
    NProgress.start()
    progressRef.current = 0.1

    intervalRef.current = setInterval(() => {
      if (!isNavigatingRef.current) {
        clearInterval(intervalRef.current)
        return
      }

      const queries = queryClient.getQueryCache().getAll()
      const pendingQueries = queries.filter((q) => q.state.status === "pending" && q.getObserversCount() > 0)

      if (pendingQueries.length === 0) {
        progressRef.current = Math.min(progressRef.current + 0.15, 0.95)
      } else {
        progressRef.current = Math.min(progressRef.current + 0.08, 0.85)
      }

      NProgress.set(progressRef.current)
    }, 300)

    // Timeout fallback para completar después de 8 segundos máximo
    timeoutRef.current = setTimeout(() => {
      completeProgress()
    }, 8000)
  }, [queryClient, completeProgress])

  useEffect(() => {
    startProgress()

    return () => {
      completeProgress()
    }
  }, [pathname, startProgress, completeProgress])

  useEffect(() => {
    if (!isNavigatingRef.current) return

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" || event.type === "added") {
        const query = event.query
        if (query.state.status === "success" || query.state.status === "error") {
          const queries = queryClient.getQueryCache().getAll()
          const hasPending = queries.some(
            (q) => q.state.status === "pending" && q.getObserversCount() > 0 && q.getObserversCount() > 0,
          )

          if (!hasPending && isNavigatingRef.current) {
            progressRef.current = 0.9
            NProgress.set(progressRef.current)

            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => {
              completeProgress()
            }, 200)
          }
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [queryClient, completeProgress])

  return null
}
