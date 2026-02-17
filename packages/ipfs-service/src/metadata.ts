import { getFetchableUrls } from './gateway'

export interface IpfsMetadata {
  name?: string
  description?: string
  image?: string
  imageUrl?: string
  animation_url?: string
  external_url?: string
  // Media type fields
  media_type?: string
  content_type?: string
  mimeType?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
}

/**
 * Fetch and parse metadata from an IPFS URI
 * Tries multiple IPFS gateways for reliability
 * @param uri - The IPFS URI to fetch metadata from
 * @param timeoutMs - Optional timeout per gateway in milliseconds (default: 5000)
 * @returns The parsed metadata or null if all gateways fail
 */
export async function fetchIpfsMetadata(
  uri: string | null | undefined,
  timeoutMs: number = 5000
): Promise<IpfsMetadata | null> {
  if (!uri) return null

  try {
    const urls = getFetchableUrls(uri)
    if (!urls || urls.length === 0) {
      return null
    }

    // Try each URL until one succeeds
    let lastError: Error | null = null
    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(timeoutMs),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const text = await response.text()
        if (!text) {
          throw new Error('Empty response')
        }

        const metadata = JSON.parse(text) as IpfsMetadata
        return metadata
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        // Continue to next gateway
        continue
      }
    }

    // If all gateways failed, throw the last error
    throw lastError || new Error('Failed to fetch metadata from all gateways')
  } catch (error) {
    console.error('Error fetching IPFS metadata:', error)
    return null
  }
}
