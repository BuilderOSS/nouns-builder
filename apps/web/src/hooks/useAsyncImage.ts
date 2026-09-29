import { useEffect, useReducer } from 'react'

export type AsyncImageSrc = () => Promise<string>

const cachedUrls = new Map<AsyncImageSrc, string>()
const cachedRequestPromises = new Map<AsyncImageSrc, Promise<string | void>>()

async function loadAsyncImage(asyncImage: () => Promise<string>) {
  const cachedRequestPromise = cachedRequestPromises.get(asyncImage)

  // Don't fetch if we already have a request in progress / completed
  if (cachedRequestPromise) {
    return cachedRequestPromise
  }

  const load = async () =>
    asyncImage().then(async (url: string) => {
      cachedUrls.set(asyncImage, url)
      return url
    })

  const requestPromise = load().catch(() => {
    // Retry once if the request failed
    return load().catch(() => {
      // Ignore failed retry, remove failed request from promise cache
      cachedRequestPromises.delete(asyncImage)
    })
  })

  cachedRequestPromises.set(asyncImage, requestPromise)

  return requestPromise
}

export async function loadImages(...urls: (string | AsyncImageSrc)[]) {
  return await Promise.all(
    urls.map((url) => (typeof url === 'function' ? loadAsyncImage(url) : url))
  )
}

function useForceUpdate() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  return forceUpdate
}

export function useAsyncImage(url?: string | AsyncImageSrc): string | undefined {
  const cachedUrl = typeof url === 'function' ? cachedUrls.get(url) : undefined
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    if (typeof url === 'function' && !cachedUrl) {
      loadAsyncImage(url).then(forceUpdate)
    }
  }, [url, cachedUrl, forceUpdate])

  return typeof url === 'function' ? cachedUrl : url
}
