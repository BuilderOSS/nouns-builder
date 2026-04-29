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
    iconBackdrop: `color-mix(in srgb, ${color.accent} 10%, transparent)`,
  },
  [TransactionType.SEND_NFT]: {
    title: 'Send NFTs',
    subTitle: 'Send NFTs from the treasury',
    icon: 'nft',
    iconBackdrop: `color-mix(in srgb, ${color.text2} 10%, transparent)`,
  },
  [TransactionType.MINT_GOVERNANCE_TOKENS]: {
    title: 'Mint Governance Tokens',
    subTitle: 'Mint governance tokens to selected addresses',
    icon: 'airdrop',
    iconBackdrop: `color-mix(in srgb, ${color.positive} 10%, transparent)`,
  },
  [TransactionType.MILESTONE_PAYMENTS]: {
    title: 'Milestone Payments',
    subTitle: 'Schedule token releases in milestones',
    icon: 'escrow',
    iconBackdrop: `color-mix(in srgb, ${color.negative} 10%, transparent)`,
  },
  [TransactionType.RELEASE_ESCROW_MILESTONE]: {
    title: 'Release Milestone Payment',
    subTitle: 'Release a scheduled milestone payment',
    icon: 'escrow',
    iconBackdrop: `color-mix(in srgb, ${color.negative} 10%, transparent)`,
  },
  [TransactionType.NOMINATE_DELEGATE]: {
    title: 'Nominate Delegate',
    subTitle: 'Nominate a delegate for milestone payments or token streams',
    icon: 'handshake',
    iconBackdrop: `color-mix(in srgb, ${color.accent} 10%, transparent)`,
  },
  [TransactionType.DROPOSAL]: {
    title: 'Droposal: Single Edition',
    subTitle: 'Single-edition ERC721 collection droposal',
    icon: 'collection',
    iconBackdrop: `color-mix(in srgb, ${color.accent} 10%, transparent)`,
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
    iconBackdrop: `color-mix(in srgb, ${color.warning} 10%, transparent)`,
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
    iconBackdrop: `color-mix(in srgb, ${color.warning} 10%, transparent)`,
  },
  [TransactionType.REPLACE_ARTWORK]: {
    title: 'Replace Artwork',
    subTitle: 'Replace existing artwork in your collection',
    icon: 'brush',
    iconBackdrop: `color-mix(in srgb, ${color.warning} 10%, transparent)`,
  },
  [TransactionType.ADD_ARTWORK]: {
    title: 'Add Artwork',
    subTitle: 'Add new artwork to your collection',
    icon: 'brush',
    iconBackdrop: `color-mix(in srgb, ${color.warning} 10%, transparent)`,
  },
  [TransactionType.CUSTOM]: {
    title: 'Custom Transaction',
    subTitle: 'Any other type of transaction',
    icon: 'code-brackets',
    iconBackdrop: color.ghostHover,
    iconFill: 'icon1',
  },
  [TransactionType.MIGRATION]: {
    title: 'Migration',
    subTitle: 'Migrate from L1 to L2',
    icon: 'migrate',
    iconBackdrop: `color-mix(in srgb, ${color.warning} 10%, transparent)`,
  },
  [TransactionType.WALLET_CONNECT]: {
    title: 'WalletConnect',
    subTitle: 'Connect to dApps and execute transactions via WalletConnect',
    icon: 'walletConnectOutline',
    iconBackdrop: `color-mix(in srgb, ${color.accent} 10%, transparent)`,
  },
  [TransactionType.PIN_TREASURY_ASSET]: {
    title: 'Pin Treasury Asset',
    subTitle: 'Whitelist a token or NFT for prominent display in treasury',
    icon: 'pin',
    iconBackdrop: `color-mix(in srgb, ${color.warning} 10%, transparent)`,
    iconFill: 'warning',
  },
  [TransactionType.STREAM_TOKENS]: {
    title: 'Stream Tokens',
    subTitle: 'Continuous token payments over time',
    icon: 'sablier',
    iconBackdrop: `color-mix(in srgb, ${color.warning} 10%, transparent)`,
  },
  [TransactionType.AIRDROP_TOKENS]: {
    title: 'Airdrop Tokens',
    subTitle: 'Distribute tokens with Sablier merkle campaigns',
    icon: 'airdropSablier',
    iconBackdrop: `color-mix(in srgb, ${color.warning} 10%, transparent)`,
  },
  [TransactionType.CREATOR_COIN]: {
    title: 'Creator Coin',
    subTitle: 'Create a proposal to mint Creator Coin',
    icon: 'creatorCoin',
    iconBackdrop: `color-mix(in srgb, ${color.accent} 10%, transparent)`,
  },
  [TransactionType.CONTENT_COIN]: {
    title: 'Content Coin',
    subTitle: 'Create a proposal to mint Content Coin',
    icon: 'contentCoin',
    iconBackdrop: `color-mix(in srgb, ${color.accent} 10%, transparent)`,
  },
}
