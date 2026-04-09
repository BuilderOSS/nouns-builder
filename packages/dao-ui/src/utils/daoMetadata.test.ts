import { describe, expect, it } from 'vitest'

import { parseDaoMetadataString } from './daoMetadata'

describe('parseDaoMetadataString', () => {
  it('parses standard json metadata payloads', () => {
    const parsed = parseDaoMetadataString(
      '{"version":1,"description":"dao description","links":{"twitter":"https://x.com/nouns","github":"https://github.com/nouns"}}'
    )

    expect(parsed.description).toBe('dao description')
    expect(parsed.links).toEqual({
      x: 'https://x.com/nouns',
      github: 'https://github.com/nouns',
    })
  })

  it('parses double-encoded json metadata payloads', () => {
    const parsed = parseDaoMetadataString(
      '"{\\"version\\":1,\\"description\\":\\"double encoded\\",\\"links\\":{\\"x\\":\\"https://x.com/nouns\\",\\"github\\":\\"https://github.com/nouns\\"}}"'
    )

    expect(parsed.description).toBe('double encoded')
    expect(parsed.links).toEqual({
      x: 'https://x.com/nouns',
      github: 'https://github.com/nouns',
    })
  })

  it('falls back to plain description text', () => {
    const parsed = parseDaoMetadataString('legacy description')

    expect(parsed.description).toBe('legacy description')
    expect(parsed.links).toEqual({})
  })
})
