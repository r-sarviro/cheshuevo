import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { queryClient } from '@/shared/api'
import '@/shared/config'

type AppProvidersProps = {
  children: ReactNode
}

/** App-wide providers (router is mounted separately via RouterProvider). */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
