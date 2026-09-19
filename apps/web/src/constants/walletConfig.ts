export interface WalletMetadata {
  name: string
  icon: string
  iconBackground: string
  iconAccent?: string
}

export const WALLET_CONFIG: Record<string, WalletMetadata> = {
  // MetaMask
  'io.metamask': {
    name: 'MetaMask',
    icon: '/icons/wallets/metamask.svg',
    iconBackground: '#fff',
    iconAccent: '#f6851a',
  },
  metaMask: {
    name: 'MetaMask',
    icon: '/icons/wallets/metamask.svg',
    iconBackground: '#fff',
    iconAccent: '#f6851a',
  },

  // Rainbow
  'me.rainbow': {
    name: 'Rainbow',
    icon: '/icons/wallets/rainbow.svg',
    iconBackground: '#001e59',
  },
  rainbow: {
    name: 'Rainbow',
    icon: '/icons/wallets/rainbow.svg',
    iconBackground: '#001e59',
  },

  // Coinbase
  'com.coinbase.wallet': {
    name: 'Coinbase Wallet',
    icon: '/icons/wallets/coinbase.svg',
    iconBackground: '#0052ff',
  },
  coinbase: {
    name: 'Coinbase Wallet',
    icon: '/icons/wallets/coinbase.svg',
    iconBackground: '#0052ff',
  },
  coinbaseWallet: {
    name: 'Coinbase Wallet',
    icon: '/icons/wallets/coinbase.svg',
    iconBackground: '#0052ff',
  },

  // WalletConnect
  walletConnect: {
    name: 'WalletConnect',
    icon: '/icons/wallets/walletconnect.svg',
    iconBackground: '#3b99fc',
  },

  // Rabby
  'io.rabby': {
    name: 'Rabby Wallet',
    icon: '/icons/wallets/rabby.svg',
    iconBackground: '#8697ff',
  },
  rabby: {
    name: 'Rabby Wallet',
    icon: '/icons/wallets/rabby.svg',
    iconBackground: '#8697ff',
  },

  // Ledger
  ledger: {
    name: 'Ledger',
    icon: '/icons/wallets/ledger.svg',
    iconBackground: '#000',
  },
  ledgerHid: {
    name: 'Ledger',
    icon: '/icons/wallets/ledger.svg',
    iconBackground: '#000',
  },

  // Safe
  safe: {
    name: 'Safe',
    icon: '/icons/wallets/safe.svg',
    iconBackground: '#12ff80',
  },

  // Brave
  'com.brave.wallet': {
    name: 'Brave Wallet',
    icon: '/icons/wallets/brave.svg',
    iconBackground: '#fff',
  },
  brave: {
    name: 'Brave Wallet',
    icon: '/icons/wallets/brave.svg',
    iconBackground: '#fff',
  },

  // Phantom
  'app.phantom': {
    name: 'Phantom',
    icon: '/icons/wallets/phantom.svg',
    iconBackground: '#ab9ff2',
  },
  phantom: {
    name: 'Phantom',
    icon: '/icons/wallets/phantom.svg',
    iconBackground: '#ab9ff2',
  },

  // Trust Wallet
  'com.trustwallet.app': {
    name: 'Trust Wallet',
    icon: '/icons/wallets/trust.svg',
    iconBackground: '#3375bb',
  },
  trust: {
    name: 'Trust Wallet',
    icon: '/icons/wallets/trust.svg',
    iconBackground: '#3375bb',
  },

  // Generic injected
  injected: {
    name: 'Browser Wallet',
    icon: '/icons/wallets/injected.svg',
    iconBackground: '#fff',
  },
}

export function getWalletMetadata(connectorId: string): WalletMetadata {
  return (
    WALLET_CONFIG[connectorId] || {
      name: 'Wallet',
      icon: '/icons/wallets/injected.svg',
      iconBackground: '#fff',
    }
  )
}
