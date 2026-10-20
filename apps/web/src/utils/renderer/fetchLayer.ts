import { getFetchableUrls } from '@buildeross/ipfs-service/gateway'
import { isGif, parseGif } from '@buildeross/utils/gif'

const REQUEST_TIMEOUT = 20000 // 20s
const SNIFF_TIMEOUT = 5000
/** Enough to see the NETSCAPE loop extension / first frames of a typical GIF. */
export const SNIFF_BYTES = 64 * 1024

/** Fetches and reads the response within one timeout, so a stalled body can't hang the request. */
const fetchWithTimeout = async <T>(
  url: string,
  timeoutMs: number,
  read: (res: Response) => Promise<T>,
  init?: RequestInit
): Promise<T> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    return await read(res)
  } finally {
    clearTimeout(timeoutId)
  }
}

export const getImageData = async (imageUrl: string): Promise<Buffer> => {
  const urls = getFetchableUrls(imageUrl)
  if (!urls?.length) throw new Error('Invalid IPFS url: ' + imageUrl)

  for (const url of urls) {
    try {
      return await fetchWithTimeout(url, REQUEST_TIMEOUT, async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return Buffer.from(await res.arrayBuffer())
      })
    } catch (err) {
      console.warn(`Failed to fetch from ${url}: ${(err as Error).message}`)
    }
  }

  throw new Error('Failed to fetch image from all fetchable URLs')
}

/** Reads at most maxBytes from a response body, cancelling the rest (for servers that ignore Range). */
const readPrefix = async (res: Response, maxBytes: number): Promise<Uint8Array> => {
  if (!res.body) return new Uint8Array(await res.arrayBuffer()).subarray(0, maxBytes)
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (total < maxBytes) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      total += value.length
    }
  } finally {
    reader.cancel().catch(() => {})
  }
  const out = new Uint8Array(Math.min(total, maxBytes))
  let offset = 0
  for (const chunk of chunks) {
    const take = Math.min(chunk.length, out.length - offset)
    out.set(chunk.subarray(0, take), offset)
    offset += take
    if (offset >= out.length) break
  }
  return out
}

/** Fetches only the first bytes of a layer. */
export const getImagePrefix = async (
  imageUrl: string,
  maxBytes = SNIFF_BYTES
): Promise<Uint8Array> => {
  const urls = getFetchableUrls(imageUrl)
  if (!urls?.length) throw new Error('Invalid IPFS url: ' + imageUrl)

  for (const url of urls) {
    try {
      return await fetchWithTimeout(
        url,
        SNIFF_TIMEOUT,
        async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return readPrefix(res, maxBytes)
        },
        { headers: { Range: `bytes=0-${maxBytes - 1}` } }
      )
    } catch (err) {
      console.warn(`Failed to sniff ${url}: ${(err as Error).message}`)
    }
  }

  throw new Error('Failed to fetch image prefix from all fetchable URLs')
}

/**
 * Best-effort animation check from the start of a file. A GIF counts as animated if it
 * has a loop extension or more than one frame within the prefix; if the prefix is too
 * short to tell, GIFs are assumed animated (static GIF layers are rare).
 */
export const prefixLooksAnimated = (prefix: Uint8Array): boolean => {
  if (!isGif(prefix)) return false
  try {
    const info = parseGif(prefix)
    if (info.isAnimated || info.loopCount !== null) return true
    return info.truncated
  } catch {
    return true
  }
}
