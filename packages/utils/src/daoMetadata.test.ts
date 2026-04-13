import { describe, expect, it } from 'vitest'

import { parseDaoMetadataString, serializeDaoMetadata } from './daoMetadata'

describe('parseDaoMetadataString', () => {
  it('parses markdown frontmatter links', () => {
    const parsed = parseDaoMetadataString(
      '---\nlinks:\n  twitter: https://x.com/nouns\n  github: https://github.com/nouns\n---\n\ndao description'
    )

    expect(parsed.description).toBe('dao description')
    expect(parsed.links).toEqual({
      x: 'https://x.com/nouns',
      github: 'https://github.com/nouns',
    })
  })

  it('ignores invalid links in frontmatter', () => {
    const parsed = parseDaoMetadataString(
      '---\nlinks:\n  docs: https://docs.example.com\n  bad: javascript:alert(1)\n---\n\nbody'
    )

    expect(parsed.description).toBe('body')
    expect(parsed.links).toEqual({
      docs: 'https://docs.example.com',
    })
  })

  it('parses escaped frontmatter payloads from contract storage', () => {
    const parsed = parseDaoMetadataString(
      '---\\nlinks:\\n  github: https://github.com\\n  x: https://twitter.com\\n---\\n\\nhello world'
    )

    expect(parsed.description).toBe('hello world')
    expect(parsed.links).toEqual({
      github: 'https://github.com',
      x: 'https://twitter.com',
    })
  })

  it('falls back to plain description text', () => {
    const parsed = parseDaoMetadataString('legacy description')

    expect(parsed.description).toBe('legacy description')
    expect(parsed.links).toEqual({})
  })
})

describe('serializeDaoMetadata', () => {
  it('serializes to frontmatter markdown', () => {
    const serialized = serializeDaoMetadata('The main description', [
      { key: 'twitter', url: 'https://x.com/nouns' },
      { key: 'github', url: 'https://github.com/nouns' },
    ])

    expect(serialized).toBe(
      '---\nlinks:\n  x: https://x.com/nouns\n  github: https://github.com/nouns\n---\n\nThe main description'
    )
  })
})
