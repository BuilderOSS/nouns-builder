import { color, IconType } from '@buildeross/zord'

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
}

export interface TransactionTypeProps {
  title: string
  subTitle: string
  icon: IconType
  iconBackdrop: string
  iconBorder?: boolean
}

export interface TransactionTypesPropsMap {
  [key: string]: TransactionTypeProps
}

export const TRANSACTION_TYPES = {
  [TransactionType.SEND_ETH]: {
    title: 'Send ETH',
    subTitle: 'Create a proposal to send ETH from the treasury',
    icon: 'eth',
    iconBackdrop: 'rgba(115, 17, 255, 0.1)',
  },
  [TransactionType.SEND_ERC20]: {
    title: 'Send Tokens',
    subTitle: 'Create a proposal to send ERC20 tokens from the treasury',
    icon: 'erc20',
    iconBackdrop: 'rgba(0, 163, 255, 0.1)',
  },
  [TransactionType.SEND_NFT]: {
    title: 'Send NFTs',
    subTitle: 'Create a proposal to send NFTs from the treasury',
    icon: 'nft',
    iconBackdrop: 'rgba(138, 43, 226, 0.1)',
  },
  [TransactionType.AIRDROP]: {
    title: 'Create an Airdrop',
    subTitle: 'Create a free Airdrop for selected addresses',
    icon: 'airdrop',
    iconBackdrop: 'rgba(28, 182, 135, 0.1)',
  },
  [TransactionType.ESCROW]: {
    title: 'Escrow Milestones',
    subTitle: 'Create a proposal and escrow milestones ',
    icon: 'escrow',
    iconBackdrop: 'rgba(255, 155, 155, 0.102)',
  },
  [TransactionType.ESCROW_DELEGATE]: {
    title: 'Nominate Escrow Delegate',
    subTitle: 'Create a proposal to nominate an escrow delegate',
    icon: 'handshake',
    iconBackdrop: 'rgba(0, 163, 255, 0.1)',
  },
  [TransactionType.DROPOSAL]: {
    title: 'Droposal: Single edition',
    subTitle: 'Create a droposal for a Single-edition ERC721 collection',
    icon: 'collection',
    iconBackdrop: 'rgba(0, 163, 255, 0.1)',
  },
  [TransactionType.UPGRADE]: {
    title: 'Upgrade Proposal',
    subTitle: 'Create a proposal to upgrade',
    icon: 'plus',
    iconBackdrop: color.ghostHover,
  },
  [TransactionType.PAUSE_AUCTIONS]: {
    title: 'Pause Auctions',
    subTitle: 'Create a proposal to pause auctions',
    icon: 'pauseTemplate',
    iconBackdrop: 'rgba(236, 113, 75, 0.1)',
  },
  [TransactionType.FIX_RENDERER_BASE]: {
    title: 'Fix Metadata Renderer Base',
    subTitle:
      'Create a proposal to restore NFT image visibility on external marketplaces.',
    icon: 'spanner',
    iconBackdrop: color.ghostHover,
  },
  [TransactionType.RESUME_AUCTIONS]: {
    title: 'Resume Auctions',
    subTitle: 'Create a proposal to resume auctions',
    icon: 'resumeTemplate',
    iconBackdrop: 'rgba(236, 113, 75, 0.1)',
  },
  [TransactionType.REPLACE_ARTWORK]: {
    title: 'Replace Artwork',
    subTitle: 'Create a proposal to replace your artwork',
    icon: 'brush',
    iconBackdrop: 'rgba(236, 113, 75, 0.1)',
  },
  [TransactionType.ADD_ARTWORK]: {
    title: 'Add Artwork',
    subTitle: 'Create a proposal to add new artwork',
    icon: 'brush',
    iconBackdrop: 'rgba(236, 113, 75, 0.1)',
  },
  [TransactionType.CUSTOM]: {
    title: 'Custom Transaction',
    subTitle: 'Create any other kind of transaction',
    icon: 'plus',
    iconBackdrop: color.ghostHover,
  },
  [TransactionType.MIGRATION]: {
    title: 'Migration',
    subTitle: 'Migrate from L1 to L2',
    icon: 'migrate',
    iconBackdrop: 'rgba(350,100,0,.1)',
  },
  [TransactionType.WALLET_CONNECT]: {
    title: 'WalletConnect',
    subTitle: 'Connect to dApps and create transactions via WalletConnect',
    icon: 'walletConnectOutline',
    iconBackdrop: 'rgba(59, 130, 246, 0.1)',
  },
} as TransactionTypesPropsMap
