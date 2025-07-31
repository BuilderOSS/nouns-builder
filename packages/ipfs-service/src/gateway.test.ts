import { describe, expect, it } from 'vitest'

import { getFetchableUrls, IPFS_GATEWAYS, ipfsGatewayUrls } from './gateway'

const VALID_CID = 'bafkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq'

describe('ipfsGatewayUrl', () => {
  it('handles already normalized urls', () => {
    const normalizedUrl = `ipfs://${VALID_CID}`
    expect(ipfsGatewayUrls(normalizedUrl)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}`),
    )
  })
  it('handles raw CIDs', () => {
    const rawCID = VALID_CID
    expect(ipfsGatewayUrls(rawCID)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}`),
    )
  })
  it('handles gateway urls', () => {
    const gatewayUrl = `https://my.gateway.com/ipfs/${VALID_CID}`
    expect(ipfsGatewayUrls(gatewayUrl)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}`),
    )
  })
  it('handles directory gateway urls', () => {
    const directoryCIDWithPath = `https://my.gateway.com/ipfs/${VALID_CID}/filename.txt`
    expect(ipfsGatewayUrls(directoryCIDWithPath)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}/filename.txt`),
    )
  })
  it('handles non-ipfs urls', () => {
    const nonIPFSUrl = `https://galverse.art/api/metadata/metadata.json`
    expect(ipfsGatewayUrls(nonIPFSUrl)).toBe(undefined)
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
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}`),
    )
  })
  it('handles raw CIDs', () => {
    const rawCID = VALID_CID
    expect(getFetchableUrls(rawCID)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}`),
    )
  })
  it('handles gateway urls', () => {
    const gatewayUrl = `https://my.gateway.com/ipfs/${VALID_CID}`
    expect(getFetchableUrls(gatewayUrl)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}`),
    )
  })
  it('handles directory gateway urls', () => {
    const directoryCIDWithPath = `https://my.gateway.com/ipfs/${VALID_CID}/filename.txt`
    expect(getFetchableUrls(directoryCIDWithPath)).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}/ipfs/${VALID_CID}/filename.txt`),
    )
  })
  it('handles non-ipfs urls', () => {
    const nonIPFSUrl = `https://galverse.art/api/metadata/metadata.json`
    expect(getFetchableUrls(nonIPFSUrl)?.[0]).toBe(nonIPFSUrl)
  })
  it('handles invalid urls', () => {
    const invalidUrl = 'not a cid or url'
    expect(getFetchableUrls(invalidUrl)).toBe(undefined)
  })
})
