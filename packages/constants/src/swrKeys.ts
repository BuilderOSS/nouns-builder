export const SWR_KEYS = {
  AUCTION_BIDS: 'auction-bids',
  ARTWORK_PROPERTY_ITEMS_COUNT: 'artwork-property-items-count',
  SNAPSHOT_SUPPLY: 'snapshot-supply',
  AVERAGE_WINNING_BID: 'average-winning-bid',
  ETH_USD: 'eth-usd-price',
  TREASURY_SALES: 'treasury-sales',
  NFT_COUNT: 'nft-count',
  PROFILE_DAOS: 'profile-daos',
  PROFILE_TOKENS: 'profile-tokens',
  PROPOSAL: 'proposal',
  PROPDATES: 'propdates',
  PROPOSALS: 'proposals',
  PROPOSALS_CALLDATAS: 'proposals-calldatas',
  PROPOSALS_TRANSACTIONS: 'proposal-transaction-data',
  DECODED_TRANSACTION: 'decoded-transaction',
  ENS: 'ens',
  EXPLORE: 'explore',
  FEATURED: 'featured',
  TOKEN: 'token',
  AUCTION: 'auction',
  DAO_INFO: 'dao-info',
  DAO_FEED: 'dao-feed',
  MEMBERS: 'members',
  TOKEN_IMAGE: 'token-image',
  DASHBOARD: 'dashboard',
  DAO_MEMBERSHIP: 'dao-membership',
  TOKEN_BALANCES: 'token-balances',
  TOKEN_METADATA: 'token-metadata',
  NFT_BALANCES: 'nft-balances',
  NFT_METADATA: 'nft-metadata',
  METADATA_ATTRIBUTES_MERKLE_ROOT: 'metadata-attributes-merkle-root',
  TOKEN_HOLDERS_MERKLE_ROOT: 'token-holders-merkle-root',
  ENCODED_DAO_METADATA: 'encoded-dao-metadata',
  DAO_MIGRATED: 'dao-migrated',
  DAO_NEXT_AND_PREVIOUS_TOKENS: 'dao-next-and-previous-tokens',
  ESCROW_MILESTONES_IPFS_DATA: 'escrow-milestones-ipfs-data',
  INVOICE_LOG_NEW_INVOICE: 'invoice-log-new-invoice',
  DYNAMIC: {
    MY_DAOS(str: string) {
      return `my-daos-${str}`
    },
    MY_DAOS_PAGE(str: string) {
      return `my-daos-page-${str}`
    },
  },
}

export default SWR_KEYS
