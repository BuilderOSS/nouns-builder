import { fireEvent, render, screen, within } from '@testing-library/react'
import { profileDaoListViewport } from 'src/styles/profile.css'

import { ProfileDaoList } from './ProfileDaoList'

const updateDaoVisibilityAndOrder = vi.fn()
const persistOrderedDaos = vi.fn()

vi.mock('src/hooks/useDaoListPreferences', () => ({
  getDaoListPreferenceItemKey: (chainId: number, address: string) =>
    `${chainId}:${address.toLowerCase()}`,
  useDaoListPreferences: () => ({
    isDaoHidden: () => false,
    persistOrderedDaos,
    sortDaos: (daos: unknown[]) => daos,
    updateDaoVisibilityAndOrder,
  }),
}))
vi.mock('@buildeross/ui/Avatar', () => ({ DaoAvatar: () => <span /> }))
vi.mock('next/image', () => ({ default: () => <span /> }))
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('ProfileDaoList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps DAO name navigation isolated from the card filter without favorites', () => {
    const onDaoClick = vi.fn()
    render(
      <ProfileDaoList
        daos={[
          {
            name: 'Test DAO',
            chainId: 1,
            collectionAddress: '0xDao',
            auctionAddress: '0xAuction',
          },
        ]}
        activeDaoKeys={['1:0xdao']}
        isOwnProfile={false}
        onDaoClick={onDaoClick}
        userAddress="0xProfile"
      />
    )

    expect(screen.queryByRole('button', { name: /Favorite Test DAO/ })).toBeNull()

    const daoLink = screen.getByRole('link', { name: 'Test DAO' })
    expect(daoLink).toHaveAttribute('href', '/dao/ethereum/0xDao')
    daoLink.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(daoLink)
    expect(onDaoClick).not.toHaveBeenCalled()

    const filterButton = screen.getByRole('button', {
      name: 'Filter activity by Test DAO',
    })
    expect(filterButton).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(filterButton)
    expect(onDaoClick).toHaveBeenCalledTimes(1)

    expect(screen.getByRole('heading', { name: 'DAOs', level: 2 })).toBeVisible()
    const infoButton = screen.getByLabelText('How DAO cards work')
    expect(infoButton).toHaveAttribute('tabindex', '0')
    fireEvent.focus(infoButton)
    expect(
      screen.getByText(
        'Click a card to filter Activity. Click the DAO name to open its DAO page.'
      )
    ).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('keeps owner-only hide and reorder actions isolated from the DAO filter', () => {
    const onDaoClick = vi.fn()
    render(
      <ProfileDaoList
        daos={[
          {
            name: 'Test DAO',
            chainId: 1,
            collectionAddress: '0xDao',
            auctionAddress: '0xAuction',
          },
          {
            name: 'Second DAO',
            chainId: 8453,
            collectionAddress: '0xSecondDao',
            auctionAddress: '0xSecondAuction',
          },
        ]}
        isOwnProfile
        onDaoClick={onDaoClick}
        userAddress="0xConnected"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

    const viewport = screen.getByTestId('profile-dao-list-viewport')
    expect(viewport).toHaveClass(profileDaoListViewport)
    expect(screen.getByRole('button', { name: 'Done' })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Hide Test DAO' }))
    fireEvent.keyDown(screen.getByRole('button', { name: 'Drag to reorder Test DAO' }), {
      key: 'ArrowDown',
    })

    expect(updateDaoVisibilityAndOrder).toHaveBeenCalled()
    expect(persistOrderedDaos).toHaveBeenCalled()
    expect(onDaoClick).not.toHaveBeenCalled()
  })

  it('exposes DAO overflow as a keyboard-scrollable list when more than five rows render', () => {
    render(
      <ProfileDaoList
        daos={Array.from({ length: 6 }, (_, index) => ({
          name: `DAO ${index + 1}`,
          chainId: 1,
          collectionAddress: `0xDao${index + 1}`,
          auctionAddress: `0xAuction${index + 1}`,
        }))}
        isOwnProfile={false}
        onDaoClick={vi.fn()}
        userAddress="0xProfile"
      />
    )

    const viewport = screen.getByRole('region', { name: 'DAO list' })
    expect(viewport).toHaveAttribute('tabindex', '0')
    expect(
      within(viewport).getAllByRole('button', { name: /Filter activity by DAO/ })
    ).toHaveLength(6)
  })
})
