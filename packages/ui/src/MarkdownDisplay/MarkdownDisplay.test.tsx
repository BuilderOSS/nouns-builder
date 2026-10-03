import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../FallbackImage', () => ({
  FallbackImage: ({ src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={props.alt ?? ''} data-testid="fallback-image" src={src} {...props} />
  ),
}))

import { MarkdownDisplay } from './MarkdownDisplay'

describe('MarkdownDisplay', () => {
  it('renders leading YAML frontmatter verbatim', () => {
    const { container } = render(
      <MarkdownDisplay>{`---
links:
  github: https://github.com/random
  twitter: https://twitter.com/random
---

Other text goes here`}</MarkdownDisplay>
    )

    expect(container.textContent).toContain('links:')
    expect(container.textContent).toContain('github: https://github.com/random')
    expect(container.textContent).toContain('twitter: https://twitter.com/random')
    expect(screen.getByText('Other text goes here')).toBeInTheDocument()
  })

  it('renders markdown content without frontmatter as-is', () => {
    const { container } = render(<MarkdownDisplay>{'Hello **world**'}</MarkdownDisplay>)

    expect(container.textContent).toContain('Hello world')
  })

  it('uses FallbackImage for IPFS images', () => {
    const cid = 'bafkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq'

    render(<MarkdownDisplay>{`![IPFS image](ipfs://${cid})`}</MarkdownDisplay>)

    expect(screen.getByTestId('fallback-image')).toHaveAttribute('src', `ipfs://${cid}`)
  })

  it('uses a regular image for non-IPFS images', () => {
    render(
      <MarkdownDisplay>
        {'![External image](https://example.com/image.png)'}
      </MarkdownDisplay>
    )

    expect(screen.getByRole('img', { name: 'External image' })).not.toHaveAttribute(
      'data-testid',
      'fallback-image'
    )
  })
})
