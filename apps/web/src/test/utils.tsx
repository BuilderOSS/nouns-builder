import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, renderHook, RenderOptions, waitFor } from '@testing-library/react'
import * as React from 'react'
import { SWRConfig } from 'swr'
import { expect } from 'vitest'
import { useConnect, useDisconnect, WagmiProvider } from 'wagmi'

import { config } from './wagmi'

type ProvidersProps = {
  children: React.ReactNode
}

export async function connectAs(user: 'alice' | 'bob' | 'carol') {
  const { result } = renderWagmiHook(() => useConnect())

  const connectors = result.current.connectors

  const CONNECTORS = {
    alice: connectors[0],
    bob: connectors[1],
    carol: connectors[2],
  }

  await act(async () => {
    await result.current.connectAsync({
      connector: CONNECTORS[user],
    })
  })

  await waitFor(() => {
    // Newer wagmi uses `status` instead of isSuccess
    expect(result.current.status).toBe('success')
  })
}

/**
 * Utility function to disconnect the current user
 */
export async function disconnect() {
  const { result } = renderWagmiHook(() => useDisconnect())

  await act(async () => {
    await result.current.disconnectAsync()
  })

  await waitFor(() => {
    expect(result.current.status).toBe('success')
  })
}

/**
 * Custom renderHook that wraps the hook in WagmiProvider with the test config
 */
export function renderWagmiHook<TResult, TProps>(hook: (props: TProps) => TResult) {
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    ),
  })
}

const queryClient = new QueryClient()

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: Providers, ...options })

export { customRender as render }
