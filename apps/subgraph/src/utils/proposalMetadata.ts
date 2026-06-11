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
