const MAX_BIO_LENGTH = 280
const X_HANDLE_REGEX = /^[A-Za-z0-9_]{1,15}$/
const FARCASTER_HANDLE_REGEX = /^[A-Za-z0-9_.-]{1,16}$/

export type ProfileIdentityRecords = {
  description?: string | null
  url?: string | null
  twitter?: string | null
}

export type ProfileLinkOverrideRecord = {
  key: 'website' | 'x' | 'farcaster'
  value: string
}

export type ProfileIdentity = {
  bio?: string
  website?: {
    href: string
    label: string
  }
  x?: {
    handle: string
    label: string
    url: string
  }
  farcaster?: {
    handle: string
    label: string
    url: string
  }
}

export type TokenSortOption =
  | 'newest'
  | 'oldest'
  | 'dao-name-asc'
  | 'token-id-asc'
  | 'token-id-desc'

export const TOKEN_SORT_OPTIONS: Array<{ value: TokenSortOption; label: string }> = [
  { value: 'newest', label: 'Newest acquired' },
  { value: 'oldest', label: 'Oldest acquired' },
  { value: 'dao-name-asc', label: 'DAO name' },
  { value: 'token-id-asc', label: 'Token ID ascending' },
  { value: 'token-id-desc', label: 'Token ID descending' },
]

const cleanText = (value?: string | null): string | undefined => {
  const trimmed = value?.replace(/\r\n/g, '\n').trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, MAX_BIO_LENGTH)
}

export const normalizeXHandle = (value?: string | null): ProfileIdentity['x'] | null => {
  const handle = value?.trim().replace(/^@/, '')
  if (!handle || !X_HANDLE_REGEX.test(handle)) return null

  return {
    handle,
    label: `@${handle}`,
    url: `https://x.com/${handle}`,
  }
}

export const normalizeFarcasterHandle = (
  value?: string | null
): ProfileIdentity['farcaster'] | null => {
  const handle = value?.trim().replace(/^@/, '')
  if (!handle || !FARCASTER_HANDLE_REGEX.test(handle)) return null

  return {
    handle,
    label: `@${handle}`,
    url: `https://farcaster.xyz/${handle}`,
  }
}

export const validateWebsiteUrl = (value?: string | null): string | null => {
  const trimmed = value?.trim()
  if (!trimmed) return null

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const url = new URL(withProtocol)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    if (!url.hostname || !url.hostname.includes('.')) return null
    return url.toString()
  } catch {
    return null
  }
}

export const formatExternalUrl = (href: string): string => {
  try {
    const url = new URL(href)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return href
  }
}

export const getProfileIdentityFromEnsRecords = ({
  description,
  url,
  twitter,
}: ProfileIdentityRecords): ProfileIdentity => {
  return getProfileIdentity({
    ensRecords: {
      description,
      url,
      twitter,
    },
  })
}

export const getProfileIdentity = ({
  ensRecords,
  overrides = [],
}: {
  ensRecords: ProfileIdentityRecords
  overrides?: ProfileLinkOverrideRecord[]
}): ProfileIdentity => {
  const bio = cleanText(ensRecords.description)
  const overrideByKey = new Map(
    overrides
      .filter((override) => override.value.trim())
      .map((override) => [override.key, override])
  )
  const websiteOverride = overrideByKey.get('website')
  const xOverride = overrideByKey.get('x')
  const farcasterOverride = overrideByKey.get('farcaster')

  const websiteSource = websiteOverride ? websiteOverride.value : ensRecords.url
  const xSource = xOverride ? xOverride.value : ensRecords.twitter
  const websiteHref = validateWebsiteUrl(websiteSource)
  const x = normalizeXHandle(xSource)
  const farcaster =
    farcasterOverride && farcasterOverride.value.trim()
      ? normalizeFarcasterHandle(farcasterOverride.value)
      : null

  return {
    ...(bio ? { bio } : {}),
    ...(websiteHref
      ? { website: { href: websiteHref, label: formatExternalUrl(websiteHref) } }
      : {}),
    ...(x ? { x } : {}),
    ...(farcaster ? { farcaster } : {}),
  }
}
