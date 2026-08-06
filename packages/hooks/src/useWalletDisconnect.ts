import debug from 'debug'
import * as React from 'react'
import { useAccount, useConfig, useDisconnect } from 'wagmi'

const debugDisconnect = debug('app:wallet:disconnect')

// Prevent rapid-fire disconnects within this window
const DISCONNECT_THROTTLE_MS = 1000

export function useWalletDisconnect(): () => Promise<void> {
  const { connector } = useAccount()
  const { disconnectAsync } = useDisconnect()
  const config = useConfig()

  const resetWagmi = React.useCallback(() => {
    config.setState((x) => ({
      ...x,
      connections: new Map(),
      current: null,
      status: 'disconnected',
    }))
  }, [config])

  const cleanupStorage = React.useCallback(() => {
    try {
      const PREFIXES = ['wagmi', 'wc@', '@appkit', 'rainbowkit']
      const EXACT_KEYS = ['WALLETCONNECT_DEEPLINK_CHOICE'] // Mobile deep link preference

      // Remove prefixed keys
      for (const key of Object.keys(localStorage)) {
        if (PREFIXES.some((p) => key.startsWith(p))) localStorage.removeItem(key)
      }

      // Remove exact match keys
      EXACT_KEYS.forEach((key) => localStorage.removeItem(key))
    } catch (e) {
      debugDisconnect('targeted storage cleanup failed:', e)
    }
  }, [])

  const disconnectCore = React.useCallback(async () => {
    // 1) wagmi
    try {
      await disconnectAsync()
    } catch (e) {
      debugDisconnect('wagmi disconnect failed:', e)
    }

    // 2) Connector-specific cleanup
    try {
      if (connector?.getProvider) {
        const provider: any = await connector.getProvider()

        if (connector.id === 'walletConnect') {
          // WalletConnect: comprehensive session termination

          // a) Abort any ongoing pairing attempt
          try {
            await provider?.abortPairingAttempt?.()
          } catch (e) {
            debugDisconnect('abort pairing failed:', e)
          }

          // b) Clean up pending pairings
          try {
            await provider?.cleanupPendingPairings?.({ deletePairings: true })
          } catch (e) {
            debugDisconnect('cleanup pairings failed:', e)
          }

          // c) Disconnect all sessions
          await provider?.disconnect?.()

          // d) Destroy the provider
          provider?.destroy?.()

          // e) Remove all event listeners (EIP-1193)
          try {
            if (provider?.removeAllListeners) {
              provider.removeAllListeners()
            }
          } catch (e) {
            debugDisconnect('remove listeners failed:', e)
          }

          // f) Clear WalletConnect IndexedDB storage
          try {
            if (typeof window !== 'undefined' && window.indexedDB) {
              // WalletConnect v2 uses 'keyvaluestorage' database
              window.indexedDB.deleteDatabase('keyvaluestorage')
            }
          } catch (e) {
            debugDisconnect('clear WC IndexedDB failed:', e)
          }
        } else {
          // Injected/EIP-6963 wallets: revoke permissions (EIP-2255)
          // This tells the wallet to "forget" this dApp connection
          const isInjected =
            connector.id.includes('.') || // EIP-6963 RDNS format (io.rabby, io.metamask, etc.)
            connector.id === 'injected' ||
            connector.id === 'metaMask' ||
            connector.id === 'coinbaseWallet'

          if (isInjected && provider?.request) {
            // a) Remove event listeners first (EIP-1193)
            try {
              if (provider.removeAllListeners) {
                provider.removeAllListeners()
              } else {
                // Fallback: remove specific event listeners
                const events = [
                  'accountsChanged',
                  'chainChanged',
                  'connect',
                  'disconnect',
                  'message',
                ]
                events.forEach((event) => {
                  try {
                    if (provider.removeListener) {
                      provider.removeListener(event, () => {})
                    } else if (provider.off) {
                      provider.off(event, () => {})
                    }
                  } catch (e) {
                    // Some providers may not support removing specific listeners
                  }
                })
              }
            } catch (e) {
              debugDisconnect('remove listeners failed:', e)
            }

            // b) Revoke wallet permissions (EIP-2255)
            try {
              await provider.request({
                method: 'wallet_revokePermissions',
                params: [{ eth_accounts: {} }],
              })
            } catch (revokeError) {
              // Not all wallets support wallet_revokePermissions (EIP-2255)
              // This is expected for some wallets - fail silently
              debugDisconnect('wallet_revokePermissions not supported:', revokeError)
            }
          }
        }
      }
    } catch (e) {
      debugDisconnect('provider cleanup failed:', e)
    }

    // 3) SIWE session logout - handled by session machine in useAppDisconnect
    // Removed to prevent duplicate logout calls that cause race conditions

    // 4) targeted localStorage cleanup
    cleanupStorage()

    // 5) Reset Wagmi State
    resetWagmi()
  }, [disconnectAsync, connector, cleanupStorage, resetWagmi])

  const inFlightRef = React.useRef<Promise<void> | null>(null)
  const lastSuccessRef = React.useRef<number>(0)

  const runOnce = React.useCallback((fn: () => Promise<void>) => {
    // If already in progress, return existing promise
    if (inFlightRef.current) return inFlightRef.current

    // If recently succeeded, skip to prevent rapid-fire disconnects
    const timeSinceSuccess = Date.now() - lastSuccessRef.current
    if (timeSinceSuccess < DISCONNECT_THROTTLE_MS) {
      debugDisconnect(
        'Disconnect called too soon after last success (%dms), skipping',
        timeSinceSuccess
      )
      return Promise.resolve()
    }

    const p = (async () => {
      try {
        await fn()
        lastSuccessRef.current = Date.now()
        debugDisconnect('Disconnect completed successfully')
      } catch (error) {
        debugDisconnect('Disconnect failed: %O', error)
        // Don't update lastSuccessRef on failure, allowing retry
        throw error
      } finally {
        inFlightRef.current = null
      }
    })()
    inFlightRef.current = p
    return p
  }, [])

  // Public API: user-initiated disconnect (simple, no extra checks)
  const disconnect = React.useCallback(() => {
    return runOnce(disconnectCore)
  }, [runOnce, disconnectCore])

  return disconnect
}
