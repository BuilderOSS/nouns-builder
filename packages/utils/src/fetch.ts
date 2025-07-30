import { getFetchableUrls } from '@buildeross/ipfs-service'

const REQUEST_TIMEOUT = 10000 // 10s

export const fetchWithTimeout = async (
  url: string,
  controller: AbortController,
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

// using this instead of Promise.any to support older browsers
const promiseAny = <T>(promises: Promise<T>[]): Promise<T> => {
  return new Promise((resolve, reject) => {
    let rejections = 0
    const errors: any[] = []

    promises.forEach((p) => {
      p.then(resolve).catch((err) => {
        errors.push(err)
        rejections++
        if (rejections === promises.length) {
          reject(errors)
        }
      })
    })
  })
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
    }),
  )

  return promiseAny(fetchPromises).catch(() => {
    throw new Error('Failed to fetch from all available URLs')
  })
}
