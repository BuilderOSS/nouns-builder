import { json, JSONValue, JSONValueKind, TypedMap } from '@graphprotocol/graph-ts'

export class ParsedProposalMetadata {
  title: string
  description: string
  representedAddress: string
  discussionUrl: string

  constructor(
    title: string = '',
    description: string = '',
    representedAddress: string = '',
    discussionUrl: string = ''
  ) {
    this.title = title
    this.description = description
    this.representedAddress = representedAddress
    this.discussionUrl = discussionUrl
  }
}

function getStringField(obj: TypedMap<string, JSONValue>, key: string): string {
  let value = obj.get(key)
  if (!value || value.kind != JSONValueKind.STRING) {
    return ''
  }

  return value.toString()
}

export function parseProposalMetadata(metadata: string): ParsedProposalMetadata | null {
  let parsedResult = json.try_fromString(metadata)
  if (parsedResult.isError || parsedResult.value.kind != JSONValueKind.OBJECT) {
    return null
  }

  let obj = parsedResult.value.toObject()
  return new ParsedProposalMetadata(
    getStringField(obj, 'title'),
    getStringField(obj, 'description'),
    getStringField(obj, 'representedAddress'),
    getStringField(obj, 'discussionUrl')
  )
}

function stripMarkdownFromTitle(text: string): string {
  let cleaned = text

  // Remove leading # characters (heading markers)
  while (cleaned.length > 0 && cleaned.charAt(0) == '#') {
    cleaned = cleaned.substring(1)
  }

  // Trim whitespace
  cleaned = cleaned.trim()

  // Remove bold/italic markers: **text** or *text* (AssemblyScript compatible)
  cleaned = cleaned.split('**').join('')
  cleaned = cleaned.split('*').join('')

  // Remove inline code markers: `text`
  cleaned = cleaned.split('`').join('')

  return cleaned
}

export function parseDescriptionFields(descriptionMetadata: string): string[] {
  let title: string | null = null
  let description: string | null = null
  let representedAddress: string | null = null
  let discussionUrl: string | null = null

  let parsedDescription = parseProposalMetadata(descriptionMetadata)

  if (parsedDescription) {
    // Successfully parsed as JSON
    title = parsedDescription.title.length > 0 ? parsedDescription.title : null
    description =
      parsedDescription.description.length > 0 ? parsedDescription.description : null
    representedAddress =
      parsedDescription.representedAddress.length > 0
        ? parsedDescription.representedAddress
        : null
    discussionUrl =
      parsedDescription.discussionUrl.length > 0 ? parsedDescription.discussionUrl : null
  } else {
    // JSON parsing failed, try legacy && delimiter format
    let split = descriptionMetadata.split('&&')
    if (split.length > 1) {
      // Has && delimiter (legacy format)
      title = split[0].length > 0 ? split[0] : null
      description = split[1].length > 0 ? split[1] : null
    } else {
      // No && delimiter, treat as raw markdown: first line = title, rest = description
      let newlineSplit = descriptionMetadata.split('\n')
      if (newlineSplit.length > 0 && newlineSplit[0].length > 0) {
        // Strip markdown formatting from title
        let cleanedTitle = stripMarkdownFromTitle(newlineSplit[0])
        title = cleanedTitle.length > 0 ? cleanedTitle : null
      }
      if (newlineSplit.length > 1) {
        // Join remaining lines as description
        let descLines: string[] = []
        for (let i = 1; i < newlineSplit.length; i++) {
          descLines.push(newlineSplit[i])
        }
        let joinedDesc = descLines.join('\n')
        description = joinedDesc.length > 0 ? joinedDesc : null
      }
    }
  }

  let titleValue = title == null ? '' : changetype<string>(title)
  let descriptionValue = description == null ? '' : changetype<string>(description)
  let representedAddressValue =
    representedAddress == null ? '' : changetype<string>(representedAddress)
  let discussionUrlValue = discussionUrl == null ? '' : changetype<string>(discussionUrl)

  return [titleValue, descriptionValue, representedAddressValue, discussionUrlValue]
}
