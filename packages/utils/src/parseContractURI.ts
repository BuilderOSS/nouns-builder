interface ParsedContractURI {
  name: string
  description: string
  image: string
  external_url?: string
}

export function parseContractURI(uri: string | undefined): ParsedContractURI | undefined {
  if (!uri) return

  try {
    const [, parsedUri] = uri.split(',')
    if (!parsedUri) {
      return
    }
    const bufferString = Buffer.from(parsedUri, 'base64').toString()
    return JSON.parse(bufferString)
  } catch (e) {
    console.error('Error parsing contract URI:', e)
    return
  }
}
