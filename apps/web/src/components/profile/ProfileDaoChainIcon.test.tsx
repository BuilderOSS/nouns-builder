import type { MyDaosResponse } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { fireEvent, render, screen } from '@testing-library/react'
import { profileDaoSurface, profileDashboardSurface } from 'src/styles/profile.css'

import {
  getProfileDaoChainMetadata,
  ProfileDaoChainIcon,
  ProfileDaoSelector,
} from './ProfileDaoSelector'

const profileDaoListSpy = vi.fn()

vi.mock('src/components/ProfileDaoList', () => ({
  ProfileDaoList: (props: Record<string, unknown>) => {
    profileDaoListSpy(props)
    return (
      <button
        type="button"
        onClick={() =>
          (props.onDaoClick as (dao: MyDaosResponse[number]) => void)(
            (props.daos as MyDaosResponse)[0]
          )
        }
      >
        Filter Base DAO
      </button>
    )
  },
}))

vi.mock('wagmi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('wagmi')>()),
  useAccount: () => ({ address: '0xabc' }),
}))

vi.mock('next/image', () => ({
  default: ({ alt, src, title }: { alt: string; src: string; title: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} title={title} />
  ),
}))

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
  })

  it('renders the actual network name accessibly', () => {
    render(<ProfileDaoChainIcon chainId={8453} />)
    expect(screen.getByRole('img', { name: 'Base network' })).toHaveAttribute(
      'src',
      '/chains/base.svg'
    )
  })
})

describe('ProfileDaoSelector', () => {
  it('reuses the preference-aware single-column DAO list and wires query selection', () => {
    const onToggle = vi.fn()
    render(
      <ProfileDaoSelector
        daos={daos}
        isLoading={false}
        profileAddress="0xabc"
        selectedKeys={[]}
        onToggle={onToggle}
        onClear={vi.fn()}
      />
    )

    expect(profileDaoListSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        daos,
        userAddress: '0xabc',
        isOwnProfile: true,
        activeDaoKeys: [],
      })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Filter Base DAO' }))
    expect(onToggle).toHaveBeenCalledWith(
      '8453:0xdaa0000000000000000000000000000000000000'
    )
  })

  it('shows populated fallback DAOs while SWR revalidates', () => {
    render(
      <ProfileDaoSelector
        daos={daos}
        isLoading
        profileAddress="0xabc"
        selectedKeys={[]}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />
    )

    expect(screen.queryByLabelText('Loading DAOs')).not.toBeInTheDocument()
    expect(profileDaoListSpy).toHaveBeenCalledWith(expect.objectContaining({ daos }))
    expect(screen.getByRole('region', { name: 'DAOs' })).toHaveClass(
      profileDashboardSurface,
      profileDaoSurface
    )
  })

  it('keeps DAO editing owner-only', () => {
    render(
      <ProfileDaoSelector
        daos={daos}
        isLoading={false}
        profileAddress="0xdef"
        selectedKeys={[]}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />
    )

    expect(profileDaoListSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ isOwnProfile: false })
    )
  })
})
