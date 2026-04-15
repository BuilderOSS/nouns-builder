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

const buildFrontmatterLinks = (links: Record<string, string>): string => {
  const entries = Object.entries(links)
  if (!entries.length) return ''

  const lines = entries.map(([key, url]) => `  ${key}: ${url}`).join('\n')
  return `---\nlinks:\n${lines}\n---\n\n`
}

const unescapeDescription = (raw: string): string => {
  let output = ''

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i]

    if (char !== '\\' || i + 1 >= raw.length) {
      output += char
      continue
    }

    const next = raw[i + 1]

    if (next === 'n') {
      output += '\n'
      i += 1
      continue
    }

    if (next === 'r') {
      output += '\r'
      i += 1
      continue
    }

    if (next === 't') {
      output += '\t'
      i += 1
      continue
    }

    if (next === '"' || next === '\\') {
      output += next
      i += 1
      continue
    }

    output += char
  }

  return output
}

const parseFrontmatter = (
  raw: string
): { description: string; links: Record<string, string> } | null => {
  if (!raw.startsWith('---\n')) return null

  const frontmatterEnd = raw.indexOf('\n---\n')
  if (frontmatterEnd === -1) return null

  const frontmatterBody = raw.slice(4, frontmatterEnd)
  const descriptionWithOptionalSpacer = raw.slice(frontmatterEnd + 5)
  const description = descriptionWithOptionalSpacer.startsWith('\n')
    ? descriptionWithOptionalSpacer.slice(1)
    : descriptionWithOptionalSpacer
  const lines = frontmatterBody.split('\n')

  const links: DaoLinkInput[] = []
  let inLinksSection = false

  const leadingWhitespaceCount = (value: string): number => {
    let count = 0

    while (count < value.length) {
      const char = value[count]
      if (char !== ' ' && char !== '\t') break
      count += 1
    }

    return count
  }

  for (const line of lines) {
    if (!line.trim()) continue

    const indentation = leadingWhitespaceCount(line)

    if (indentation === 0) {
      inLinksSection = line.trim() === 'links:'
      continue
    }

    if (!inLinksSection) continue

    const separatorIndex = line.indexOf(':')
    if (separatorIndex <= indentation) continue

    const key = line.slice(indentation, separatorIndex).trim()
    const url = line.slice(separatorIndex + 1).trim()
    links.push({ key, url })
  }

  return {
    description,
    links: normalizeDaoLinks(links),
  }
}

export const parseDaoMetadataString = (
  raw: string | undefined
): { description: string; links: Record<string, string> } => {
  if (!raw) {
    return { description: '', links: {} }
  }

  const normalizedRaw = unescapeDescription(raw)
  const parsed = parseFrontmatter(normalizedRaw)
  if (parsed) return parsed

  return { description: normalizedRaw, links: {} }
}

export const serializeDaoMetadata = (
  description: string,
  links: DaoLinkInput[]
): string => {
  const normalizedLinks = normalizeDaoLinks(links)
  return `${buildFrontmatterLinks(normalizedLinks)}${description.trim()}`
}
