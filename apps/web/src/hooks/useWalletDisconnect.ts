'use client'

import * as React from 'react'
import { useAccount, useConfig, useDisconnect } from 'wagmi'

export function useWalletDisconnect(): () => void {
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
      for (const key of Object.keys(localStorage)) {
        if (PREFIXES.some((p) => key.startsWith(p))) localStorage.removeItem(key)
      }
    } catch (e) {
      console.warn('useWalletDisconnect: targeted storage cleanup failed:', e)
    }
  }, [])

  const disconnectCore = React.useCallback(async () => {
    // 1) wagmi
    try {
      await disconnectAsync()
    } catch (e) {
      console.warn('useWalletDisconnect: wagmi disconnect failed:', e)
    }

    // 2) WalletConnect: kill session if present
    try {
      if (connector?.id === 'walletConnect' && connector.getProvider) {
        const provider: any = await connector.getProvider()
        await provider?.disconnect?.()
        provider?.destroy?.()
      }
    } catch (e) {
      console.warn('useWalletDisconnect: walletconnect provider cleanup failed:', e)
    }

    // 3) targeted localStorage cleanup
    cleanupStorage()

    // 4) Reset Wagmi State
    resetWagmi()
  }, [disconnectAsync, connector, cleanupStorage, resetWagmi])

  const inFlightRef = React.useRef<Promise<void> | null>(null)
  const runOnce = React.useCallback((fn: () => Promise<void>) => {
    if (inFlightRef.current) return inFlightRef.current
    const p = (async () => {
      try {
        await fn()
      } finally {
        inFlightRef.current = null
      }
    })()
    inFlightRef.current = p
    return p
  }, [])

  // Public API: user-initiated disconnect (simple, no extra checks)
  const disconnect = React.useCallback(() => {
    void runOnce(disconnectCore)
  }, [runOnce, disconnectCore])

  return disconnect
}
