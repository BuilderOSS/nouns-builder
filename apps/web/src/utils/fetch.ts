import { getFetchableUrls } from '@buildeross/ipfs-service'

const REQUEST_TIMEOUT = 10000 // 10s

export const fetchWithTimeout = async (
  url: string,
  controller: AbortController
): Promise<string> => {
  const { signal } = controller

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, REQUEST_TIMEOUT)

  try {
    const res = await fetch(url, { signal })
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`)
    }
    return await res.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

export const fetchFromURI = async (uri: string): Promise<string> => {
  const urls = getFetchableUrls(uri)
  if (!urls?.length) {
    throw new Error('Invalid URI')
  }

  const controller = new AbortController()

  const fetchPromises = urls.map((url) =>
    fetchWithTimeout(url, controller).then((result) => {
      controller.abort() // abort all other pending fetches once one succeeds
      return result
    })
  )

  return Promise.any(fetchPromises).catch(() => {
    throw new Error('Failed to fetch from all available URLs')
  })
}
