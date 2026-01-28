import { AddressType } from './hex'

export enum TransactionType {
  SEND_ETH = 'send-eth',
  SEND_ERC20 = 'send-erc20',
  SEND_NFT = 'send-nft',
  AIRDROP = 'airdrop',
  DROPOSAL = 'droposal',
  CUSTOM = 'custom',
  UPGRADE = 'upgrade',
  ESCROW = 'escrow',
  ESCROW_DELEGATE = 'escrow-delegate',
  PAUSE_AUCTIONS = 'pause-auctions',
  FIX_RENDERER_BASE = 'fix-renderer-base',
  RESUME_AUCTIONS = 'resume-auctions',
  UPDATE_MINTER = 'update-minter',
  REPLACE_ARTWORK = 'replace-artwork',
  RELEASE_ESCROW_MILESTONE = 'release-escrow-milestone',
  MIGRATION = 'migration',
  WALLET_CONNECT = 'wallet-connect',
  ADD_ARTWORK = 'add-artwork',
  PIN_TREASURY_ASSET = 'pin-treasury-asset',
  SABLIER_STREAM = 'sablier-stream',
}

export type Transaction = {
  functionSignature: string
  target: AddressType
  value: string
  calldata: string
}

export type BuilderTransaction = {
  type: TransactionType
  transactions: Transaction[]
  summary?: string
}
