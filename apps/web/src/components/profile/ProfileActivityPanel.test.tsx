import type { FeedItem } from '@buildeross/types'
import { fireEvent, render, screen, within } from '@testing-library/react'
import {
  activityDaoMeta,
  activityDaoNameRow,
  activityRowContent,
  activityVoteAgainst,
  activityVoteFor,
  profileDashboardSurface,
} from 'src/styles/profile.css'

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
  it('renders DAO and chain logo above the date on the right side of the card', () => {
    render(<ProfileActivityPanel profileAddress={profileAddress} selectedDaoKeys={[]} />)

    const row = screen.getByRole('link', { name: /Bid on Token 1/ })
    const activityDetails = row.querySelector<HTMLElement>(`.${activityRowContent}`)
    const daoMetadata = row.querySelector<HTMLElement>(`.${activityDaoMeta}`)
    expect(activityDetails).not.toBeNull()
    expect(daoMetadata).not.toBeNull()
    if (!activityDetails || !daoMetadata)
      throw new Error('Expected activity row metadata')

    const daoName = within(daoMetadata).getByText('Test DAO')
    const chainLogo = within(daoMetadata).getByRole('img', {
      name: 'Ethereum network',
    })

    expect(daoMetadata).toBeVisible()
    expect(daoName.parentElement).toHaveClass(activityDaoNameRow)
    expect(daoName.parentElement).toContainElement(chainLogo)
    expect(daoMetadata.lastElementChild).not.toBe(daoName.parentElement)
    expect(activityDetails).toHaveTextContent('1 ETH')
    expect(daoMetadata).not.toHaveTextContent('1 ETH')
    expect(within(row).queryByText('Ethereum')).not.toBeInTheDocument()
  })

  it('labels proposal votes as for or against with semantic colors', () => {
    render(
      <ProfileActivityPanel
        profileAddress={profileAddress}
        selectedDaoKeys={[]}
        extraItems={[vote('FOR', '1'), vote('AGAINST', '2')]}
      />
    )

    const forRow = screen.getByRole('link', { name: /FOR proposal/ })
    const againstRow = screen.getByRole('link', { name: /AGAINST proposal/ })

    expect(within(forRow).getByText('For')).toHaveClass(activityVoteFor)
    expect(within(againstRow).getByText('Against')).toHaveClass(activityVoteAgainst)
  })

  it('renders one unified activity region and offers all seven activity kinds', () => {
    render(
      <ProfileActivityPanel
        profileAddress={profileAddress}
        selectedDaoKeys={[]}
        extraItems={[vote('FOR', '1')]}
      />
    )

    expect(screen.getByRole('heading', { name: 'Activity' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Activity' })).toHaveClass(
      profileDashboardSurface
    )
    expect(screen.getByRole('link', { name: /Bid on Token 1/ })).toBeVisible()
    expect(screen.getByRole('link', { name: /FOR proposal/ })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Filter activity' }))
    expect(
      screen.getAllByRole('checkbox').map((checkbox) => checkbox.getAttribute('name'))
    ).toHaveLength(7)
    ;[
      'Bids',
      'Wins',
      'Settles',
      'Proposal creation',
      'Votes',
      'Proposal updates',
      'Executions',
    ].forEach((label) =>
      expect(screen.getByRole('checkbox', { name: label })).toBeVisible()
    )
  })
})
