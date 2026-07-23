import '@buildeross/zord/index.css'
import '@buildeross/ui/index.css'
import '@buildeross/auction-ui/index.css'
import '@buildeross/proposal-ui/index.css'
import '@buildeross/candidate-ui/index.css'
import '@buildeross/dao-ui/index.css'
import '@buildeross/feed-ui/index.css'
import '@buildeross/create-proposal-ui/index.css'
import '@buildeross/create-dao-ui/index.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/londrina-solid'
import '@rainbow-me/rainbowkit/styles.css'
import 'src/styles/globals.css'
import 'src/styles/styles.css'
import 'flatpickr/dist/flatpickr.css'
import 'src/styles/flatpickr-theme.css'
import 'react-mde/lib/styles/css/react-mde-all.css'
import 'src/styles/react-mde-theme.css'

import { VercelAnalytics } from '@buildeross/analytics'
import { AuthStoreProvider, getAuthStore } from '@buildeross/stores'
import { LinkComponentProvider } from '@buildeross/ui/LinkComponentProvider'
import { NetworkController } from '@buildeross/ui/NetworkController'
import { vars } from '@buildeross/zord'
import {
  type AuthenticationStatus,
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import NextNProgress from 'nextjs-progressbar'
import { type ReactElement, type ReactNode, useMemo, useRef, useState } from 'react'
import { Disclaimer } from 'src/components/Disclaimer'
import { FrameProvider } from 'src/components/FrameProvider'
import { LinksProvider } from 'src/components/LinksProvider'
import { useWagmiAuthSync } from 'src/hooks/useWagmiAuthSync'
import { AppThemeProvider } from 'src/theme/AppThemeProvider'
import { clientConfig } from 'src/utils/clientConfig'
import { SWRConfig } from 'swr'
import { createSiweMessage } from 'viem/siwe'
import { WagmiProvider } from 'wagmi'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      staleTime: 5000,
    },
  },
})

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement<P>) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  err: Error
  Component: NextPageWithLayout
}

function AppContent({ Component, pageProps, err }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)
  const fallback = pageProps?.fallback ?? {}

  const verifyingRef = useRef(false)
  const [rainbowKitAuthStatus, setRainbowKitAuthStatus] =
    useState<AuthenticationStatus>('loading')

  // Single hook handles all wagmi <-> AuthStore synchronization
  useWagmiAuthSync(rainbowKitAuthStatus, setRainbowKitAuthStatus)

  const authAdapter = useMemo(() => {
    return createAuthenticationAdapter({
      getNonce: async () => {
        const response = await fetch('/api/siwe/nonce')
        return await response.text()
      },

      createMessage: ({ nonce, address, chainId }) => {
        return createSiweMessage({
          domain: window.location.host,
          address,
          statement: 'Sign in with Ethereum to Nouns Builder',
          uri: window.location.origin,
          version: '1',
          chainId,
          nonce,
        })
      },

      verify: async ({ message, signature }) => {
        verifyingRef.current = true

        // Access store directly to avoid hooks in useMemo
        const { setAuthenticating } = getAuthStore().getState()
        setAuthenticating(true)

        try {
          const response = await fetch('/api/siwe/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, signature }),
          })

          const body = (await response.json()) as { ok?: boolean }
          const authenticated = response.ok && body.ok === true

          if (authenticated) {
            setRainbowKitAuthStatus('authenticated')
          } else {
            setAuthenticating(false)
          }

          return authenticated
        } catch (error) {
          console.error('Error verifying signature', error)
          setAuthenticating(false)
          return false
        } finally {
          verifyingRef.current = false
        }
      },

      signOut: async () => {
        setRainbowKitAuthStatus('unauthenticated')

        // Access store directly to avoid hooks in useMemo
        const { reset } = getAuthStore().getState()
        reset()

        await fetch('/api/siwe/logout')
      },
    })
  }, [setRainbowKitAuthStatus])

  return (
    <RainbowKitAuthenticationProvider adapter={authAdapter} status={rainbowKitAuthStatus}>
      <RainbowKitProvider appInfo={{ disclaimer: Disclaimer }}>
        <SWRConfig value={{ fallback }}>
          <NextNProgress
            color={vars.color.primary}
            startPosition={0.125}
            stopDelayMs={200}
            height={2}
            showOnShallow={false}
            options={{ showSpinner: false }}
          />
          <FrameProvider>
            <AppThemeProvider>
              <LinksProvider>
                <LinkComponentProvider LinkComponent={Link}>
                  {getLayout(<Component {...pageProps} err={err} />)}
                </LinkComponentProvider>
              </LinksProvider>
            </AppThemeProvider>
          </FrameProvider>
        </SWRConfig>
        <NetworkController.Mainnet>
          <VercelAnalytics />
        </NetworkController.Mainnet>
      </RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  )
}

function App(props: AppPropsWithLayout) {
  return (
    <WagmiProvider config={clientConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthStoreProvider>
          <AppContent {...props} />
        </AuthStoreProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
