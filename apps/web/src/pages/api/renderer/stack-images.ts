import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { getFetchableUrls } from '@buildeross/ipfs-service/gateway'
import { applyPalette, GIFEncoder, quantize } from 'gifenc'
import { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp'
import { withCors } from 'src/utils/api/cors'

const SVG_DEFAULT_SIZE = 1080
const REQUEST_TIMEOUT = 20000 // 20s

// Helper function to detect image format
const detectImageFormat = (buffer: Buffer): 'gif' | 'png' | 'svg' | 'unknown' => {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46
  ) {
    return 'gif'
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'png'
  }
  if (
    buffer.toString('utf8', 0, 5) === '<?xml' ||
    buffer.toString('utf8', 0, 4) === '<svg'
  ) {
    return 'svg'
  }
  return 'unknown'
}

// Function to compose images - all images are the same type
const composeImages = async (
  imageData: Buffer[]
): Promise<{ buffer: Buffer; contentType: string }> => {
  // Detect format from first image (all are same type)
  const format = detectImageFormat(imageData[0])

  if (format === 'gif') {
    // Handle GIFs - check for animation
    const animationStatus = await Promise.all(
      imageData.map(async (buffer, index) => {
        try {
          const metadata = await sharp(buffer).metadata()
          const isAnimated = metadata.pages ? metadata.pages > 1 : false
          return isAnimated
        } catch (err) {
          console.warn(`Error getting GIF metadata for image ${index}:`, err)
          return false
        }
      })
    )

    const hasAnimatedGifs = animationStatus.some((isAnimated) => isAnimated)

    if (hasAnimatedGifs) {
      try {
        // Prepare each layer as PNG with transparency for Sharp compositing
        const layerPngs: Buffer[][] = []
        const framesCounts: number[] = []

        for (let i = 0; i < imageData.length; i++) {
          if (animationStatus[i]) {
            // Extract all frames from animated GIF as PNGs
            const metadata = await sharp(imageData[i]).metadata()
            const frameCount = metadata.pages || 1
            framesCounts[i] = frameCount

            const frames: Buffer[] = []
            for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
              const framePng = await sharp(imageData[i], { page: frameIndex })
                .resize(SVG_DEFAULT_SIZE, SVG_DEFAULT_SIZE, { fit: 'inside' })
                .png()
                .toBuffer()

              frames.push(framePng)
            }

            layerPngs[i] = frames
          } else {
            // Static GIF - convert to PNG
            const staticPng = await sharp(imageData[i])
              .resize(SVG_DEFAULT_SIZE, SVG_DEFAULT_SIZE, { fit: 'inside' })
              .png()
              .toBuffer()

            layerPngs[i] = [staticPng]
            framesCounts[i] = 1
          }
        }

        // Find the maximum number of frames needed
        const maxFrames = Math.max(...framesCounts)

        // Check for reasonable frame count to prevent memory issues
        if (maxFrames > 1000) {
          throw new Error('Frame count exceeds maximum allowed (1000 frames)')
        }

        // Estimate memory usage and validate
        const estimatedMemoryMB =
          (maxFrames * imageData.length * SVG_DEFAULT_SIZE * SVG_DEFAULT_SIZE * 4) /
          (1024 * 1024)
        if (estimatedMemoryMB > 500) {
          throw new Error(
            `Estimated memory usage (${estimatedMemoryMB.toFixed(0)}MB) exceeds limit`
          )
        }

        // Use Sharp to properly composite each frame with correct colors
        const compositedFrames: Buffer[] = []

        for (let frameIndex = 0; frameIndex < maxFrames; frameIndex++) {
          // Get the base layer for this frame
          const baseLayerIndex = 0
          const baseFrameIndex = frameIndex % layerPngs[baseLayerIndex].length
          let compositeImage = sharp(layerPngs[baseLayerIndex][baseFrameIndex])

          // Build overlay list for Sharp composite
          const overlays: sharp.OverlayOptions[] = []

          for (let layerIndex = 1; layerIndex < imageData.length; layerIndex++) {
            const layerFrameIndex = frameIndex % layerPngs[layerIndex].length
            const layerFrame = layerPngs[layerIndex][layerFrameIndex]

            overlays.push({
              input: layerFrame,
              gravity: 'center',
              blend: 'over',
            })
          }

          // Composite this frame using Sharp for accurate colors
          const compositedFrame = await compositeImage
            .composite(overlays)
            .png()
            .toBuffer()

          compositedFrames.push(compositedFrame)
        }

        // Now convert the Sharp-composited PNG frames to an animated GIF

        // Create GIF encoder
        const encoder = GIFEncoder()

        // Process all frames to get RGB data
        const allRgbFrames: Uint8Array[] = []

        for (const frame of compositedFrames) {
          const rgbData = await sharp(frame).raw().toBuffer()
          allRgbFrames.push(rgbData)
        }

        // Create global palette from all frames
        const combinedRgb = new Uint8Array(
          allRgbFrames.reduce((sum, frame) => sum + frame.length, 0)
        )
        let offset = 0
        for (const frame of allRgbFrames) {
          combinedRgb.set(frame, offset)
          offset += frame.length
        }

        const globalPalette = quantize(combinedRgb, 256)

        // Encode all frames
        for (const rgbFrame of allRgbFrames) {
          const indexedData = applyPalette(rgbFrame, globalPalette)

          encoder.writeFrame(indexedData, SVG_DEFAULT_SIZE, SVG_DEFAULT_SIZE, {
            palette: globalPalette,
            delay: 100, // 100ms = 10fps
            dispose: 2, // clear to background
          })
        }

        encoder.finish()
        const result = Buffer.from(encoder.bytesView())

        return { buffer: result, contentType: 'image/gif' }
      } catch (err) {
        console.error('Frame-by-frame composition failed:', err)

        // Fallback to single animated layer
        const animatedIndex = animationStatus.findIndex((isAnimated) => isAnimated)

        const fallbackBuffer = await sharp(imageData[animatedIndex], { animated: true })
          .resize(SVG_DEFAULT_SIZE, SVG_DEFAULT_SIZE, { fit: 'inside' })
          .gif({ loop: 0 })
          .toBuffer()

        return { buffer: fallbackBuffer, contentType: 'image/gif' }
      }
    } else {
      // All GIFs are static
      const resizedImages = await Promise.all(
        imageData.map(async (buffer) =>
          sharp(buffer)
            .resize(SVG_DEFAULT_SIZE, SVG_DEFAULT_SIZE, { fit: 'inside' })
            .gif()
            .toBuffer()
        )
      )

      const compositeParams = resizedImages.slice(1).map((buffer) => ({
        input: buffer,
        gravity: 'center' as const,
      }))

      const result = await sharp(resizedImages[0])
        .composite(compositeParams)
        .gif()
        .toBuffer()
      return { buffer: result, contentType: 'image/gif' }
    }
  } else {
    // Handle static images (PNG/SVG/other)
    const resizedImages = await Promise.all(
      imageData.map(async (buffer) =>
        sharp(buffer)
          .resize(SVG_DEFAULT_SIZE, SVG_DEFAULT_SIZE, { fit: 'inside' })
          .toBuffer()
      )
    )

    const compositeParams = resizedImages.slice(1).map((buffer) => ({
      input: buffer,
      gravity: 'center' as const,
    }))

    const result = await sharp(resizedImages[0])
      .composite(compositeParams)
      .webp({ quality: 75 })
      .toBuffer()

    return { buffer: result, contentType: 'image/webp' }
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let images = req.query.images

  if (!images || !images.length)
    return res.status(400).json({ error: 'No images provided' })

  const { maxAge, swr } = CACHE_TIMES.RENDERER

  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )

  // Handle HEAD request - return headers only
  if (req.method === 'HEAD') {
    if (typeof images === 'string') images = [images]

    try {
      // Get first image to detect format for content type
      const firstImageData = await getImageData(images[0])
      const format = detectImageFormat(firstImageData)

      let contentType = 'image/webp' // default for static images
      if (format === 'gif') {
        contentType = 'image/gif'
      }

      res.setHeader('Content-Type', contentType)
    } catch (err) {
      // Fallback to default content type if image detection fails
      res.setHeader('Content-Type', 'image/webp')
    }

    res.status(200).end()
    return
  }

  if (typeof images === 'string') images = [images]

  let imageData: Buffer[] = await Promise.all(
    images.map((imageUrl) => getImageData(imageUrl))
  )

  // All images are the same type - handle composition based on detected format
  const { buffer, contentType } = await composeImages(imageData)
  res.setHeader('Content-Type', contentType)
  res.send(buffer)
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

export default withCors()(handler)

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
}
