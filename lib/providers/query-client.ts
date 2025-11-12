import { QueryClient } from "@tanstack/react-query"

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 15,
        gcTime: 1000 * 60 * 60,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false,
      },
      mutations: {
        retry: 1,
      },
    },
  })
}

let clientSingleton: QueryClient | undefined

export const getQueryClient = () => {
  if (typeof window === "undefined") {
    return createQueryClient()
  }

  if (!clientSingleton) {
    clientSingleton = createQueryClient()
    hydrateClientFromStorage(clientSingleton)
  }

  return clientSingleton
}

function hydrateClientFromStorage(queryClient: QueryClient) {
  if (typeof window === "undefined") return

  try {
    const cached = window.localStorage.getItem("vern_cache")
    if (cached) {
      const data = JSON.parse(cached)
      const now = Date.now()

      // Only hydrate data less than 24 hours old
      if (data.timestamp && now - data.timestamp < 1000 * 60 * 60 * 24) {
        Object.entries(data.queries || {}).forEach(([key, value]: [string, any]) => {
          queryClient.setQueryData(JSON.parse(key), value)
        })
      } else {
        window.localStorage.removeItem("vern_cache")
      }
    }
  } catch (error) {
    console.error("Error hydrating cache from storage:", error)
  }
}

// Persist successful queries to localStorage
export function persistCacheToStorage(queryClient: QueryClient) {
  if (typeof window === "undefined") return

  try {
    const cache = queryClient.getQueryCache()
    const queries: Record<string, any> = {}

    cache.getAll().forEach((query) => {
      // Only cache successful queries
      if (query.state.status === "success" && query.state.data) {
        queries[JSON.stringify(query.queryKey)] = query.state.data
      }
    })

    window.localStorage.setItem(
      "vern_cache",
      JSON.stringify({
        queries,
        timestamp: Date.now(),
      }),
    )
  } catch (error) {
    console.error("Error persisting cache to storage:", error)
  }
}
