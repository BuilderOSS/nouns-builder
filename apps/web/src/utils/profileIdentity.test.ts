import { describe, expect, it } from 'vitest'

import {
  formatExternalUrl,
  getProfileIdentity,
  getProfileIdentityFromEnsRecords,
  normalizeFarcasterHandle,
  normalizeXHandle,
  validateWebsiteUrl,
} from './profileIdentity'

describe('profile identity helpers', () => {
  it('normalizes valid X handles with or without @', () => {
    expect(normalizeXHandle('@builder_dao')).toEqual({
      handle: 'builder_dao',
      label: '@builder_dao',
      url: 'https://x.com/builder_dao',
    })
    expect(normalizeXHandle('noun42')).toEqual({
      handle: 'noun42',
      label: '@noun42',
      url: 'https://x.com/noun42',
    })
  })

  it('rejects invalid X handles', () => {
    expect(normalizeXHandle('builder.dao')).toBeNull()
    expect(normalizeXHandle('a'.repeat(16))).toBeNull()
    expect(normalizeXHandle('@')).toBeNull()
  })

  it('normalizes valid Farcaster handles with or without @', () => {
    expect(normalizeFarcasterHandle('@builder')).toEqual({
      handle: 'builder',
      label: '@builder',
      url: 'https://warpcast.com/builder',
    })
    expect(normalizeFarcasterHandle('noun-42')).toEqual({
      handle: 'noun-42',
      label: '@noun-42',
      url: 'https://warpcast.com/noun-42',
    })
  })

  it('rejects invalid Farcaster handles', () => {
    expect(normalizeFarcasterHandle('a'.repeat(17))).toBeNull()
    expect(normalizeFarcasterHandle('bad handle')).toBeNull()
    expect(normalizeFarcasterHandle('@')).toBeNull()
  })

  it('validates website URLs and adds https when needed', () => {
    expect(validateWebsiteUrl('buildeross.com')).toBe('https://buildeross.com/')
    expect(validateWebsiteUrl('https://nouns.build/profile')).toBe(
      'https://nouns.build/profile'
    )
    expect(validateWebsiteUrl('javascript:alert(1)')).toBeNull()
    expect(validateWebsiteUrl('ftp://buildeross.com')).toBeNull()
  })

  it('formats external URLs as clean domain labels', () => {
    expect(formatExternalUrl('https://www.buildeross.com/profile?ref=dao')).toBe(
      'buildeross.com'
    )
  })

  it('builds profile identity from sanitized ENS records', () => {
    expect(
      getProfileIdentityFromEnsRecords({
        description: ` Builder operator\nDAO steward `.repeat(20),
        url: 'buildeross.com',
        twitter: '@buildeross',
      })
    ).toEqual({
      bio: expect.stringContaining('Builder operator'),
      website: {
        href: 'https://buildeross.com/',
        label: 'buildeross.com',
      },
      x: {
        handle: 'buildeross',
        label: '@buildeross',
        url: 'https://x.com/buildeross',
      },
    })
  })

  it('uses Builder overrides over ENS defaults', () => {
    expect(
      getProfileIdentity({
        ensRecords: {
          url: 'ens.example',
          twitter: '@ens_handle',
        },
        overrides: [
          { key: 'website', value: 'buildeross.com' },
          { key: 'x', value: '@buildeross' },
          { key: 'farcaster', value: '@builder' },
        ],
      })
    ).toEqual({
      website: {
        href: 'https://buildeross.com/',
        label: 'buildeross.com',
      },
      x: {
        handle: 'buildeross',
        label: '@buildeross',
        url: 'https://x.com/buildeross',
      },
      farcaster: {
        handle: 'builder',
        label: '@builder',
        url: 'https://warpcast.com/builder',
      },
    })
  })

  it('falls back to ENS after empty Builder overrides are filtered as removals', () => {
    expect(
      getProfileIdentity({
        ensRecords: {
          url: 'ens.example',
          twitter: '@ens_handle',
        },
        overrides: [
          { key: 'website', value: '' },
          { key: 'x', value: '  ' },
        ],
      })
    ).toEqual({
      website: {
        href: 'https://ens.example/',
        label: 'ens.example',
      },
      x: {
        handle: 'ens_handle',
        label: '@ens_handle',
        url: 'https://x.com/ens_handle',
      },
    })
  })
})
