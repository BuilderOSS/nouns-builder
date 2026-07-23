import { type Connector, useConnect } from 'wagmi'

import { getRecentWalletIds } from '../utils/recentWalletIds'

// Simplified WalletInstance type (from RainbowKit)
interface WalletInstance extends Connector {
  isRainbowKitConnector?: boolean
  groupName?: string
  groupIndex?: number
  rdns?: string
  iconUrl?: string
  iconBackground?: string
  installed?: boolean
  rkDetails?: {
    isRainbowKitConnector?: boolean
    groupName?: string
    groupIndex?: number
    rdns?: string
    iconUrl?: string
    iconBackground?: string
    installed?: boolean
  }
}

export interface WalletConnector {
  id: string
  name: string
  uid?: string
  icon?: string
  iconUrl: string
  iconBackground: string
  ready: boolean
  groupName: string
  groupIndex: number
  recent: boolean
  isRainbowKitConnector: boolean
  connect: () => Promise<any>
  connector: Connector
}

function isEIP6963Connector(wallet: WalletInstance): boolean {
  return !!(
    !wallet.isRainbowKitConnector &&
    !wallet.rkDetails?.isRainbowKitConnector &&
    wallet.icon?.replace(/\n/g, '').startsWith('data:image') &&
    wallet.uid &&
    wallet.name
  )
}

function isRainbowKitConnector(wallet: WalletInstance): boolean {
  return !!(wallet.isRainbowKitConnector || wallet.rkDetails?.isRainbowKitConnector)
}

export function useWalletConnectors(): WalletConnector[] {
  const { connectAsync, connectors: defaultConnectors_untyped } = useConnect()
  const defaultCreatedConnectors = defaultConnectors_untyped as WalletInstance[]

  // Merge connector with its rkDetails (RainbowKit injects details via this property)
  const defaultConnectors = defaultCreatedConnectors.map((connector) => ({
    ...connector,
    ...(connector.rkDetails || {}),
  })) as WalletInstance[]

  // Connect function that adds to recent wallets
  async function connectWallet(connector: Connector): Promise<any> {
    const result = await connectAsync({
      connector,
    })
    return result
  }

  // Separate EIP-6963 (auto-discovered browser extensions)
  const eip6963Connectors = defaultConnectors
    .filter(isEIP6963Connector)
    .map((connector) => ({
      ...connector,
      groupIndex: 0,
      groupName: 'Installed',
    }))

  // Separate RainbowKit configured wallets
  const seenIds = new Set<string>()
  const rainbowKitConnectors = defaultConnectors
    .filter(isRainbowKitConnector)
    .filter((wallet) => wallet.id !== 'safe') // Exclude Safe
    .filter((wallet) => {
      // Deduplicate: remove RainbowKit connector if EIP-6963 version exists
      const existsInEIP6963 = eip6963Connectors.some(
        (eip6963) => eip6963.id === wallet.rdns
      )
      if (existsInEIP6963) return false

      // Deduplicate by connector ID (e.g., multiple walletConnect instances)
      if (seenIds.has(wallet.id)) {
        return false
      }
      seenIds.add(wallet.id)
      return true
    })

  const combinedConnectors = [...eip6963Connectors, ...rainbowKitConnectors]

  // Create index by wallet ID for recent wallet lookup
  const walletInstanceById: Record<string, WalletInstance> = {}
  for (const wallet of combinedConnectors) {
    walletInstanceById[wallet.id] = wallet
  }

  // Get recent wallets
  const MAX_RECENT_WALLETS = 3
  const recentWallets: WalletInstance[] = getRecentWalletIds()
    .map((walletId) => walletInstanceById[walletId])
    .filter(Boolean)
    .slice(0, MAX_RECENT_WALLETS)

  // Combine with recent wallets at the front
  const combinedWithRecent = [
    ...recentWallets,
    ...combinedConnectors.filter(
      (wallet) => !recentWallets.some((recent) => recent.id === wallet.id)
    ),
  ]

  // Map to WalletConnector format
  const walletConnectors: WalletConnector[] = []

  for (const wallet of combinedWithRecent) {
    if (!wallet) continue

    const eip6963 = isEIP6963Connector(wallet)
    const recent = recentWallets.some((recentWallet) => recentWallet.id === wallet.id)

    if (eip6963) {
      // EIP-6963 connectors (browser extensions)
      walletConnectors.push({
        id: wallet.id,
        name: wallet.name || 'Wallet',
        uid: wallet.uid,
        icon: wallet.icon,
        iconUrl: wallet.icon || '/icons/wallets/injected.svg',
        iconBackground: wallet.iconBackground || '#fff',
        ready: true,
        groupName: 'Installed',
        groupIndex: 0,
        recent,
        isRainbowKitConnector: false,
        connect: () => connectWallet(wallet),
        connector: wallet,
      })
    } else {
      // RainbowKit configured wallets
      walletConnectors.push({
        id: wallet.id,
        name: wallet.name || 'Wallet',
        uid: wallet.uid,
        icon: wallet.icon,
        iconUrl: wallet.iconUrl || wallet.icon || '/icons/wallets/injected.svg',
        iconBackground: wallet.iconBackground || '#fff',
        ready: wallet.installed ?? true,
        groupName: wallet.groupName || 'Popular',
        groupIndex: wallet.groupIndex || 999,
        recent,
        isRainbowKitConnector: true,
        connect: () => connectWallet(wallet),
        connector: wallet,
      })
    }
  }

  return walletConnectors
}
