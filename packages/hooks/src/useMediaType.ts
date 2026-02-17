import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import { useMemo } from 'react'
import useSWR from 'swr'

import { type IpfsMetadata } from './useIpfsMetadata'

export interface UseMediaTypeResult {
  mediaType: string | null
  fetchableUrl: string | null
  isLoading: boolean
  error: Error | null
}

interface MediaTypeData {
  mediaType: string | null
  fetchableUrl: string
}

type MediaTypeKey = readonly [typeof SWR_KEYS.MEDIA_TYPE, string, string | undefined]

/**
 * Detect media type from URL extension
 */
const getMediaTypeFromUrl = (url: string): string | undefined => {
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.match(/\.(mp4|webm|mov)(\?|$)/)) return 'video/mp4'
  if (lowerUrl.match(/\.(mp3|wav|ogg|m4a)(\?|$)/)) return 'audio/mpeg'
  if (lowerUrl.match(/\.(jpg|jpeg)(\?|$)/)) return 'image/jpeg'
  if (lowerUrl.match(/\.(png)(\?|$)/)) return 'image/png'
  if (lowerUrl.match(/\.(gif)(\?|$)/)) return 'image/gif'
  if (lowerUrl.match(/\.(svg)(\?|$)/)) return 'image/svg+xml'
  if (lowerUrl.match(/\.(webp)(\?|$)/)) return 'image/webp'
  return undefined
}

/**
 * Fetch content type via HEAD request
 */
const fetchContentType = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    if (contentType) {
      // Extract the main type (e.g., "video/mp4" from "video/mp4; charset=utf-8")
      return contentType.split(';')[0].trim()
    }
    return null
  } catch (error) {
    console.error('Failed to fetch content type:', error)
    return null
  }
}

/**
 * Fetcher for media type detection
 *
 * Detection strategy:
 * 1. Check if metadata has media_type, content_type, or mimeType field
 * 2. Convert ipfs:// URLs to https:// using getFetchableUrls
 * 3. Check URL file extension
 * 4. Fall back to HEAD request to get Content-Type header
 */
const mediaTypeFetcher = async ([
  ,
  mediaUrl,
  metadataType,
]: MediaTypeKey): Promise<MediaTypeData> => {
  // Step 1: Convert ipfs:// to https:// using getFetchableUrls
  const urls = getFetchableUrls(mediaUrl)
  const httpUrl = urls?.[0] || mediaUrl

  // Step 2: If we have media type from metadata, use it
  if (metadataType) {
    return {
      mediaType: metadataType,
      fetchableUrl: httpUrl,
    }
  }

  // Step 3: Try to detect from URL extension
  const urlBasedType = getMediaTypeFromUrl(httpUrl)
  if (urlBasedType) {
    return {
      mediaType: urlBasedType,
      fetchableUrl: httpUrl,
    }
  }

  // Step 4: Fall back to HEAD request
  const contentType = await fetchContentType(httpUrl)
  return {
    mediaType: contentType,
    fetchableUrl: httpUrl,
  }
}

/**
 * Hook to determine media type for a media URL with SWR caching
 *
 * Detection strategy:
 * 1. Check if metadata has media_type, content_type, or mimeType field
 * 2. Convert ipfs:// URLs to https:// using getFetchableUrls
 * 3. Check URL file extension
 * 4. Fall back to HEAD request to get Content-Type header
 *
 * @param mediaUrl - The media URL (could be ipfs://, http://, or https://)
 * @param metadata - Optional IPFS metadata that might contain media type
 * @returns Media type, fetchable URL, and loading state
 */
export function useMediaType(
  mediaUrl: string | null | undefined,
  metadata?: IpfsMetadata | null
): UseMediaTypeResult {
  // Get media type from metadata if available
  const metadataMediaType = useMemo(
    () => metadata?.media_type || metadata?.content_type || metadata?.mimeType,
    [metadata]
  )

  // Create SWR key - only when mediaUrl is provided
  const swrKey: MediaTypeKey | null = mediaUrl
    ? ([SWR_KEYS.MEDIA_TYPE, mediaUrl, metadataMediaType] as const)
    : null

  // Use SWR for data fetching with caching
  const { data, error, isLoading } = useSWR<MediaTypeData, Error>(
    swrKey,
    mediaTypeFetcher,
    {
      // Cache media type detection for 10 minutes
      dedupingInterval: 600000,
      // Don't revalidate on focus/reconnect since media types don't change
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Retry failed requests (might be network issues)
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
    }
  )

  return {
    mediaType: data?.mediaType ?? null,
    fetchableUrl: data?.fetchableUrl ?? null,
    isLoading: isLoading && !!swrKey,
    error: error ?? null,
  }
}
