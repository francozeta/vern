import { QueryClient } from "@tanstack/react-query"

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // Default 5 min
        gcTime: 1000 * 60 * 30, // Cache for 30 min
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true, // Refetch when connection restored
        refetchOnMount: true, // Refetch when component mounts
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
  }

  return clientSingleton
}
