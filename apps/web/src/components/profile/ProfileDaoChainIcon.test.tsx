import type { MyDaosResponse } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { fireEvent, render, screen } from '@testing-library/react'
import { daoSelectorChainBadge } from 'src/styles/profile.css'

import {
  getProfileDaoChainMetadata,
  ProfileDaoChainIcon,
  ProfileDaoSelector,
} from './ProfileDaoSelector'

vi.mock('@buildeross/ui/Avatar', () => ({
  DaoAvatar: () => <span aria-label="DAO avatar" />,
}))

vi.mock('next/image', () => ({
  default: ({ alt, src, title }: { alt: string; src: string; title: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} title={title} />
  ),
}))

describe('ProfileDaoChainIcon', () => {
  it('maps each membership chain id to its own project chain asset', () => {
    expect(getProfileDaoChainMetadata(1)).toMatchObject({
      name: 'Ethereum',
      icon: '/chains/ethereum.svg',
    })
    expect(getProfileDaoChainMetadata(8453)).toMatchObject({
      name: 'Base',
      icon: '/chains/base.svg',
    })
    expect(getProfileDaoChainMetadata(10)).toMatchObject({
      name: 'OP Mainnet',
      icon: '/chains/optimism.svg',
    })
  })

  it('renders the actual network name accessibly', () => {
    render(<ProfileDaoChainIcon chainId={8453} />)

    expect(screen.getByRole('img', { name: 'Base network' })).toHaveAttribute(
      'src',
      '/chains/base.svg'
    )
  })

  it('uses a neutral accessible fallback for an unknown chain', () => {
    render(<ProfileDaoChainIcon chainId={999999} />)

    expect(screen.getByRole('img', { name: 'Unknown chain 999999' })).toHaveTextContent(
      '?'
    )
  })

  it('positions the network badge at the card edge outside the name block', () => {
    const daos: MyDaosResponse = [
      {
        name: 'Base DAO',
        contractImage: '',
        collectionAddress: '0xDaa0000000000000000000000000000000000000',
        metadataAddress: '0xDab0000000000000000000000000000000000000',
        treasuryAddress: '0xDac0000000000000000000000000000000000000',
        governorAddress: '0xDad0000000000000000000000000000000000000',
        auctionAddress: '0xDae0000000000000000000000000000000000000',
        chainId: CHAIN_ID.BASE,
      },
    ]

    render(
      <ProfileDaoSelector
        daos={daos}
        isLoading={false}
        selectedKeys={['8453:0xdaa0000000000000000000000000000000000000']}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />
    )

    const filterButton = screen.getByRole('button', {
      name: 'Filter activity by Base DAO',
    })
    const card = filterButton.parentElement
    const badge = screen.getByRole('img', { name: 'Base network' }).parentElement
    const name = screen.getByText('Base DAO')

    expect(badge).toHaveClass(daoSelectorChainBadge)
    expect(name.parentElement).not.toContainElement(badge)
    expect(card).toContainElement(badge)
  })

  it('opens the DAO name separately while the rest of the card toggles its filter', () => {
    const onToggle = vi.fn()
    const daos: MyDaosResponse = [
      {
        name: 'Base DAO',
        contractImage: '',
        collectionAddress: '0xDaa0000000000000000000000000000000000000',
        metadataAddress: '0xDab0000000000000000000000000000000000000',
        treasuryAddress: '0xDac0000000000000000000000000000000000000',
        governorAddress: '0xDad0000000000000000000000000000000000000',
        auctionAddress: '0xDae0000000000000000000000000000000000000',
        chainId: CHAIN_ID.BASE,
      },
    ]

    render(
      <ProfileDaoSelector
        daos={daos}
        isLoading={false}
        selectedKeys={[]}
        onToggle={onToggle}
        onClear={vi.fn()}
      />
    )

    const link = screen.getByRole('link', { name: 'Base DAO' })
    expect(link).toHaveAttribute(
      'href',
      '/dao/base/0xDaa0000000000000000000000000000000000000'
    )
    expect(link).toHaveAttribute('target', '_blank')

    fireEvent.click(link)
    expect(onToggle).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Filter activity by Base DAO' }))
    expect(onToggle).toHaveBeenCalledWith(
      '8453:0xdaa0000000000000000000000000000000000000'
    )
  })

  it('explains the DAO card link and filter controls', () => {
    render(
      <ProfileDaoSelector
        daos={[]}
        isLoading={false}
        selectedKeys={[]}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'How DAO cards work' })).toHaveAttribute(
      'aria-describedby',
      'profile-dao-card-help'
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Select a DAO name to open its page. Select anywhere else on a card to filter the profile.'
    )
  })
})
