import { FeedEventType } from '@buildeross/sdk/subgraph'
import type { FeedItem } from '@buildeross/types'
import { render, screen, within } from '@testing-library/react'
import { activityVoteAgainst, activityVoteFor } from 'src/styles/profile.css'

import { ProfileActivityPanel } from './ProfileActivityPanel'

const profileAddress = '0xAbC0000000000000000000000000000000000000'
const bid = {
  id: 'bid-1',
  type: 'AUCTION_BID_PLACED',
  daoId: '0xDaa0000000000000000000000000000000000000',
  addresses: {
    token: '0xDaa0000000000000000000000000000000000000',
    auction: '0xAaa0000000000000000000000000000000000000',
    treasury: '0xBbb0000000000000000000000000000000000000',
    metadata: '0xCcc0000000000000000000000000000000000000',
    governor: '0xEee0000000000000000000000000000000000000',
  },
  daoName: 'Test DAO',
  daoSymbol: 'TEST',
  daoImage: '',
  chainId: 1,
  timestamp: 1,
  actor: profileAddress,
  txHash: '0x01',
  blockNumber: 1,
  auctionId: 'auction-1',
  tokenId: '1',
  bidder: profileAddress,
  amount: '1000000000000000000',
  tokenName: 'Token 1',
  tokenImage: '',
} as FeedItem

const vote = (support: 'FOR' | 'AGAINST', id: string): FeedItem =>
  ({
    id,
    type: 'PROPOSAL_VOTED',
    daoId: '0xDaa0000000000000000000000000000000000000',
    addresses: bid.addresses,
    daoName: 'Test DAO',
    daoSymbol: 'TEST',
    daoImage: '',
    chainId: 1,
    timestamp: 2,
    actor: profileAddress,
    txHash: '0x02',
    blockNumber: 2,
    proposalId: '0x03',
    proposalNumber: id,
    proposalTitle: `${support} proposal`,
    proposalDescription: '',
    proposalTimeCreated: '1',
    proposer: '0xDef0000000000000000000000000000000000000',
    voter: profileAddress,
    support,
    weight: '1',
  }) as FeedItem

vi.mock('@buildeross/hooks', () => ({
  useFeed: () => ({
    items: [bid],
    hasMore: false,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    fetchNextPage: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@buildeross/ui/LinksProvider', () => ({
  useLinks: () => ({
    getAuctionLink: () => ({ href: '/auction' }),
    getProposalLink: () => ({ href: '/proposal' }),
  }),
}))

vi.mock('@buildeross/ui/FallbackImage', () => ({
  FallbackImage: () => <span aria-hidden="true" />,
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('ProfileActivityPanel', () => {
  it('omits chain name and its adjacent separator from visible metadata', () => {
    render(
      <ProfileActivityPanel
        title="Auction activity"
        group="auction"
        profileAddress={profileAddress}
        eventTypes={[FeedEventType.AuctionBidPlaced]}
        selectedDaoKeys={[]}
      />
    )

    const row = screen.getByRole('link', { name: /Bid on Token 1/ })
    expect(within(row).getByText('Test DAO')).toBeVisible()
    expect(within(row).queryByText('Ethereum')).not.toBeInTheDocument()
    expect(row).toHaveTextContent(/Test DAO.*1 ETH/)
    expect(row).not.toHaveTextContent(/Test DAO.*Ethereum/)
  })

  it('labels proposal votes as for or against with semantic colors', () => {
    render(
      <ProfileActivityPanel
        title="Governance activity"
        group="governance"
        profileAddress={profileAddress}
        eventTypes={[FeedEventType.ProposalVoted]}
        selectedDaoKeys={[]}
        extraItems={[vote('FOR', '1'), vote('AGAINST', '2')]}
      />
    )

    const forRow = screen.getByRole('link', { name: /FOR proposal/ })
    const againstRow = screen.getByRole('link', { name: /AGAINST proposal/ })

    expect(within(forRow).getByText('For')).toHaveClass(activityVoteFor)
    expect(within(againstRow).getByText('Against')).toHaveClass(activityVoteAgainst)
  })
})
