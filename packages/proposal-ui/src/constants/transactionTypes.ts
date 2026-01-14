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
  [TransactionType.RELEASE_ESCROW_MILESTONE]: {
    title: 'Release Escrow Milestone',
    subTitle: 'Create a proposal to release escrow milestone',
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
  [TransactionType.UPDATE_MINTER]: {
    title: 'Update Minter',
    subTitle: 'Create a proposal to update the minter',
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
    iconFill: 'icon1',
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
  [TransactionType.PIN_TREASURY_ASSET]: {
    title: 'Pin Treasury Asset',
    subTitle: 'Whitelist a token or NFT for prominent display in treasury',
    icon: 'pin',
    iconBackdrop: 'rgba(236, 113, 75, 0.1)',
    iconFill: 'warning',
  },
}
