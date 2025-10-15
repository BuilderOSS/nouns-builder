import {
  ChainStoreProvider,
  createChainStore,
  createDaoStore,
  DaoContractAddresses,
  DaoStoreProvider,
} from '@buildeross/stores'
import { Chain } from '@buildeross/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  render,
  renderHook,
  RenderOptions,
  RenderResult,
  waitFor,
} from '@testing-library/react'
import * as React from 'react'
import { SWRConfig } from 'swr'
import { expect } from 'vitest'
import { useConnect, useDisconnect, WagmiProvider } from 'wagmi'

import { config } from './wagmi'

type ProvidersProps = {
  children: React.ReactNode | React.ReactElement
  chain?: Chain
  addresses?: DaoContractAddresses
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
export function renderWagmiHook<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: { chain?: Chain; addresses?: DaoContractAddresses }
) {
  const { chain, addresses } = options || {}

  return renderHook(hook, {
    wrapper: ({ children }) => (
      <Providers chain={chain} addresses={addresses}>
        {children}
      </Providers>
    ),
  })
}

const queryClient = new QueryClient()

export function Providers({ children, chain, addresses }: ProvidersProps) {
  const chainStore = React.useMemo(() => createChainStore(chain), [chain])
  const daoStore = React.useMemo(() => createDaoStore(addresses), [addresses])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ChainStoreProvider store={chainStore}>
          <DaoStoreProvider store={daoStore}>
            <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
          </DaoStoreProvider>
        </ChainStoreProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

type CustomRenderOptions = RenderOptions & {
  chain?: Chain
  addresses?: DaoContractAddresses
}

const customRender = (
  ui: React.ReactElement,
  options?: CustomRenderOptions
): RenderResult => {
  const { chain, addresses, ...renderOptions } = options || {}

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Providers chain={chain} addresses={addresses}>
      {children}
    </Providers>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export { customRender as render }
