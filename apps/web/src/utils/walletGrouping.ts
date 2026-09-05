import type { Connector } from 'wagmi'

export interface GroupedWallet {
  connector: Connector
  name: string
  icon: string
  iconBackground: string
  isRecent: boolean
  isInstalled: boolean
}

export interface WalletSection {
  title: string
  wallets: GroupedWallet[]
}

/**
 * Detects if a connector is an EIP-6963 auto-discovered wallet
 * Based on RainbowKit's detection logic
 */
export function isEIP6963Connector(connector: Connector): boolean {
  // Safety check: ensure connector has an id
  if (!connector.id || typeof connector.id !== 'string') {
    return false
  }

  // EIP-6963 connectors have:
  // 1. A uid property
  // 2. An icon that's a data URI
  // 3. Are not marked as RainbowKit connectors
  const hasUid = 'uid' in connector && typeof connector.uid === 'string'
  const hasDataIcon =
    'icon' in connector &&
    typeof connector.icon === 'string' &&
    connector.icon.replace(/\n/g, '').startsWith('data:image')

  // Check if it's not a RainbowKit connector by looking at the id pattern
  // EIP-6963 ids are typically reverse domain names (e.g., io.rabby, com.brave.wallet)
  const hasReverseDomaindId = connector.id.includes('.')

  return hasUid && hasDataIcon && hasReverseDomaindId
}

/**
 * Gets the rdns (reverse domain name service) identifier from a connector
 * Used for matching EIP-6963 connectors with RainbowKit connectors
 */
export function getConnectorRdns(connector: Connector): string | undefined {
  // Safety check
  if (!connector.id) {
    return undefined
  }

  // For EIP-6963 connectors, the id IS the rdns
  if (isEIP6963Connector(connector)) {
    return connector.id
  }

  // For RainbowKit connectors, check for rdns property
  if ('rdns' in connector && typeof connector.rdns === 'string') {
    return connector.rdns
  }

  // Map common connector IDs to their rdns
  const rdnsMap: Record<string, string> = {
    metaMask: 'io.metamask',
    rabby: 'io.rabby',
    coinbaseWallet: 'com.coinbase.wallet',
    brave: 'com.brave.wallet',
    trust: 'com.trustwallet.app',
    phantom: 'app.phantom',
  }

  return rdnsMap[connector.id]
}

/**
 * Deduplicates connectors by removing RainbowKit versions when EIP-6963 exists
 * and removing duplicate connector IDs
 */
export function deduplicateConnectors(connectors: Connector[]): Connector[] {
  // Filter out connectors with undefined ID
  const validConnectors = connectors.filter((c) => c.id !== undefined)

  const eip6963Connectors = validConnectors.filter(isEIP6963Connector)
  const eip6963Rdns = new Set(eip6963Connectors.map((c) => c.id))

  // Track seen connector IDs to avoid duplicates
  const seenIds = new Set<string>()

  // Filter out RainbowKit connectors that have an EIP-6963 equivalent
  // and deduplicate by connector ID
  return validConnectors.filter((connector) => {
    // Keep all EIP-6963 connectors (dedupe by ID)
    if (isEIP6963Connector(connector)) {
      if (seenIds.has(connector.id)) {
        return false
      }
      seenIds.add(connector.id)
      return true
    }

    // For RainbowKit connectors, check if there's a matching EIP-6963
    const rdns = getConnectorRdns(connector)
    if (rdns && eip6963Rdns.has(rdns)) {
      // Skip this RainbowKit connector as we have the EIP-6963 version
      return false
    }

    // Deduplicate by connector ID (handle multiple WalletConnect instances)
    if (seenIds.has(connector.id)) {
      return false
    }
    seenIds.add(connector.id)

    return true
  })
}

/**
 * Checks if a connector is ready (installed/available)
 */
export function isConnectorReady(connector: Connector): boolean {
  // EIP-6963 connectors are always ready (they're auto-discovered)
  if (isEIP6963Connector(connector)) {
    return true
  }

  // Check the ready property for other connectors
  if ('ready' in connector && typeof connector.ready === 'boolean') {
    return connector.ready
  }

  // Default to true for backwards compatibility
  return true
}
