import '@buildeross/zord/index.css'
import '@buildeross/ui/index.css'
import '@buildeross/auction-ui/index.css'
import '@buildeross/proposal-ui/index.css'
import '@buildeross/dao-ui/index.css'
import '@buildeross/create-proposal-ui/index.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/londrina-solid'
import '@rainbow-me/rainbowkit/styles.css'
import '@/styles/globals.css'
import '@/styles/styles.css'
import 'flatpickr/dist/themes/light.css'
import 'react-mde/lib/styles/css/react-mde-all.css'

import {
  ChainStoreProvider,
  createChainStore,
  createDaoStore,
  DaoStoreProvider,
} from '@buildeross/stores'
import { ConnectModalProvider } from '@buildeross/ui/ConnectModalProvider'
import { LinkComponentProvider } from '@buildeross/ui/LinkComponentProvider'
import { RainbowKitProvider, useConnectModal } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import { useMemo } from 'react'
import { SWRConfig } from 'swr'
import { WagmiProvider } from 'wagmi'

import { Layout } from '@/components/Layout'
import { LinksProvider } from '@/components/LinksProvider'
import { getDaoConfig } from '@/config'
import { config } from '@/utils/clientConfig'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      staleTime: 5000,
      refetchInterval: 5000,
    },
  },
})

type AppPropsWithLayout = AppProps & {
  err?: Error
}

// Provider component that includes DAO and Chain stores
function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  const { openConnectModal } = useConnectModal()

  // Get the DAO configuration
  const daoConfig = getDaoConfig()

  // Create stores
  const chainStore = useMemo(() => createChainStore(daoConfig.chain), [daoConfig.chain])
  const daoStore = useMemo(
    () => createDaoStore(daoConfig.addresses),
    [daoConfig?.addresses]
  )

  return (
    <ConnectModalProvider value={{ openConnectModal }}>
      <ChainStoreProvider store={chainStore}>
        <DaoStoreProvider store={daoStore}>{children}</DaoStoreProvider>
      </ChainStoreProvider>
    </ConnectModalProvider>
  )
}

function App({ Component, pageProps, err }: AppPropsWithLayout) {
  const fallback = pageProps?.fallback ?? {}

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ProvidersWrapper>
            <SWRConfig value={{ fallback }}>
              <LinksProvider>
                <LinkComponentProvider LinkComponent={Link}>
                  <Layout>
                    <Component {...pageProps} err={err} />
                  </Layout>
                </LinkComponentProvider>
              </LinksProvider>
            </SWRConfig>
          </ProvidersWrapper>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
