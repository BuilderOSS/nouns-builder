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
import { useSafeAuth } from '@buildeross/hooks'
import { AuthStatusContext } from '@buildeross/stores'
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
import {
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Disclaimer } from 'src/components/Disclaimer'
import { FrameProvider } from 'src/components/FrameProvider'
import { LinksProvider } from 'src/components/LinksProvider'
import { AppThemeProvider } from 'src/theme/AppThemeProvider'
import { clientConfig } from 'src/utils/clientConfig'
import { SWRConfig } from 'swr'
import { createSiweMessage, parseSiweMessage, type SiweMessage } from 'viem/siwe'
import { useConfig, WagmiProvider } from 'wagmi'

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

  const fetchingStatusRef = useRef(false)
  const verifyingRef = useRef(false)
  const authenticatedAddressRef = useRef<string | undefined>(undefined)
  const authenticatedConnectorUidRef = useRef<string | undefined>(undefined)
  const [rainbowKitAuthStatus, setRainbowKitAuthStatus] =
    useState<AuthenticationStatus>('unauthenticated')
  const { state: safeState, clearSafe } = useSafeAuth()
  const config = useConfig()

  // Simple session verification (RainbowKit pattern)
  useEffect(() => {
    const verifySession = async () => {
      if (fetchingStatusRef.current || verifyingRef.current) {
        return
      }

      fetchingStatusRef.current = true

      try {
        const response = await fetch('/api/siwe/me')
        const json = await response.json()

        // Get current wagmi account
        const currentAccount = config.state.current
          ? config.state.connections.get(config.state.current)?.accounts?.[0]
          : undefined
        const currentConnectorUid = config.state.current
          ? config.state.connections.get(config.state.current)?.connector.uid
          : undefined

        // Authenticated if:
        // 1. Session has an address
        // 2. That address matches the current wagmi account (or no account connected)
        const newStatus =
          json.address && (!currentAccount || json.address === currentAccount)
            ? 'authenticated'
            : 'unauthenticated'

        setRainbowKitAuthStatus(newStatus)
        if (newStatus === 'authenticated') {
          authenticatedAddressRef.current = json.address
          authenticatedConnectorUidRef.current = currentConnectorUid
        } else {
          authenticatedAddressRef.current = undefined
          authenticatedConnectorUidRef.current = undefined
        }
      } catch (_error) {
        console.log('error in verifySession', _error)
        setRainbowKitAuthStatus('unauthenticated')
        authenticatedAddressRef.current = undefined
        authenticatedConnectorUidRef.current = undefined
      } finally {
        fetchingStatusRef.current = false
      }
    }

    // Verify on mount
    verifySession()

    // Verify on window focus (in case user logs out of another window)
    window.addEventListener('focus', verifySession)
    return () => window.removeEventListener('focus', verifySession)
  }, [config])

  // Cross-tab synchronization: detect when another tab clears wagmi storage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Check if wagmi storage was cleared in another tab
      if (e.key?.startsWith('wagmi.') && e.newValue === null) {
        // Another tab disconnected - sync wagmi state immediately
        config.setState((x) => ({
          ...x,
          connections: new Map(),
          current: null,
          status: 'disconnected',
        }))
        console.log('clearing storage')
        // Also clear auth status
        setRainbowKitAuthStatus('unauthenticated')
        authenticatedAddressRef.current = undefined
        authenticatedConnectorUidRef.current = undefined
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [config])

  const authAdapter = useMemo(() => {
    return createAuthenticationAdapter({
      getNonce: async () => {
        const response = await fetch('/api/siwe/nonce')
        const nonce = await response.text()
        return nonce
      },

      createMessage: ({ nonce, address, chainId: msgChainId }) => {
        const message = createSiweMessage({
          domain: window.location.host,
          address,
          statement: safeState.safeAddress
            ? `Sign in as owner for Safe ${safeState.safeAddress}`
            : 'Sign in with Ethereum to Nouns Builder',
          uri: window.location.origin,
          version: '1',
          chainId: msgChainId,
          nonce,
        })
        return message
      },

      verify: async ({ message, signature }) => {
        verifyingRef.current = true

        try {
          const response = await fetch('/api/siwe/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message,
              signature,
              safeAddress: safeState.safeAddress,
              safeChainId: safeState.chainId,
            }),
          })

          const body = (await response.json()) as { ok?: boolean }
          const authenticated = response.ok && body.ok === true

          if (authenticated) {
            const siweMessage = parseSiweMessage(message) as SiweMessage
            const currentConnectorUid = config.state.current
              ? config.state.connections.get(config.state.current)?.connector.uid
              : undefined

            authenticatedAddressRef.current = siweMessage.address
            authenticatedConnectorUidRef.current = currentConnectorUid
            setRainbowKitAuthStatus('authenticated')
          } else {
            authenticatedAddressRef.current = undefined
            authenticatedConnectorUidRef.current = undefined
          }

          return authenticated
        } catch (error) {
          console.error('[Auth] Error verifying signature', error)
          return false
        } finally {
          verifyingRef.current = false
        }
      },

      signOut: async () => {
        const currentAddress = config.state.current
          ? config.state.connections.get(config.state.current)?.accounts?.[0]
          : undefined
        const currentConnector = config.state.current
          ? config.state.connections.get(config.state.current)
          : undefined

        if (
          currentAddress?.toLowerCase() ===
            authenticatedAddressRef.current?.toLowerCase() &&
          currentConnector?.connector.uid !== authenticatedConnectorUidRef.current
        ) {
          return
        }

        console.log('signing out')
        setRainbowKitAuthStatus('unauthenticated')
        clearSafe()
        await fetch('/api/siwe/logout', { method: 'POST' })
        authenticatedAddressRef.current = undefined
        authenticatedConnectorUidRef.current = undefined
      },
    })
  }, [
    setRainbowKitAuthStatus,
    safeState.safeAddress,
    safeState.chainId,
    clearSafe,
    config,
  ])

  console.log({ rainbowKitAuthStatus })

  return (
    <AuthStatusContext.Provider value={rainbowKitAuthStatus}>
      <RainbowKitAuthenticationProvider
        adapter={authAdapter}
        status={rainbowKitAuthStatus}
      >
        <RainbowKitProvider appInfo={{ disclaimer: Disclaimer }} modalSize="compact">
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
    </AuthStatusContext.Provider>
  )
}

function App(props: AppPropsWithLayout) {
  return (
    <WagmiProvider config={clientConfig}>
      <QueryClientProvider client={queryClient}>
        <AppContent {...props} />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
