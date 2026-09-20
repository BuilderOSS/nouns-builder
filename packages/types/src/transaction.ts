import { AddressType } from './hex'

export enum TransactionType {
  SEND_TOKENS = 'send-tokens',
  SEND_NFT = 'send-nft',
  MINT_GOVERNANCE_TOKENS = 'mint-governance-tokens',
  DROPOSAL = 'droposal',
  CUSTOM = 'custom',
  UPGRADE = 'upgrade',
  MILESTONE_PAYMENTS = 'milestone-payments',
  NOMINATE_DELEGATE = 'nominate-delegate',
  PAUSE_AUCTIONS = 'pause-auctions',
  FIX_RENDERER_BASE = 'fix-renderer-base',
  RESUME_AUCTIONS = 'resume-auctions',
  UPDATE_MINTER = 'update-minter',
  REPLACE_ARTWORK = 'replace-artwork',
  RELEASE_ESCROW_MILESTONE = 'release-escrow-milestone',
  MIGRATION = 'migration',
  CROSS_CHAIN_MIGRATION = 'cross-chain-migration',
  WALLET_CONNECT = 'wallet-connect',
  ADD_ARTWORK = 'add-artwork',
  PIN_TREASURY_ASSET = 'pin-treasury-asset',
  STREAM_TOKENS = 'stream-tokens',
  AIRDROP_TOKENS = 'airdrop-tokens',
  CREATOR_COIN = 'creator-coin',
  CONTENT_COIN = 'content-coin',
  UNISWAP_SWAP = 'uniswap-swap',
}

export type Transaction = {
  functionSignature: string
  target: AddressType
  value: string
  calldata: string
}

export type UniswapQuoteMetadata = {
  quoteId: string
  timestamp: number
  inputToken: {
    address: AddressType
    symbol: string
    decimals: number
  }
  outputToken: {
    address: AddressType
    symbol: string
    decimals: number
  }
  inputAmount: string // wei
  outputAmount: string // wei
  minimumAmountOut: string // wei
  slippage: number
  routing: string // "V2", "V3", "V4", etc.
  priceImpact: string
  swapDirection: 'buy' | 'sell'
}

export type TransactionBundleMetadata = {
  uniswapQuote?: UniswapQuoteMetadata
}

export type TransactionBundle = {
  type: TransactionType
  title: string
  summary: string
  transactions: Transaction[]
  metadata?: TransactionBundleMetadata
}
