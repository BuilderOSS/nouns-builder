import { BASE_URL } from '@buildeross/constants/baseUrl'
import { RENDERER_BASE } from '@buildeross/constants/rendererBase'
import {
  GeneratedArtworkImage,
  ImageProps,
  ImagesByTraitProps,
  IPFSUpload,
  OrderedTraits,
  SelectedTraitsProps,
  Trait,
} from '@buildeross/types'
import { sanitizeFileName } from '@buildeross/utils/sanitize'
import React, { BaseSyntheticEvent, useEffect } from 'react'

export type UseArtworkPreviewProps = {
  images: ImageProps[] | undefined
  orderedLayers: OrderedTraits | undefined
  selectedTraits?: SelectedTraitsProps[]
}

export type LayerProps = {
  trait: string
  images: ImageProps[]
}

export interface UseArtworkPreviewReturn {
  layers: LayerProps[]
  generateStackedImage: (e?: BaseSyntheticEvent) => Promise<void>
  generatedImages: GeneratedArtworkImage[]
  canvas: React.RefObject<HTMLCanvasElement | null>
}

const MAX_GENERATED_IMAGES = 20

const isGifLayer = ({ uri, content }: SelectedTraitsProps) =>
  content?.type === 'image/gif' || /\.gif(?:$|[?#])/i.test(uri ?? '')

export type UseArtworkImagesProps = {
  ipfsUpload?: IPFSUpload[]
  traits?: Trait[]
}

export const useArtworkImages = ({
  ipfsUpload,
  traits,
}: UseArtworkImagesProps): ImageProps[] | undefined => {
  const images = React.useMemo(() => {
    if (!ipfsUpload?.length || !traits?.length) return undefined

    try {
      return ipfsUpload.reduce((acc: ImageProps[] = [], upload) => {
        const index = traits.map((e: Trait) => e.trait).indexOf(upload.trait)
        if (index === -1) return acc // trait not found - skip

        const trait = traits[index].trait
        const childIndex = traits[index].properties.indexOf(upload.name)

        if (childIndex === -1) return acc // property not found - skip

        const property = traits[index].properties[childIndex]
        const path = `/${sanitizeFileName(`${trait}/${property}`)}`
        const uri = encodeURI(upload.ipfs.uri + path)

        const image: ImageProps = { trait, name: property, uri }

        if (upload.content && upload.content.size > 0) {
          image.content = upload?.content
        }

        acc.push(image)
        return acc
      }, [])
    } catch (err) {
      console.error('Error parsing ipfs upload', err)
      return []
    }
  }, [traits, ipfsUpload])

  return images
}

export const useArtworkPreview = ({
  images,
  orderedLayers,
  selectedTraits,
}: UseArtworkPreviewProps): UseArtworkPreviewReturn => {
  const canvas = React.useRef<HTMLCanvasElement | null>(null)
  const [generatedImages, setGeneratedImages] = React.useState<GeneratedArtworkImage[]>(
    []
  )
  const isMountedRef = React.useRef(false)
  const nextImageIdRef = React.useRef(0)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  type NewImage =
    | Omit<Extract<GeneratedArtworkImage, { type: 'single' }>, 'id'>
    | Omit<Extract<GeneratedArtworkImage, { type: 'layered' }>, 'id'>

  const pushGeneratedImage = React.useCallback((image: NewImage) => {
    if (!isMountedRef.current) return
    const withId = {
      ...image,
      id: String(++nextImageIdRef.current),
    } as GeneratedArtworkImage
    // Keep only last MAX_GENERATED_IMAGES
    setGeneratedImages((images) => [withId, ...images.slice(0, MAX_GENERATED_IMAGES - 1)])
  }, [])

  const layers = React.useMemo(() => {
    if (!images || !orderedLayers) return []

    const traitMap = new Map(
      orderedLayers.map((item, index) => [
        item.trait.trim().toLowerCase(),
        { trait: item.trait, index },
      ])
    )

    const grouped: { [key: string]: ImagesByTraitProps & { index: number } } = {}

    for (const image of images) {
      const normalizedTrait = image.trait?.trim().toLowerCase()
      const traitInfo = traitMap.get(normalizedTrait)

      if (traitInfo) {
        if (!grouped[normalizedTrait]) {
          grouped[normalizedTrait] = {
            trait: traitInfo.trait,
            images: [image],
            index: traitInfo.index,
          }
        } else {
          grouped[normalizedTrait].images.push(image)
        }
      }
    }

    return Object.values(grouped)
      .sort((a, b) => a.index - b.index)
      .map(({ trait, images }) => ({
        trait: trait.replace(/^\d+-/, ''),
        images,
      }))
  }, [images, orderedLayers])

  const selectTraits = React.useCallback((): SelectedTraitsProps[] => {
    return layers.map((layer) => {
      const selectedTrait = selectedTraits?.find((trait) => trait.picker === layer.trait)
      if (selectedTrait) return selectedTrait

      const randomIndex = Math.floor(Math.random() * layer.images.length)
      const selectedImage = layer.images[randomIndex]
      return {
        picker: 'random',
        trait: layer.trait,
        uri: selectedImage.uri,
        content: selectedImage.content,
      }
    })
  }, [selectedTraits, layers])

  const selectImagesToDraw = React.useCallback(() => {
    if (!layers || !layers.length)
      return { layerSources: [], hasLocalFile: false, hasGif: false }

    const traits = selectTraits()

    // Bottom layer first; local files stay as Files until something needs a URL
    const layerSources: Array<string | File> = traits
      .map((trait) => trait.content ?? trait.uri)
      .reverse()
    const hasLocalFile = traits.some((trait) => !!trait.content)
    const hasGif = traits.some(isGifLayer)

    return { layerSources, hasLocalFile, hasGif }
  }, [layers, selectTraits])

  const genIdRef = React.useRef(0)

  const generateStackedImage = React.useCallback(
    async (e?: BaseSyntheticEvent) => {
      try {
        const myGenId = ++genIdRef.current
        if (e) e.stopPropagation()
        if (!canvas.current) throw new Error('No canvas')
        if (!layers.length) throw new Error('No layers')

        const _canvas = canvas.current
        const ctx = _canvas.getContext('2d')
        if (!ctx) return

        const { layerSources, hasLocalFile, hasGif } = selectImagesToDraw()

        if (hasLocalFile && hasGif) {
          // A canvas would freeze GIFs on their first frame; stack the layers instead
          pushGeneratedImage({ type: 'layered', layers: layerSources })
          return
        }

        if (hasLocalFile) {
          // Short-lived object URLs: only needed until the canvas has been drawn
          const srcs = layerSources.map((source) =>
            typeof source === 'string' ? source : URL.createObjectURL(source)
          )
          try {
            const imagesToDraw = srcs.map((src) => {
              const img = new Image()
              img.crossOrigin = 'anonymous'
              img.src = src
              return img
            })
            await Promise.all(
              imagesToDraw.map(
                (img) =>
                  new Promise<void>((resolve, reject) => {
                    if (img.complete && img.naturalWidth) return resolve()
                    img.onload = () => resolve()
                    img.onerror = () =>
                      reject(new Error(`Image failed to load: ${img.src}`))
                  })
              )
            )
            if (genIdRef.current !== myGenId) return

            _canvas.width = imagesToDraw[0].naturalWidth
            _canvas.height = imagesToDraw[0].naturalHeight
            imagesToDraw.forEach((img) => {
              ctx.drawImage(img, 0, 0)
            })
            if (_canvas.height > 0) {
              pushGeneratedImage({ type: 'single', src: _canvas.toDataURL() })
            }
          } finally {
            srcs.forEach((src) => {
              if (src.startsWith('blob:')) URL.revokeObjectURL(src)
            })
          }
        } else {
          const rendererBase = RENDERER_BASE.replace('https://nouns.build', BASE_URL)
          const url = new URL(rendererBase)
          for (const image of layerSources) {
            url.searchParams.append('images', encodeURI(image as string))
          }
          // Animated WebP keeps full colour and alpha for in-app previews
          if (hasGif) url.searchParams.set('format', 'webp')

          pushGeneratedImage({ type: 'single', src: url.href })
        }
      } catch (err) {
        console.error('Error generating image', err)
      }
    },
    [canvas, pushGeneratedImage, selectImagesToDraw, layers]
  )

  const hasAutoGeneratedRef = React.useRef(false)

  useEffect(() => {
    if (!layers.length) {
      hasAutoGeneratedRef.current = false
      setGeneratedImages([])
    }
  }, [layers.length])

  useEffect(() => {
    if (!layers.length) return
    if (hasAutoGeneratedRef.current) return
    hasAutoGeneratedRef.current = true

    generateStackedImage()
  }, [layers.length, generateStackedImage])

  return {
    layers,
    generateStackedImage,
    generatedImages,
    canvas,
  }
}
