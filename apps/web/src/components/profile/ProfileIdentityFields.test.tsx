import { render, screen } from '@testing-library/react'

import { ProfileIdentityFields } from './ProfileIdentityFields'

describe('ProfileIdentityFields', () => {
  it('renders only supported identity URLs and places links before the bio', () => {
    render(
      <ProfileIdentityFields
        identity={{
          bio: 'Builder and collector',
          website: { href: 'https://example.com', label: 'example.com' },
          x: { handle: 'builder', url: 'https://x.com/builder', label: '@builder' },
          farcaster: {
            handle: 'builder',
            url: 'https://warpcast.com/builder',
            label: '@builder',
          },
        }}
      />
    )

    const website = screen.getByRole('link', { name: 'Open example.com' })
    const bio = screen.getByText('Builder and collector')

    expect(website).toHaveAttribute('href', 'https://example.com')
    expect(screen.getByRole('link', { name: 'Open @builder on X' })).toHaveAttribute(
      'href',
      'https://x.com/builder'
    )
    expect(
      screen.getByRole('link', { name: 'Open @builder on Farcaster' })
    ).toHaveAttribute('href', 'https://warpcast.com/builder')
    expect(website.compareDocumentPosition(bio) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
  })

  it('does not invent links when no supported identity data exists', () => {
    const { container } = render(<ProfileIdentityFields identity={{}} />)

    expect(container).toBeEmptyDOMElement()
  })
})
