import { TypedMap } from '@graphprotocol/graph-ts'

export class ParsedDaoMetadata {
  description: string
  links: TypedMap<string, string>

  constructor(description: string, links: TypedMap<string, string>) {
    this.description = description
    this.links = links
  }
}

function isSupportedUrl(value: string): boolean {
  return value.startsWith('https://') || value.startsWith('http://')
}

function unescapeDescription(raw: string): string {
  let output = ''

  for (let i = 0; i < raw.length; i++) {
    let char = raw.charAt(i)

    if (char != '\\' || i + 1 >= raw.length) {
      output += char
      continue
    }

    let next = raw.charAt(i + 1)

    if (next == 'n') {
      output += '\n'
      i += 1
      continue
    }

    if (next == 'r') {
      output += '\r'
      i += 1
      continue
    }

    if (next == 't') {
      output += '\t'
      i += 1
      continue
    }

    if (next == '"' || next == '\\') {
      output += next
      i += 1
      continue
    }

    output += char
  }

  return output
}

function normalizeNewlines(raw: string): string {
  let output = ''

  for (let i = 0; i < raw.length; i++) {
    let char = raw.charAt(i)

    if (char == '\r') {
      if (i + 1 < raw.length && raw.charAt(i + 1) == '\n') {
        i += 1
      }
      output += '\n'
      continue
    }

    output += char
  }

  return output
}

export function parseDaoMetadata(rawDescription: string): ParsedDaoMetadata {
  let links = new TypedMap<string, string>()
  let normalizedDescription = normalizeNewlines(unescapeDescription(rawDescription))

  if (!normalizedDescription.startsWith('---\n')) {
    return new ParsedDaoMetadata(normalizedDescription, links)
  }

  let frontmatterEnd = normalizedDescription.indexOf('\n---\n')
  if (frontmatterEnd < 0) {
    return new ParsedDaoMetadata(normalizedDescription, links)
  }

  let frontmatterBody = normalizedDescription.substr(4, frontmatterEnd - 4)
  let description = normalizedDescription.substr(frontmatterEnd + 5)
  if (description.startsWith('\n')) {
    description = description.substr(1)
  }
  let lines = frontmatterBody.split('\n')

  let inLinksSection = false

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    let trimmed = line.trim()
    if (trimmed.length == 0) continue

    if (!line.startsWith('  ')) {
      inLinksSection = trimmed == 'links:'
      continue
    }

    if (!inLinksSection) continue

    let separatorIndex = line.indexOf(':')
    if (separatorIndex <= 2) continue

    let key = line
      .substr(2, separatorIndex - 2)
      .trim()
      .toLowerCase()
    if (key == 'twitter') key = 'x'
    if (key.length == 0) continue

    let value = line.substr(separatorIndex + 1).trim()
    if (value.length == 0 || !isSupportedUrl(value)) continue

    links.set(key, value)
  }

  return new ParsedDaoMetadata(description, links)
}
