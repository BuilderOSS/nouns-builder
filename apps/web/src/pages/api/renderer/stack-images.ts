import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'
import { AnimatedFormat, composeLayers } from 'src/utils/renderer/compose'
import {
  getImageData,
  getImagePrefix,
  prefixLooksAnimated,
} from 'src/utils/renderer/fetchLayer'

const firstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

const parseFormat = (value: string | string[] | undefined): AnimatedFormat =>
  firstParam(value)?.toLowerCase() === 'webp' ? 'webp' : 'gif'

const parseStatic = (value: string | string[] | undefined) => {
  const v = firstParam(value)?.toLowerCase()
  return v === '1' || v === 'true'
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let images = req.query.images

  if (!images || !images.length)
    return res.status(400).json({ error: 'No images provided' })

  if (typeof images === 'string') images = [images]

  const format = parseFormat(req.query.format)
  const forceStatic = parseStatic(req.query.static)

  const { maxAge, swr } = CACHE_TIMES.RENDERER
  const cacheControl = `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`

  // Handle HEAD request - sniff layer prefixes to report the likely content type
  if (req.method === 'HEAD') {
    let contentType = 'image/webp'
    if (!forceStatic) {
      try {
        const prefixes = await Promise.all(images.map((url) => getImagePrefix(url)))
        if (prefixes.some(prefixLooksAnimated)) contentType = `image/${format}`
      } catch (err) {
        console.warn('Renderer HEAD: failed to sniff layers', err)
      }
    }
    res.setHeader('Cache-Control', cacheControl)
    res.setHeader('Content-Type', contentType)
    res.status(200).end()
    return
  }

  try {
    const imageData = await Promise.all(images.map((imageUrl) => getImageData(imageUrl)))
    const result = await composeLayers(imageData, { format, forceStatic })

    if (result.animated || result.fallback) {
      console.info('Renderer: composed', {
        layers: images.length,
        animated: result.animated,
        fallback: result.fallback,
        size: result.size,
        frames: result.frames,
        bytes: result.buffer.length,
        timings: result.timings,
      })
    }

    // Errors may be transient; don't pin a degraded static image in the CDN for a day
    res.setHeader(
      'Cache-Control',
      result.fallback === 'error' ? 'public, s-maxage=300' : cacheControl
    )
    res.setHeader('Content-Type', result.contentType)
    if (result.fallback) res.setHeader('X-Renderer-Fallback', result.fallback)
    res.send(result.buffer)
  } catch (err) {
    console.error('Renderer: failed to render images', err)
    res.setHeader('Cache-Control', 'no-store')
    res.status(500).json({ error: 'Failed to render images' })
  }
}

export default withCors()(handler)

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
}
