import { json, JSONValueKind, TypedMap } from '@graphprotocol/graph-ts'

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

export function parseDaoMetadata(rawDescription: string): ParsedDaoMetadata {
  let links = new TypedMap<string, string>()
  let parsedResult = json.try_fromString(rawDescription)
  if (parsedResult.isError) {
    return new ParsedDaoMetadata(rawDescription, links)
  }

  let parsedValue = parsedResult.value
  if (parsedValue.kind == JSONValueKind.STRING) {
    let nestedResult = json.try_fromString(parsedValue.toString())
    if (!nestedResult.isError) {
      parsedValue = nestedResult.value
    }
  }

  if (parsedValue.kind != JSONValueKind.OBJECT) {
    return new ParsedDaoMetadata(rawDescription, links)
  }

  let parsed = parsedValue.toObject()

  let nextDescription = rawDescription
  let parsedDescription = parsed.get('description')
  if (parsedDescription && parsedDescription.kind == JSONValueKind.STRING) {
    nextDescription = parsedDescription.toString()
  }

  let parsedLinks = parsed.get('links')
  if (parsedLinks && parsedLinks.kind == JSONValueKind.OBJECT) {
    let parsedLinksObject = parsedLinks.toObject()

    for (let i = 0; i < parsedLinksObject.entries.length; i++) {
      let entry = parsedLinksObject.entries[i]
      let key = entry.key.trim().toLowerCase()
      if (key == 'twitter') key = 'x'
      if (key.length == 0) continue

      if (entry.value.kind != JSONValueKind.STRING) continue

      let value = entry.value.toString().trim()
      if (value.length == 0 || !isSupportedUrl(value)) continue

      links.set(key, value)
    }
  }

  return new ParsedDaoMetadata(nextDescription, links)
}
