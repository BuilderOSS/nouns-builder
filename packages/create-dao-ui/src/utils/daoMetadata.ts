export type DaoLinkInput = {
  key: string
  url: string
}

export const normalizeLinkKey = (key: string): string => {
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

const normalizeLinks = (links: DaoLinkInput[]): Record<string, string> => {
  const normalized: Record<string, string> = {}

  for (const link of links) {
    const key = normalizeLinkKey(link.key)
    const url = (link.url || '').trim()

    if (!key || !url || !isHttpUrl(url)) continue
    normalized[key] = url
  }

  return normalized
}

export const serializeDaoMetadata = (
  description: string,
  links: DaoLinkInput[]
): string => {
  const normalizedLinks = normalizeLinks(links)

  return JSON.stringify({
    version: 1,
    description: description.trim(),
    ...(Object.keys(normalizedLinks).length ? { links: normalizedLinks } : {}),
  })
}
