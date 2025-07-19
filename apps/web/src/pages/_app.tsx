import { VercelAnalytics } from '@buildeross/analytics'
import '@buildeross/zord/index.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/londrina-solid'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import type { ReactElement, ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { WagmiProvider } from 'wagmi'

import { Disclaimer } from 'src/components/Disclaimer'
import { FrameProvider } from 'src/components/FrameProvider'
import { NetworkController } from 'src/components/NetworkController'
import 'src/styles/globals.css'
import 'src/styles/styles.css'
import { clientConfig } from 'src/utils/clientConfig'

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

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  err: Error
  Component: NextPageWithLayout
}

function App({ Component, pageProps, err }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)
  const fallback = pageProps?.fallback ?? {}

  return (
    <WagmiProvider config={clientConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider appInfo={{ disclaimer: Disclaimer }}>
          <SWRConfig value={{ fallback }}>
            <NextNProgress
              color={'#008BFF'}
              startPosition={0.125}
              stopDelayMs={200}
              height={2}
              showOnShallow={false}
              options={{ showSpinner: false }}
            />
            <FrameProvider>
              {getLayout(<Component {...pageProps} err={err} />)}
            </FrameProvider>
          </SWRConfig>
          <NetworkController.Mainnet>
            <VercelAnalytics />
          </NetworkController.Mainnet>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
