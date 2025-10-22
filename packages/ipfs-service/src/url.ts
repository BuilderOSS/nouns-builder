export type IPFSUrl = `ipfs://${string}`

export function isCID(str: string | null | undefined): boolean {
  if (!str) return false

  return (
    typeof str === 'string' &&
    /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|ba[A-Za-z0-9]{50,})$/.test(str)
  )
}

export function normalizeIPFSUrl(url: string | null | undefined): IPFSUrl | null {
  if (!url || typeof url !== 'string') return null

  // Handle urls wrapped in quotes
  url = url.replace(/"/g, '')

  // Check if already a normalized IPFS url
  if (isNormalizedIPFSURL(url)) return url as IPFSUrl

  // Check if url is a CID string
  if (isCID(url)) return `ipfs://${url}`

  // If url is not either an ipfs gateway or protocol url
  if (!isIPFSUrl(url)) return null

  // If url is already a gateway url, parse and normalize
  if (isGatewayIPFSUrl(url)) {
    const parsed = new URL(url)
    // Remove IPFS from the URL
    // http://gateway/ipfs/<CID>?x=y#z -> http://gateway/<CID>?x=y#z
    parsed.pathname = parsed.pathname.replace(/^\/ipfs\//, '')
    // Remove the protocol and host from the URL
    // http://gateway/<CID>?x=y#z -> <CID>?x=y#z
    const cid = parsed.toString().replace(`${parsed.protocol}//${parsed.host}/`, '')
    // Prepend ipfs protocol
    return `ipfs://${cid}`
  }

  return null
}

function isNormalizedIPFSURL(url: string | null | undefined): boolean {
  return url && typeof url === 'string' ? url.startsWith('ipfs://') : false
}

function isGatewayIPFSUrl(url: string | null | undefined): boolean {
  return url && typeof url === 'string'
    ? !isNormalizedIPFSURL(url) && !!url.match(/\/ipfs\//)
    : false
}

export function isIPFSUrl(url: string | null | undefined): boolean {
  return url ? isNormalizedIPFSURL(url) || isGatewayIPFSUrl(url) : false
}

export function isNormalizeableIPFSUrl(url: string | null | undefined): boolean {
  return url ? isIPFSUrl(url) || isCID(url) : false
}
