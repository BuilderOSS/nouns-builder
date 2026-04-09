export type DaoLinkInput = {
  key: string
  url: string
}

const normalizeLinkKey = (key: string): string => {
  const normalized = key.trim().toLowerCase()
  return normalized === 'twitter' ? 'x' : normalized
}

const isHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const normalizeDaoLinks = (links: DaoLinkInput[]): Record<string, string> => {
  const normalized: Record<string, string> = {}

  for (const link of links) {
    const key = normalizeLinkKey(link.key)
    const url = (link.url || '').trim()

    if (!key || !url || !isHttpUrl(url)) continue
    normalized[key] = url
  }

  return normalized
}

export const parseDaoMetadataString = (
  raw: string | undefined
): { description: string; links: Record<string, string> } => {
  if (!raw) {
    return { description: '', links: {} }
  }

  const parseObject = (value: string): Record<string, unknown> | undefined => {
    try {
      const parsed = JSON.parse(value) as unknown

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }

      if (typeof parsed === 'string') {
        const nestedParsed = JSON.parse(parsed) as unknown
        if (
          nestedParsed &&
          typeof nestedParsed === 'object' &&
          !Array.isArray(nestedParsed)
        ) {
          return nestedParsed as Record<string, unknown>
        }
      }

      return undefined
    } catch {
      return undefined
    }
  }

  const parsed = parseObject(raw)
  if (!parsed) {
    return { description: raw, links: {} }
  }

  try {
    const description =
      typeof parsed.description === 'string' && parsed.description.length > 0
        ? parsed.description
        : raw

    const linkEntries =
      parsed.links && typeof parsed.links === 'object'
        ? Object.entries(parsed.links as Record<string, unknown>).map(([key, value]) => ({
            key,
            url: typeof value === 'string' ? value : '',
          }))
        : []

    return { description, links: normalizeDaoLinks(linkEntries) }
  } catch {
    return { description: raw, links: {} }
  }
}

export const serializeDaoMetadata = (
  description: string,
  links: DaoLinkInput[]
): string => {
  const normalizedLinks = normalizeDaoLinks(links)

  return JSON.stringify({
    version: 1,
    description: description.trim(),
    ...(Object.keys(normalizedLinks).length ? { links: normalizedLinks } : {}),
  })
}
