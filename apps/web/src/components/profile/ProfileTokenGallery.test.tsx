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
  partialChainNames: [],
  onRetry: vi.fn(),
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

    expect(screen.getByRole('heading', { level: 3, name: 'Tokens held' })).toBeVisible()
  })

  it('keeps native single-select semantics while matching activity controls', () => {
    const onSortChange = vi.fn()
    render(<ProfileTokenGallery {...props} onSortChange={onSortChange} />)

    const select = screen.getByRole('combobox', { name: 'Sort tokens' })
    expect(select).toHaveClass(compactFilterControl)
    expect(select).toHaveValue('newest')
    expect(select.parentElement?.querySelector('[aria-hidden="true"]')).toBeTruthy()

    fireEvent.change(select, { target: { value: 'oldest' } })
    expect(onSortChange).toHaveBeenCalledWith('oldest')
  })

  it('shows the token chain as a bottom-right logo instead of metadata text', () => {
    render(<ProfileTokenGallery {...props} tokens={[tokens[0]]} />)

    const chainLogo = screen.getByRole('img', { name: 'Ethereum network' })
    const cardBody = screen.getByText('Test DAO').parentElement

    expect(cardBody).toContainElement(chainLogo)
    expect(cardBody?.lastElementChild).toContainElement(chainLogo)
    expect(cardBody).not.toHaveTextContent('Ethereum')
  })

  it('locks the initial gallery height while appending tokens and resets on sort', () => {
    const { rerender } = render(<ProfileTokenGallery {...props} />)
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
