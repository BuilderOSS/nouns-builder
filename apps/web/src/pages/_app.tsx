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

// Enable XState visualizer in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  import('@xstate/inspect').then(({ inspect }) => {
    inspect({
      iframe: false, // Use the browser extension instead
    })
  })
}
import { useSafeAuth } from '@buildeross/hooks'
import { AuthStatusContext, SessionContext } from '@buildeross/stores'
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
import { useMachine } from '@xstate/react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import NextNProgress from 'nextjs-progressbar'
import * as React from 'react'
import { type ReactElement, type ReactNode, useEffect } from 'react'
import { Disclaimer } from 'src/components/Disclaimer'
import { ErrorBoundary } from 'src/components/ErrorBoundary'
import { FrameProvider } from 'src/components/FrameProvider'
import { LinksProvider } from 'src/components/LinksProvider'
import { useAppDisconnect } from 'src/hooks/useAppDisconnect'
import { useSession } from 'src/hooks/useSession'
import { sessionMachine } from 'src/machines/sessionMachine'
import { AppThemeProvider } from 'src/theme/AppThemeProvider'
import { clientConfig } from 'src/utils/clientConfig'
import { debugSession } from 'src/utils/debug'
import {
  beginSiweLogout,
  cancelSiweAuthFlow,
  isSiweLogoutInProgress,
  markSiweAuthVerified,
  shouldSuppressSiweLogout,
  SIWE_LOGOUT_EVENT,
  SIWE_LOGOUT_IN_PROGRESS_KEY,
  SIWE_NONCE_PATH,
  SIWE_REFRESH_EVENT,
  SIWE_VERIFY_PATH,
} from 'src/utils/siweAuthFlow'
import { SWRConfig } from 'swr'
import { createSiweMessage } from 'viem/siwe'
import { useConfig, WagmiProvider } from 'wagmi'

// Cross-tab storage event debounce interval
const CROSS_TAB_DEBOUNCE_MS = 100

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

  const { state: safeState, clearSafe } = useSafeAuth()
  const resetApp = useAppDisconnect()
  const config = useConfig()
  const logoutInProgress = isSiweLogoutInProgress()

  // Use ref to always get latest safeState in auth adapter callbacks
  const safeStateRef = React.useRef(safeState)
  React.useEffect(() => {
    safeStateRef.current = safeState
  }, [safeState])

  // Session management with XState machine
  const [sessionState, sendSession] = useMachine(sessionMachine)

  // Session data with SWR (auto-refresh, deduplication, focus revalidation)
  const { session, refresh } = useSession()

  // Sync SWR session data with XState machine
  useEffect(() => {
    if (logoutInProgress) {
      return
    }

    // Don't sync session data if we're in the middle of logging out
    // This prevents race conditions where SWR revalidation overrides logout
    if (sessionState.matches('loggingOut')) {
      return
    }

    if (session?.address || session?.safeAddress) {
      sendSession({ type: 'SESSION_FOUND', data: session })
    } else if (sessionState.matches('authenticated')) {
      sendSession({ type: 'SESSION_NOT_FOUND' })
    }
  }, [session, sessionState, sendSession, logoutInProgress])

  useEffect(() => {
    const handleLogout = () => {
      debugSession('Logout event received')
      beginSiweLogout()
      sendSession({ type: 'LOGOUT' })
    }

    window.addEventListener(SIWE_LOGOUT_EVENT, handleLogout)
    return () => window.removeEventListener(SIWE_LOGOUT_EVENT, handleLogout)
  }, [sendSession])

  // Cross-tab storage sync with debouncing
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null

    const handleStorage = (e: StorageEvent) => {
      // Logout flag changes are used to re-enable refresh after logout
      if (e.key === SIWE_LOGOUT_IN_PROGRESS_KEY) {
        if (e.newValue === null) {
          debugSession('Logout gate cleared, refreshing session')
          refresh()
        }
        return
      }

      // Only react to wagmi storage changes
      if (!e.key?.startsWith('wagmi.')) return

      // Debounce to prevent multiple rapid fires
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      debounceTimer = setTimeout(() => {
        // Disconnect detected (storage removed)
        if (e.newValue === null) {
          debugSession('Cross-tab disconnect detected')

          // Reset wagmi state to match other tab
          config.setState((x) => ({
            ...x,
            connections: new Map(),
            current: null,
            status: 'disconnected',
          }))

          if (!isSiweLogoutInProgress()) {
            // Logout in XState machine only when this is not part of an active logout
            sendSession({ type: 'LOGOUT' })
            cancelSiweAuthFlow()
          }
        }
        // Connection detected (storage added/changed)
        else {
          debugSession('Cross-tab state change detected, refreshing session')
          // Refresh session to check if authenticated in other tab
          if (!isSiweLogoutInProgress()) {
            refresh()
          }
        }
      }, CROSS_TAB_DEBOUNCE_MS)
    }

    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [config, sendSession, refresh])

  // Custom refresh event (fired after SIWE verification)
  useEffect(() => {
    const handleRefresh = () => {
      debugSession('Refresh event received, calling SWR refresh()')
      refresh() // SWR will revalidate
    }

    window.addEventListener(SIWE_REFRESH_EVENT, handleRefresh)
    return () => window.removeEventListener(SIWE_REFRESH_EVENT, handleRefresh)
  }, [refresh])

  const authAdapter = React.useMemo(
    () =>
      createAuthenticationAdapter({
        getNonce: async () => {
          const response = await fetch(SIWE_NONCE_PATH)
          const nonce = await response.text()
          return nonce
        },

        createMessage: ({ nonce, address, chainId: msgChainId }) => {
          // Use ref to get latest safeState (prevents stale closure)
          const currentSafeState = safeStateRef.current
          const message = createSiweMessage({
            domain: window.location.host,
            address,
            statement: currentSafeState.safeAddress
              ? `Sign in as owner for Safe ${currentSafeState.safeAddress}`
              : 'Sign in with Ethereum to Nouns Builder',
            uri: window.location.origin,
            version: '1',
            chainId: msgChainId,
            nonce,
          })
          return message
        },

        verify: async ({ message, signature }) => {
          try {
            // Use ref to get latest safeState (prevents stale closure)
            const currentSafeState = safeStateRef.current
            const response = await fetch(SIWE_VERIFY_PATH, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message,
                signature,
                safeAddress: currentSafeState.safeAddress,
                safeChainId: currentSafeState.chainId,
              }),
            })

            const body = (await response.json()) as { ok?: boolean }
            const authenticated = response.ok && body.ok === true

            if (authenticated) {
              markSiweAuthVerified()
              // Trigger session refresh via SWR
              refresh()
            } else {
              cancelSiweAuthFlow()
            }

            return authenticated
          } catch (error) {
            debugSession('Error verifying signature: %O', error)
            return false
          }
        },

        signOut: async () => {
          if (shouldSuppressSiweLogout()) {
            return
          }

          debugSession('Signing out')
          beginSiweLogout()
          sendSession({ type: 'LOGOUT' })
          clearSafe()
          cancelSiweAuthFlow()
        },
      }),
    [sendSession, clearSafe, refresh]
  )

  // RainbowKit auth status derived from XState machine
  const rainbowKitAuthStatus: AuthenticationStatus =
    sessionState.matches('authenticated') && !logoutInProgress
      ? 'authenticated'
      : 'unauthenticated'

  return (
    <ErrorBoundary onReset={resetApp}>
      <SessionContext.Provider value={session || null}>
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
      </SessionContext.Provider>
    </ErrorBoundary>
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
