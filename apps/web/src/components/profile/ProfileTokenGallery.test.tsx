import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { compactFilterControl } from 'src/styles/profile.css'
import type { ProfileToken } from 'src/utils/profileDashboard'

import { ProfileTokenGallery } from './ProfileTokenGallery'

vi.mock('@buildeross/ui/FallbackImage', () => ({
  FallbackImage: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}))

vi.mock('next/link', () => {
  const MockNextLink = React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(
    ({ children, href, ...props }, ref) => (
      <a ref={ref} href={href} {...props}>
        {children}
      </a>
    )
  )
  MockNextLink.displayName = 'MockNextLink'
  return { default: MockNextLink }
})

vi.mock('next/image', () => ({
  default: ({ alt, src, title }: { alt: string; src: string; title: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} title={title} />
  ),
}))

vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    useConfig: () => ({}),
  }
})

vi.mock('wagmi/actions', () => ({
  simulateContract: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
  writeContract: vi.fn(),
}))

const tokens: ProfileToken[] = Array.from({ length: 40 }, (_, index) => ({
  chainId: 1,
  chainSlug: 'ethereum',
  chainName: 'Ethereum',
  tokenId: String(index + 1),
  tokenContract: '0xDaa0000000000000000000000000000000000000',
  name: `Token ${index + 1}`,
  image: '',
  mintedAt: String(index + 1),
  daoName: 'Test DAO',
  daoSymbol: 'TEST',
}))

const props = {
  tokens,
  isLoading: false,
  selectedDaoKeys: [],
  sort: 'newest' as const,
  onSortChange: vi.fn(),
  failedChainNames: [],
  truncatedChainNames: [],
  onRetry: vi.fn(),
  onExpand: vi.fn(),
}

describe('ProfileTokenGallery', () => {
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      right: 800,
      bottom: 640,
      left: 0,
      width: 800,
      height: 640,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      }
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('uses an h3 for the dashboard section heading', () => {
    render(<ProfileTokenGallery {...props} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Tokens' })).toBeVisible()
  })

  it('requests token data only when the collapsed section is expanded', () => {
    const onExpand = vi.fn()
    render(<ProfileTokenGallery {...props} tokens={[]} onExpand={onExpand} />)

    expect(screen.queryByRole('region', { name: 'Tokens held gallery' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Expand tokens section' }))

    expect(onExpand).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Collapse tokens section' })).toBeVisible()
  })

  it('keeps native single-select semantics while matching activity controls', () => {
    const onSortChange = vi.fn()
    render(<ProfileTokenGallery {...props} onSortChange={onSortChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Expand tokens section' }))

    const select = screen.getByRole('combobox', { name: 'Sort tokens' })
    expect(select).toHaveClass(compactFilterControl)
    expect(select).toHaveValue('newest')
    expect(select.parentElement?.querySelector('[aria-hidden="true"]')).toBeTruthy()

    fireEvent.change(select, { target: { value: 'oldest' } })
    expect(onSortChange).toHaveBeenCalledWith('oldest')
  })

  it('shows the token chain as a bottom-right logo instead of metadata text', () => {
    render(<ProfileTokenGallery {...props} tokens={[tokens[0]]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Expand tokens section' }))

    const chainLogo = screen.getByRole('img', { name: 'Ethereum network' })
    const card = screen.getByRole('link', { name: /Token 1/ })

    expect(card).toContainElement(chainLogo)
    expect(card).not.toHaveTextContent('Ethereum')
    expect(card).toBeVisible()
    expect(card.closest('li')).not.toBeNull()
  })

  it('keeps token navigation available while showing owner transfer selectors', () => {
    render(<ProfileTokenGallery {...props} tokens={[tokens[0]]} canTransferTokens />)
    fireEvent.click(screen.getByRole('button', { name: 'Expand tokens section' }))

    const card = screen.getByRole('link', { name: /Token 1/ })
    const selector = screen.getByRole('button', {
      name: 'Select Token 1 #1 for transfer',
    })

    expect(card).toHaveAttribute(
      'href',
      '/dao/ethereum/0xDaa0000000000000000000000000000000000000/1'
    )
    expect(card).not.toBe(selector)

    fireEvent.click(selector)

    expect(selector).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: 'Deselect Token 1 #1 for transfer' })
    ).toBeVisible()
  })

  it('labels the entry transfer action as continue', () => {
    render(
      <ProfileTokenGallery
        {...props}
        tokens={[tokens[0]]}
        canTransferTokens
        profileAddress="0x00000000000000000000000000000000000000aa"
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Expand tokens section' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Select Token 1 #1 for transfer' })
    )
    fireEvent.change(screen.getByPlaceholderText('ENS or wallet address'), {
      target: { value: '0x00000000000000000000000000000000000000aa' },
    })

    expect(screen.getByRole('button', { name: 'Continue' })).toBeVisible()
  })

  it('locks the initial gallery height while appending tokens and resets on sort', () => {
    const { rerender } = render(<ProfileTokenGallery {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Expand tokens section' }))
    const gallery = screen.getByRole('region', { name: 'Tokens held gallery' })

    expect(screen.getAllByRole('listitem')).toHaveLength(32)
    expect(gallery).not.toHaveAttribute('tabindex')

    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))

    expect(screen.getAllByRole('listitem')).toHaveLength(40)
    expect(gallery).toHaveStyle({ height: '640px' })
    expect(gallery).toHaveAttribute('tabindex', '0')

    rerender(<ProfileTokenGallery {...props} sort="oldest" />)

    expect(screen.getAllByRole('listitem')).toHaveLength(32)
    expect(gallery).not.toHaveStyle({ height: '640px' })
    expect(gallery).not.toHaveAttribute('tabindex')
  })
})
