import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { fetchIpfsMetadata, type IpfsMetadata } from '@buildeross/ipfs-service'
import useSWR from 'swr'

export { type IpfsMetadata }

export interface UseIpfsMetadataResult {
  metadata: IpfsMetadata | null
  imageUrl: string | null
  animationUrl: string | null
  isLoading: boolean
  error: Error | null
}

interface UseIpfsMetadataOptions {
  enabled?: boolean
}

type MetadataKey = readonly [typeof SWR_KEYS.NFT_METADATA, string, 'ipfs']

/**
 * Fetcher that uses the shared IPFS metadata fetcher
 */
const ipfsMetadataFetcher = async ([
  ,
  uri,
]: MetadataKey): Promise<IpfsMetadata | null> => {
  return fetchIpfsMetadata(uri)
}

/**
 * Hook for fetching and parsing NFT metadata from IPFS or HTTP URIs
 * @param uri - The metadata URI (ipfs://, http://, or data: URI)
 * @param options - Additional options
 * @returns The parsed metadata, extracted image URL, loading state, and error
 */
export function useIpfsMetadata(
  uri: string | null | undefined,
  options: UseIpfsMetadataOptions = {}
): UseIpfsMetadataResult {
  const { enabled = true } = options

  // Create SWR key - only when enabled and URI is provided
  const swrKey: MetadataKey | null =
    enabled && uri ? ([SWR_KEYS.NFT_METADATA, uri, 'ipfs'] as const) : null

  // Use SWR for data fetching with caching
  const { data, error, isLoading } = useSWR<IpfsMetadata | null, Error>(
    swrKey,
    ipfsMetadataFetcher,
    {
      // Cache metadata for 5 minutes
      dedupingInterval: 300000,
      // Revalidate on focus for fresh data
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Retry failed requests
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  // Extract image URL from metadata
  const imageUrl = data?.image || data?.imageUrl || null
  const animationUrl = data?.animation_url || null

  return {
    metadata: data ?? null,
    imageUrl,
    animationUrl,
    isLoading: isLoading && !!swrKey,
    error: error ?? null,
  }
}
