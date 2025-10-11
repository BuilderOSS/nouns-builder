const NODE_ENV = process.env.NODE_ENV

const BUILDEROSS_BASE_URL = process.env.BUILDEROSS_BASE_URL

/**
 * BASE_URL resolution order:
 * 1. __BUILDEROSS_BASE_URL__  (injected at build-time)
 * 2. process.env.BUILDEROSS_BASE_URL (runtime override)
 * 3. "https://nouns.build" (default fallback)
 */
function resolveBaseUrl(): string {
  // pick value from constants/env
  const raw =
    typeof __BUILDEROSS_BASE_URL__ !== 'undefined' && !!__BUILDEROSS_BASE_URL__
      ? __BUILDEROSS_BASE_URL__
      : (BUILDEROSS_BASE_URL ?? 'https://nouns.build')

  // validate format
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    const msg = `[buildeross:constants] Invalid BASE_URL "${raw}". Must be a valid absolute URL (e.g., https://example.com).`
    if (NODE_ENV === 'production') {
      throw new Error(msg)
    } else {
      console.warn(msg)
      return 'https://nouns.build'
    }
  }

  // ensure it does NOT end with a trailing slash
  const clean = url.href.endsWith('/') ? url.href.slice(0, -1) : url.href

  return clean
}

export const BASE_URL = resolveBaseUrl()
