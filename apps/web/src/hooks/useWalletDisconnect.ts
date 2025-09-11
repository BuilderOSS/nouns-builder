'use client'

import * as React from 'react'
import { useAccount, useConfig, useDisconnect } from 'wagmi'

export function useWalletDisconnect(): () => void {
  const [hydrated, setHydrated] = React.useState(false)
  React.useEffect(() => {
    setHydrated(true)
  }, [])

  const { connector, address } = useAccount()
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

  // Run at most once per (address + connectorId)
  const validatedKeyRef = React.useRef<string | null>(null)

  const cleanupStorage = React.useCallback(() => {
    try {
      const PREFIXES = ['wagmi', 'wc@', '@appkit', 'rainbowkit']
      for (const key of Object.keys(localStorage)) {
        if (PREFIXES.some((p) => key.startsWith(p))) localStorage.removeItem(key)
      }
    } catch (e) {
      console.warn('targeted storage cleanup failed:', e)
    }
  }, [])

  const disconnectCore = React.useCallback(async () => {
    // 1) wagmi
    try {
      await disconnectAsync()
    } catch (e) {
      console.warn('wagmi disconnect failed:', e)
    }

    // 2) WalletConnect: kill session if present
    try {
      if (connector?.id === 'walletConnect' && connector.getProvider) {
        const provider: any = await connector.getProvider()
        await provider?.disconnect?.()
        provider?.destroy?.()
      }
    } catch (e) {
      console.warn('walletconnect provider cleanup failed:', e)
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

  // Auto-validator: check provider quickly; if bad, disconnect + remount
  React.useEffect(() => {
    if (!hydrated || !address) return

    const key = `${address}:${connector?.id ?? 'none'}`
    if (validatedKeyRef.current === key) return
    validatedKeyRef.current = key

    let cancelled = false
    const deadline = Date.now() + 2500
    const step = 250
    const perAttempt = 700

    const tryGetChainId = async (prov: any) => {
      const timeout = new Promise((_, rej) =>
        setTimeout(() => rej(new Error('timeout')), perAttempt)
      )
      const res = await Promise.race([
        prov?.request?.({ method: 'eth_chainId' }),
        timeout,
      ])
      const n =
        typeof res === 'string'
          ? parseInt(res, 16)
          : typeof res === 'number'
            ? res
            : undefined
      return Number.isFinite(n) && n! > 0 ? n! : undefined
    }

    const run = async () => {
      try {
        const prov: any = await connector?.getProvider?.()
        if (!prov || !prov.request) throw new Error('no-provider')

        // immediate try
        const first = await tryGetChainId(prov).catch(() => undefined)
        if (first || cancelled) return

        // short, bounded polling
        while (!cancelled && Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, step))
          const id = await tryGetChainId(prov).catch(() => undefined)
          if (id) return
        }

        if (!cancelled) await disconnectCore() // no reload
      } catch {
        if (!cancelled) await disconnectCore()
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [hydrated, address, connector, disconnectCore])

  return disconnect
}
