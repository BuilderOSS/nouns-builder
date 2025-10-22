import { BASE_URL } from '@buildeross/constants/baseUrl'

import { isNormalizeableIPFSUrl, normalizeIPFSUrl } from './url'

export const PINATA_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'nouns-builder.mypinata.cloud'

export const IPFS_GATEWAYS = [
  `https://${PINATA_GATEWAY}`,
  'https://ipfs.io',
  'https://dweb.link',
  'https://w3s.link',
  'https://flk-ipfs.xyz',
  'https://ipfs.decentralized-content.com',
  'https://gateway.pinata.cloud',
]

export function ipfsGatewayUrls(url: string | null | undefined): string[] | undefined {
  if (!url || typeof url !== 'string') return undefined
  const normalizedIPFSUrl = normalizeIPFSUrl(url)
  if (normalizedIPFSUrl) {
    return IPFS_GATEWAYS.map((gateway) =>
      normalizedIPFSUrl.replace('ipfs://', `${gateway}/ipfs/`)
    )
  }
  return undefined
}

export function getFetchableUrls(uri: string | null | undefined): string[] | undefined {
  if (!uri || typeof uri !== 'string') return undefined
  // If it can be turned into an IPFS URL
  if (isNormalizeableIPFSUrl(uri)) {
    // Return the gateway URL
    return ipfsGatewayUrls(uri)
  }

  // If it is already a blob or data-uri
  if (/^(data:|blob:)/.test(uri)) {
    // Return the URI
    return [uri]
  }

  // If it is a http(s) URL
  if (/^https?:\/\//.test(uri)) {
    let replaced = uri.replace(
      'api.zora.co/renderer/stack-images',
      'nouns.build/api/renderer/stack-images'
    )
    replaced = replaced.replace(
      'https://nouns.build/api/renderer/stack-images',
      BASE_URL + '/api/renderer/stack-images'
    )
    return [replaced]
  }
  return undefined
}
