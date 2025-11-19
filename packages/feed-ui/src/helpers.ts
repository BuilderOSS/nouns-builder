export const findFirstImage = (markdown = ''): string | null => {
  // Markdown image syntax: ![alt text](image_url "optional title")
  const imageRegex = /!\[[^\]]*]\((\S+?)(?:\s+"[^"]*")?\)/

  const match = markdown.match(imageRegex)
  return match ? match[1] : null
}

const MAX_LENGTH = 200

export const truncateContent = (content: string): string => {
  if (content.length <= MAX_LENGTH) {
    return content
  }
  return content.slice(0, MAX_LENGTH) + '…'
}
