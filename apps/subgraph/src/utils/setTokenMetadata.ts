import { Bytes, json, JSONValueKind } from '@graphprotocol/graph-ts'
import { decode } from 'as-base64'

import { Token } from '../../generated/schema'

export function setTokenMetadata(token: Token, tokenURI: string): void {
  let split = tokenURI.split(',')

  // Ensure the tokenURI is a data URI
  if (split.length < 2) return

  // Try to base64 decode the metadata
  let metadataDecoded = Bytes.fromUint8Array(decode(split[1]))

  // Parse the decoded bytes as JSON
  let metadataBytes = json.try_fromBytes(metadataDecoded)

  if (metadataBytes.isError) return

  // Cast to object
  if (metadataBytes.value.kind != JSONValueKind.OBJECT) return
  let metadataObject = metadataBytes.value.toObject()

  // Set name if present
  let name = metadataObject.get('name')
  if (name && name.kind == JSONValueKind.STRING) token.name = name.toString()

  // Set image if present
  let image = metadataObject.get('image')
  if (image && image.kind == JSONValueKind.STRING) {
    let imageString = image.toString()
    if (imageString.startsWith('https://api.zora.co'))
      imageString = imageString.replace('https://api.zora.co', 'https://nouns.build/api')
    token.image = imageString
  }

  // Set content if present
  let content = metadataObject.get('animation_url')
  if (content && content.kind == JSONValueKind.STRING) token.content = content.toString()
}
