import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

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
})
