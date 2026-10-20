import { describe, expect, it } from 'vitest'

import { getFetchableUrls, IPFS_GATEWAYS, ipfsGatewayUrls } from './gateway'

const VALID_CID = 'bafkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq'

describe('ipfsGatewayUrl', () => {
  it('handles already normalized urls', () => {
    const normalizedUrl = `ipfs://${VALID_CID}`
    expect(ipfsGatewayUrls(normalizedUrl)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}`)
    )
  })
  it('handles raw CIDs', () => {
    const rawCID = VALID_CID
    expect(ipfsGatewayUrls(rawCID)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}`)
    )
  })
  it('handles gateway urls', () => {
    const gatewayUrl = `https://my.gateway.com/ipfs/${VALID_CID}`
    expect(ipfsGatewayUrls(gatewayUrl)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}`)
    )
  })
  it('handles directory gateway urls', () => {
    const directoryCIDWithPath = `https://my.gateway.com/ipfs/${VALID_CID}/filename.txt`
    expect(ipfsGatewayUrls(directoryCIDWithPath)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}/filename.txt`)
    )
  })
  it('handles non-ipfs urls', () => {
    const nonIPFSUrl = `https://galverse.art/api/metadata/metadata.json`
    expect(ipfsGatewayUrls(nonIPFSUrl)).toBe(undefined)
  })
  it('keeps renderer query params when rewriting stack-images urls', () => {
    const url =
      'https://nouns.build/api/renderer/stack-images?images=ipfs%3A%2F%2Fcid%2Fa.gif&format=webp&static=1'
    const [rewritten] = getFetchableUrls(url)!
    const parsed = new URL(rewritten)
    expect(parsed.pathname).toBe('/api/renderer/stack-images')
    expect(parsed.searchParams.get('format')).toBe('webp')
    expect(parsed.searchParams.get('static')).toBe('1')
    expect(parsed.searchParams.getAll('images')).toEqual(['ipfs://cid/a.gif'])
  })

  it('handles invalid urls', () => {
    const invalidUrl = 'not a cid or url'
    expect(ipfsGatewayUrls(invalidUrl)).toBe(undefined)
  })
})

describe('getFetchableUrl', () => {
  it('handles already normalized urls', () => {
    const normalizedUrl = `ipfs://${VALID_CID}`
    expect(getFetchableUrls(normalizedUrl)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}`)
    )
  })
  it('handles raw CIDs', () => {
    const rawCID = VALID_CID
    expect(getFetchableUrls(rawCID)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}`)
    )
  })
  it('handles gateway urls', () => {
    const gatewayUrl = `https://my.gateway.com/ipfs/${VALID_CID}`
    expect(getFetchableUrls(gatewayUrl)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}`)
    )
  })
  it('handles directory gateway urls', () => {
    const directoryCIDWithPath = `https://my.gateway.com/ipfs/${VALID_CID}/filename.txt`
    expect(getFetchableUrls(directoryCIDWithPath)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}/filename.txt`)
    )
  })
  it('handles non-ipfs urls', () => {
    const nonIPFSUrl = `https://galverse.art/api/metadata/metadata.json`
    expect(getFetchableUrls(nonIPFSUrl)?.[0]).toBe(nonIPFSUrl)
  })
  it('keeps renderer query params when rewriting stack-images urls', () => {
    const url =
      'https://nouns.build/api/renderer/stack-images?images=ipfs%3A%2F%2Fcid%2Fa.gif&format=webp&static=1'
    const [rewritten] = getFetchableUrls(url)!
    const parsed = new URL(rewritten)
    expect(parsed.pathname).toBe('/api/renderer/stack-images')
    expect(parsed.searchParams.get('format')).toBe('webp')
    expect(parsed.searchParams.get('static')).toBe('1')
    expect(parsed.searchParams.getAll('images')).toEqual(['ipfs://cid/a.gif'])
  })

  it('handles invalid urls', () => {
    const invalidUrl = 'not a cid or url'
    expect(getFetchableUrls(invalidUrl)).toBe(undefined)
  })
})
