import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { getFetchableUrls } from '@buildeross/ipfs-service/gateway'
import { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp'
import { withCors } from 'src/utils/api/cors'

const SVG_DEFAULT_SIZE = 1080
const REQUEST_TIMEOUT = 20000 // 20s

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let images = req.query.images

  if (!images || !images.length)
    return res.status(400).json({ error: 'No images provided' })

  const { maxAge, swr } = CACHE_TIMES.RENDERER

  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )
  res.setHeader('Content-Type', 'image/webp')

  // Handle HEAD request - return headers only
  if (req.method === 'HEAD') {
    res.status(200).end()
    return
  }

  if (typeof images === 'string') images = [images]

  let imageData: Buffer[] = await Promise.all(
    images.map((imageUrl) => getImageData(imageUrl))
  )

  // Resize all images to a default size
  imageData = await Promise.all(
    imageData.map(async (x) =>
      sharp(x).resize(SVG_DEFAULT_SIZE, SVG_DEFAULT_SIZE, { fit: 'inside' }).toBuffer()
    )
  )

  const compositeParams = imageData.slice(1).map((x) => ({
    input: x,
    gravity: 'center',
  }))

  const compositeRes = await sharp(imageData[0])
    .composite(compositeParams)
    .webp({ quality: 75 })
    .toBuffer()

  res.send(compositeRes)
}

const getImageData = async (imageUrl: string): Promise<Buffer> => {
  const urls = getFetchableUrls(imageUrl)
  if (!urls?.length) throw new Error('Invalid IPFS url: ' + imageUrl)

  for (const url of urls) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      let res: Response
      try {
        res = await fetch(url, { signal: controller.signal })
      } finally {
        clearTimeout(timeoutId)
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const arrayBuffer = await res.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (err) {
      console.warn(`Failed to fetch from ${url}: ${(err as Error).message}`)
    }
  }

  throw new Error('Failed to fetch image from all fetchable URLs')
}

export default withCors(['GET', 'HEAD'])(handler)

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
}
