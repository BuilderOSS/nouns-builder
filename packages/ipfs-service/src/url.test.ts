import { describe, expect, it } from 'vitest'

import { isCID, isNormalizeableIPFSUrl, normalizeIPFSUrl } from './url'

const VALID_CID = 'bafkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq'

describe('isCID', () => {
  it('handles v0 CIDs', () => {
    const v0CID = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'
    expect(isCID(v0CID)).toBe(true)
  })
  it('handles v1 CIDs', () => {
    const v1CID = VALID_CID
    expect(isCID(v1CID)).toBe(true)
  })
  it('handles invalid CIDs', () => {
    const invalidCID = 'not a cid'
    expect(isCID(invalidCID)).toBe(false)
  })
})

describe('isNormalizeableIPFSUrl', () => {
  it('handles already normalized urls', () => {
    const normalizedUrl = `ipfs://${VALID_CID}`
    expect(isNormalizeableIPFSUrl(normalizedUrl)).toBe(true)
  })
  it('handles raw CIDs', () => {
    const rawCID = VALID_CID
    expect(isNormalizeableIPFSUrl(rawCID)).toBe(true)
  })
  it('handles gateway urls', () => {
    const gatewayUrl = `https://my.gateway.com/ipfs/${VALID_CID}`
    expect(isNormalizeableIPFSUrl(gatewayUrl)).toBe(true)
  })
  it('handles urls wrapped in quotes', () => {
    const gatewayUrl = `"https://my.gateway.com/ipfs/${VALID_CID}"`
    expect(isNormalizeableIPFSUrl(gatewayUrl)).toBe(true)
  })
  it('handles directory gateway urls', () => {
    const directoryCIDWithPath = `https://my.gateway.com/ipfs/${VALID_CID}/filename.txt`
    expect(isNormalizeableIPFSUrl(directoryCIDWithPath)).toBe(true)
  })
  it('supports query strings and fragments', () => {
    const complexUrl = `https://my.gateway.com/ipfs/${VALID_CID}?query=value#hash`
    expect(isNormalizeableIPFSUrl(complexUrl)).toBe(true)
  })
  it('handles non-ipfs urls', () => {
    const nonIPFSUrl = 'https://galverse.art/api/metadata/metadata.json'
    expect(isNormalizeableIPFSUrl(nonIPFSUrl)).toBe(false)
  })
  it('handles invalid urls', () => {
    const invalidUrl = 'not a cid or url'
    expect(isNormalizeableIPFSUrl(invalidUrl)).toBe(false)
  })
})

describe('normalizeIPFSUrl', () => {
  it('handles already normalized urls', () => {
    const normalizedUrl = `ipfs://${VALID_CID}`
    expect(normalizeIPFSUrl(normalizedUrl)).toBe(`ipfs://${VALID_CID}`)
  })
  it('handles raw CIDs', () => {
    const rawCID = VALID_CID
    expect(normalizeIPFSUrl(rawCID)).toBe(`ipfs://${VALID_CID}`)
  })
  it('handles gateway urls', () => {
    const gatewayUrl = `https://my.gateway.com/ipfs/${VALID_CID}`
    expect(normalizeIPFSUrl(gatewayUrl)).toBe(`ipfs://${VALID_CID}`)
  })
  it('handles urls wrapped in quotes', () => {
    const gatewayUrl = `"https://my.gateway.com/ipfs/${VALID_CID}"`
    expect(normalizeIPFSUrl(gatewayUrl)).toBe(`ipfs://${VALID_CID}`)
  })
  it('handles directory gateway urls', () => {
    const directoryCIDWithPath = `https://my.gateway.com/ipfs/${VALID_CID}/filename.txt`
    expect(normalizeIPFSUrl(directoryCIDWithPath)).toBe(
      `ipfs://${VALID_CID}/filename.txt`
    )
  })
  it('supports query strings and fragments', () => {
    const complexUrl = `https://my.gateway.com/ipfs/${VALID_CID}?query=value#hash`
    expect(normalizeIPFSUrl(complexUrl)).toBe(`ipfs://${VALID_CID}?query=value#hash`)
  })
  it('handles non-ipfs urls', () => {
    const nonIPFSUrl = 'https://galverse.art/api/metadata/metadata.json'
    expect(normalizeIPFSUrl(nonIPFSUrl)).toBe(null)
  })
  it('handles invalid urls', () => {
    const invalidUrl = 'not a cid or url'
    expect(normalizeIPFSUrl(invalidUrl)).toBe(null)
  })
})
