import { QueryClient } from "@tanstack/react-query"

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
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
  }

  return clientSingleton
}
