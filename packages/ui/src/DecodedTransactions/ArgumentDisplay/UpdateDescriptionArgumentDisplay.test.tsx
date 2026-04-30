import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { UpdateDescriptionArgumentDisplay } from './UpdateDescriptionArgumentDisplay'

describe('UpdateDescriptionArgumentDisplay', () => {
  it('renders parsed links and markdown description from frontmatter payload', () => {
    const value =
      '---\\nlinks:\\n github: https://github.com\\n x: https://twitter.com\\n---\\n\\n### This is a TEST DAO\\n\\nplease do not use this for prod\\n\\n![](https://images.unsplash.com/photo-1775840535417-71811b19db5a)\\n\\nlets go!'

    render(
      <UpdateDescriptionArgumentDisplay
        arg={{
          name: '_newDescription',
          type: 'string',
          value,
        }}
      />
    )

    expect(screen.getByText('_newDescription:')).toBeInTheDocument()

    const githubLink = screen.getByRole('link', { name: 'https://github.com/' })
    expect(githubLink).toHaveAttribute('href', 'https://github.com/')

    const xLink = screen.getByRole('link', { name: 'https://twitter.com/' })
    expect(xLink).toHaveAttribute('href', 'https://twitter.com/')

    expect(screen.getByText('github:')).toBeInTheDocument()
    expect(screen.getByText('x:')).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: 'This is a TEST DAO' })
    ).toBeInTheDocument()
    expect(screen.getByText('please do not use this for prod')).toBeInTheDocument()
    expect(screen.getByText('lets go!')).toBeInTheDocument()
  })

  it('falls back to plain rendering for non-frontmatter content', () => {
    const value = 'Just a plain description string'

    render(
      <UpdateDescriptionArgumentDisplay
        arg={{
          name: '_newDescription',
          type: 'string',
          value,
        }}
      />
    )

    expect(screen.getByText('_newDescription:')).toBeInTheDocument()
    expect(screen.getByText('Just a plain description string')).toBeInTheDocument()
  })
})
