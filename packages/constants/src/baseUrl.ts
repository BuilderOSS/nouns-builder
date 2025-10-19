import { PUBLIC_IS_TESTNET } from './chains'

const NODE_ENV = process.env.NODE_ENV

const BUILDEROSS_BASE_URL = process.env.BUILDEROSS_BASE_URL

const DEFAULT_BASE_URL = PUBLIC_IS_TESTNET
  ? 'https://testnet.nouns.build'
  : 'https://nouns.build'

/**
 * BASE_URL resolution order:
 * 1. __BUILDEROSS_BASE_URL__  (injected at build-time)
 * 2. process.env.BUILDEROSS_BASE_URL (runtime override)
 * 3. "https://nouns.build" or "https://testnet.nouns.build" (default)
 */
function resolveBaseUrl(): string {
  // pick value from constants/env
  const raw =
    typeof __BUILDEROSS_BASE_URL__ !== 'undefined' && !!__BUILDEROSS_BASE_URL__
      ? __BUILDEROSS_BASE_URL__
      : (BUILDEROSS_BASE_URL ?? DEFAULT_BASE_URL)

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
      return DEFAULT_BASE_URL
    }
  }

  // ensure it does NOT end with a trailing slash
  const clean = url.href.endsWith('/') ? url.href.slice(0, -1) : url.href

  return clean
}

export const BASE_URL = resolveBaseUrl()
