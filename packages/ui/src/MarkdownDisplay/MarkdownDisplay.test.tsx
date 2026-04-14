import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { MarkdownDisplay } from './MarkdownDisplay'

describe('MarkdownDisplay', () => {
  it('does not render leading YAML frontmatter', () => {
    render(
      <MarkdownDisplay>{`---
links:
  github: https://github.com/random
  twitter: https://twitter.com/random
---

Other text goes here`}</MarkdownDisplay>
    )

    expect(screen.queryByText('links:')).not.toBeInTheDocument()
    expect(screen.queryByText(/github:/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/twitter:/i)).not.toBeInTheDocument()
    expect(screen.getByText('Other text goes here')).toBeInTheDocument()
  })

  it('renders markdown content without frontmatter as-is', () => {
    render(<MarkdownDisplay>{'Hello **world**'}</MarkdownDisplay>)

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('world')).toBeInTheDocument()
  })
})
