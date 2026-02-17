import { TransactionType } from '@buildeross/types'
import { Atoms, color, IconType } from '@buildeross/zord'

export { TransactionType }

export interface TransactionTypeProps {
  title: string
  subTitle: string
  icon: IconType
  iconBackdrop: string
  iconFill?: Atoms['color']
}

export type TransactionTypesPropsMap = Record<TransactionType, TransactionTypeProps>

export const TRANSACTION_TYPES: TransactionTypesPropsMap = {
  [TransactionType.SEND_TOKENS]: {
    title: 'Send Tokens',
    subTitle: 'Send ETH or ERC20 tokens to one or more recipients',
    icon: 'eth',
    iconBackdrop: 'rgba(0, 163, 255, 0.1)',
  },
  [TransactionType.SEND_NFT]: {
    title: 'Send NFTs',
    subTitle: 'Send NFTs from the treasury',
    icon: 'nft',
    iconBackdrop: 'rgba(138, 43, 226, 0.1)',
  },
  [TransactionType.MINT_GOVERNANCE_TOKENS]: {
    title: 'Mint Governance Tokens',
    subTitle: 'Mint governance tokens to selected addresses',
    icon: 'airdrop',
    iconBackdrop: 'rgba(28, 182, 135, 0.1)',
  },
  [TransactionType.MILESTONE_PAYMENTS]: {
    title: 'Milestone Payments',
    subTitle: 'Schedule token releases in milestones',
    icon: 'escrow',
    iconBackdrop: 'rgba(255, 155, 155, 0.102)',
  },
  [TransactionType.RELEASE_ESCROW_MILESTONE]: {
    title: 'Release Milestone Payment',
    subTitle: 'Release a scheduled milestone payment',
    icon: 'escrow',
    iconBackdrop: 'rgba(255, 155, 155, 0.102)',
  },
  [TransactionType.NOMINATE_DELEGATE]: {
    title: 'Nominate Delegate',
    subTitle: 'Nominate a delegate for milestone payments or token streams',
    icon: 'handshake',
    iconBackdrop: 'rgba(0, 163, 255, 0.1)',
  },
  [TransactionType.DROPOSAL]: {
    title: 'Droposal: Single Edition',
    subTitle: 'Single-edition ERC721 collection droposal',
    icon: 'collection',
    iconBackdrop: 'rgba(0, 163, 255, 0.1)',
  },
  [TransactionType.UPGRADE]: {
    title: 'Upgrade Proposal',
    subTitle: 'Upgrade dao contracts',
    icon: 'plus',
    iconBackdrop: color.ghostHover,
    iconFill: 'icon1',
  },
  [TransactionType.UPDATE_MINTER]: {
    title: 'Update Minter',
    subTitle: 'Update token minter',
    icon: 'plus',
    iconBackdrop: color.ghostHover,
    iconFill: 'icon1',
  },
  [TransactionType.PAUSE_AUCTIONS]: {
    title: 'Pause Auctions',
    subTitle: 'Pause auctions',
    icon: 'pauseTemplate',
    iconBackdrop: 'rgba(236, 113, 75, 0.1)',
  },
  [TransactionType.FIX_RENDERER_BASE]: {
    title: 'Fix Metadata Renderer Base',
    subTitle: 'Restore NFT image visibility on external marketplaces',
    icon: 'spanner',
    iconBackdrop: color.ghostHover,
  },
  [TransactionType.RESUME_AUCTIONS]: {
    title: 'Resume Auctions',
    subTitle: 'Resume paused auctions',
    icon: 'resumeTemplate',
    iconBackdrop: 'rgba(236, 113, 75, 0.1)',
  },
  [TransactionType.REPLACE_ARTWORK]: {
    title: 'Replace Artwork',
    subTitle: 'Replace existing artwork in your collection',
    icon: 'brush',
    iconBackdrop: 'rgba(236, 113, 75, 0.1)',
  },
  [TransactionType.ADD_ARTWORK]: {
    title: 'Add Artwork',
    subTitle: 'Add new artwork to your collection',
    icon: 'brush',
    iconBackdrop: 'rgba(236, 113, 75, 0.1)',
  },
  [TransactionType.CUSTOM]: {
    title: 'Custom Transaction',
    subTitle: 'Any other type of transaction',
    icon: 'plus',
    iconBackdrop: color.ghostHover,
    iconFill: 'icon1',
  },
  [TransactionType.MIGRATION]: {
    title: 'Migration',
    subTitle: 'Migrate from L1 to L2',
    icon: 'migrate',
    iconBackdrop: 'rgba(350, 100, 0, 0.1)',
  },
  [TransactionType.WALLET_CONNECT]: {
    title: 'WalletConnect',
    subTitle: 'Connect to dApps and execute transactions via WalletConnect',
    icon: 'walletConnectOutline',
    iconBackdrop: 'rgba(59, 130, 246, 0.1)',
  },
  [TransactionType.PIN_TREASURY_ASSET]: {
    title: 'Pin Treasury Asset',
    subTitle: 'Whitelist a token or NFT for prominent display in treasury',
    icon: 'pin',
    iconBackdrop: 'rgba(236, 113, 75, 0.1)',
    iconFill: 'warning',
  },
  [TransactionType.STREAM_TOKENS]: {
    title: 'Stream Tokens',
    subTitle: 'Continuous token payments over time',
    icon: 'sablier',
    iconBackdrop: 'rgba(243, 139, 0, 0.1)',
  },
  [TransactionType.CREATOR_COIN]: {
    title: 'Creator Coin',
    subTitle: 'Create a proposal to mint Creator Coin',
    icon: 'creatorCoin',
    iconBackdrop: 'rgba(0, 163, 255, 0.1)',
  },
  [TransactionType.CONTENT_COIN]: {
    title: 'Content Coin',
    subTitle: 'Create a proposal to mint Content Coin',
    icon: 'contentCoin',
    iconBackdrop: 'rgba(0, 163, 255, 0.1)',
  },
}
