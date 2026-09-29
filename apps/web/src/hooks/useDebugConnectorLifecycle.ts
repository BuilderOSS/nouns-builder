import debug from 'debug'
import { useEffect } from 'react'
import { useAccount, useConnections } from 'wagmi'

const debugLifecycle = debug('app:walletConnect:lifecycle')

/**
 * Debug hook that logs the complete lifecycle of wallet connections.
 * This helps understand the sequence of events when connecting/disconnecting wallets.
 *
 * Enable with: localStorage.setItem('debug', 'app:walletConnect:*')
 */
export function useDebugConnectorLifecycle() {
  const account = useAccount()
  const connections = useConnections()

  useEffect(() => {
    debugLifecycle('=== Account State Changed ===')
    debugLifecycle('Account:', {
      status: account.status,
      address: account.address,
      chainId: account.chainId,
      isConnected: account.isConnected,
      isConnecting: account.isConnecting,
      isDisconnected: account.isDisconnected,
      isReconnecting: account.isReconnecting,
    })
  }, [
    account.status,
    account.address,
    account.chainId,
    account.isConnected,
    account.isConnecting,
    account.isDisconnected,
    account.isReconnecting,
  ])

  useEffect(() => {
    debugLifecycle('=== Connections Changed ===')
    debugLifecycle('Total connections:', connections.length)

    connections.forEach((conn, idx) => {
      debugLifecycle(`Connection ${idx}:`, {
        connectorId: conn.connector?.id,
        connectorName: conn.connector?.name,
        chainId: conn.chainId,
        accounts: conn.accounts,
      })
    })
  }, [connections])

  return null
}
