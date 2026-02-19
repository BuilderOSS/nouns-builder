import { BASE_URL } from '@buildeross/constants/baseUrl'
import { RENDERER_BASE } from '@buildeross/constants/rendererBase'
import {
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

export interface UseArtworkPreviewReturn {
  layers: OrderedTraits
  generateStackedImage: (e?: BaseSyntheticEvent) => void
  generatedImages: string[]
  canvas: React.RefObject<HTMLCanvasElement>
  images: ImageProps[] | undefined
}

const MAX_GENERATED_IMAGES = 20

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
      if (Array.isArray(ipfsUpload) && traits.length) {
        return ipfsUpload.reduce((acc: ImageProps[] = [], upload) => {
          const index = traits.map((e: any) => e.trait).indexOf(upload.trait)
          const childIndex = traits[index]?.properties.indexOf(upload.name)
          const trait = traits[index]?.trait
          const property = traits[index]?.properties[childIndex]

          const path = `/${sanitizeFileName(`${trait}/${property}`)}`
          const uri = encodeURI(upload.ipfs.uri + path)

          const image: ImageProps = {
            trait: trait,
            name: property,
            uri: uri,
          }

          const isContentValid = upload?.content && upload?.content?.size > 0

          if (isContentValid) {
            image.content = upload?.content
          }

          acc.push(image)
          return acc
        }, [])
      }
    } catch (err) {
      console.error('Error parsing ipfs upload', err)
      return []
    }

    return []
  }, [traits, ipfsUpload])

  return images
}

export const useArtworkPreview = ({
  images,
  orderedLayers,
  selectedTraits,
}: UseArtworkPreviewProps) => {
  const canvas = React.useRef<HTMLCanvasElement | null>(null)
  const [generatedImages, setGeneratedImages] = React.useState<string[]>([])
  const usedBlobUrls = React.useRef<string[]>([])
  const isMountedRef = React.useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      // Cleanup blob URLs on unmount
      usedBlobUrls.current.forEach((url) => URL.revokeObjectURL(url))
      usedBlobUrls.current = []
    }
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
      return { imagesToDraw: [], hasLocalFile: false, imageLayerStack: [] }

    const traits = selectTraits()

    const stack = traits.map((trait) => {
      if (!!trait.content) {
        const blobUrl = URL.createObjectURL(trait.content)
        usedBlobUrls.current.push(blobUrl)
        return blobUrl
      }
      return trait.uri
    })

    const imageLayerStack = stack.reverse()
    const hasLocalFile = traits.some((trait) => !!trait.content)

    const imagesToDraw = imageLayerStack.map((src) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = src
      return img
    })

    return { imagesToDraw, hasLocalFile, imageLayerStack }
  }, [layers, selectTraits])

  const canvasToBlob = React.useCallback((canvas: HTMLCanvasElement, stack: string[]) => {
    if (canvas.height > 0) {
      const data = canvas.toDataURL()
      stack.forEach((blob) => {
        if (blob.startsWith('blob:')) URL.revokeObjectURL(blob)
      })

      usedBlobUrls.current = []

      if (isMountedRef.current) {
        setGeneratedImages((images) => [
          data,
          ...images.slice(0, MAX_GENERATED_IMAGES - 1),
        ]) // Keep only last MAX_GENERATED_IMAGES
      }
    }
  }, [])

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

        const { imagesToDraw, hasLocalFile, imageLayerStack } = selectImagesToDraw()

        const draw = () => {
          _canvas.width = imagesToDraw[0].naturalWidth
          _canvas.height = imagesToDraw[0].naturalHeight
          imagesToDraw.forEach((img) => {
            ctx.drawImage(img, 0, 0)
          })
          canvasToBlob(_canvas, imageLayerStack)
        }

        if (hasLocalFile) {
          await Promise.all(
            imagesToDraw.map(
              (img) =>
                new Promise<void>((resolve, reject) => {
                  img.onload = () => resolve()
                  img.onerror = () =>
                    reject(new Error(`Image failed to load: ${img.src}`))
                })
            )
          )
          if (genIdRef.current !== myGenId) return
          draw()
        } else {
          const rendererBase = RENDERER_BASE.replace('https://nouns.build', BASE_URL)
          const url = new URL(rendererBase)
          for (const image of imageLayerStack) {
            url.searchParams.append('images', encodeURI(image))
          }

          if (isMountedRef.current) {
            setGeneratedImages((images) => [
              url.href,
              ...images.slice(0, MAX_GENERATED_IMAGES - 1),
            ]) // Keep only last MAX_GENERATED_IMAGES
          }
        }
      } catch (err) {
        console.error('Error generating image', err)
      }
    },
    [canvas, canvasToBlob, selectImagesToDraw, layers]
  )

  const hasAutoGeneratedRef = React.useRef(false)

  useEffect(() => {
    if (!layers.length) {
      hasAutoGeneratedRef.current = false
      setGeneratedImages([])

      // cleanup any pending blob URLs
      usedBlobUrls.current.forEach((url) => URL.revokeObjectURL(url))
      usedBlobUrls.current = []
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
