import { BASE_URL } from '@buildeross/constants/baseUrl'
import { RENDERER_BASE } from '@buildeross/constants/rendererBase'
import {
  ImageProps,
  ImagesByTraitProps,
  OrderedTraits,
  SelectedTraitsProps,
} from '@buildeross/types'
import React, { BaseSyntheticEvent, useEffect } from 'react'

export interface UseArtworkPreviewProps {
  orderedLayers: OrderedTraits
  images?: ImageProps[]
  selectedTraits?: SelectedTraitsProps[]
}

export interface LayeredImageData {
  type: 'single' | 'layered'
  url?: string
  layers?: Array<{
    url: string
    isGif: boolean
    trait: string
  }>
}

const MAX_GENERATED_IMAGES = 20

const isGif = (src: string, content?: File): boolean => {
  if (content && content.type === 'image/gif') return true
  if (src.toLowerCase().includes('.gif')) return true
  return false
}

export const useArtworkPreview = ({
  images,
  orderedLayers,
  selectedTraits,
}: UseArtworkPreviewProps) => {
  const canvas = React.useRef<HTMLCanvasElement | null>(null)
  const [generatedImages, setGeneratedImages] = React.useState<LayeredImageData[]>([])
  const [isInit, setIsInit] = React.useState<boolean>(true)
  const usedBlobUrls = React.useRef<string[]>([])
  const isMountedRef = React.useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      // Cleanup blob URLs on unmount
      usedBlobUrls.current.forEach((url) => URL.revokeObjectURL(url))
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
        url: selectedImage.url,
        content: selectedImage.content as File,
      }
    })
  }, [selectedTraits, layers])

  const selectImagesToDraw = React.useCallback(() => {
    if (!layers || !layers.length)
      return {
        imagesToDraw: [],
        hasLocalFile: false,
        imageLayerStack: [],
        hasGif: false,
        traits: [],
      }

    const traits = selectTraits()

    const stack = traits.map((trait) => {
      const isLocal = trait.content && trait.content?.webkitRelativePath?.length > 0
      if (isLocal && trait.content) {
        const blobUrl = URL.createObjectURL(trait.content)
        usedBlobUrls.current.push(blobUrl)
        return blobUrl
      }
      return trait.url
    })

    const imageLayerStack = stack.reverse()
    const hasLocalFile = traits.some(
      (trait) => !!trait.content && trait.content?.webkitRelativePath?.length > 0
    )

    const hasGif = traits.some((trait) => isGif(trait.url, trait.content))

    const imagesToDraw = imageLayerStack.map((src) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = src
      return img
    })

    return { imagesToDraw, hasLocalFile, imageLayerStack, hasGif, traits }
  }, [layers, selectTraits])

  const canvasToBlob = React.useCallback((canvas: HTMLCanvasElement, stack: string[]) => {
    if (canvas.height > 0) {
      const data = canvas.toDataURL()
      stack.forEach((blob) => {
        if (blob.startsWith('blob:')) URL.revokeObjectURL(blob)
      })

      usedBlobUrls.current = []

      if (isMountedRef.current) {
        const layeredData: LayeredImageData = {
          type: 'single',
          url: data,
        }
        setGeneratedImages((images) => [
          layeredData,
          ...images.slice(0, MAX_GENERATED_IMAGES - 1),
        ]) // Keep only last MAX_GENERATED_IMAGES
      }
    }
  }, [])

  const createLayeredPreview = React.useCallback(
    (traits: SelectedTraitsProps[]): LayeredImageData => {
      const layers = traits
        .map((trait) => {
          const isLocal = trait.content && trait.content?.webkitRelativePath?.length > 0
          let url: string

          if (isLocal && trait.content) {
            const blobUrl = URL.createObjectURL(trait.content)
            usedBlobUrls.current.push(blobUrl)
            url = blobUrl
          } else {
            url = trait.url
          }

          return {
            url,
            isGif: isGif(trait.url, trait.content),
            trait: trait.trait,
          }
        })
        .reverse() // Reverse to match the stacking order

      const hasLocalFiles = traits.some(
        (trait) => trait.content && trait.content?.webkitRelativePath?.length > 0
      )

      // If there are no local files, try to use the renderer service for single URL
      if (!hasLocalFiles) {
        const rendererBase = RENDERER_BASE.replace('https://nouns.build', BASE_URL)
        const url = new URL(rendererBase)
        layers.forEach((layer) => {
          url.searchParams.append('images', encodeURIComponent(layer.url))
        })

        return {
          type: 'single',
          url: url.href,
        }
      }

      // For local files or when we want to preserve individual layer control,
      // return layered data for CSS-based composition
      return {
        type: 'layered',
        layers,
      }
    },
    []
  )

  const generateStackedImage = React.useCallback(
    async (e?: BaseSyntheticEvent) => {
      try {
        if (e) e.stopPropagation()
        if (!canvas.current) throw new Error('No canvas')
        if (!layers.length) throw new Error('No layers')

        const _canvas = canvas.current
        const ctx = _canvas.getContext('2d')
        if (!ctx) return

        const { imagesToDraw, hasLocalFile, imageLayerStack, hasGif, traits } =
          selectImagesToDraw()

        // Handle GIF layers with layered composition
        if (hasGif) {
          const layeredPreview = createLayeredPreview(traits)
          if (isMountedRef.current) {
            setGeneratedImages((images) => [
              layeredPreview,
              ...images.slice(0, MAX_GENERATED_IMAGES - 1),
            ])
            if (isInit) setIsInit(false)
            return
          }
        }

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
          draw()
          if (isInit) setIsInit(false)
        } else {
          const rendererBase = RENDERER_BASE.replace('https://nouns.build', BASE_URL)
          const url = new URL(rendererBase)
          for (const image of imageLayerStack) {
            url.searchParams.append('images', encodeURI(image))
          }

          if (isMountedRef.current) {
            const layeredData: LayeredImageData = {
              type: 'single',
              url: url.href,
            }
            setGeneratedImages((images) => [
              layeredData,
              ...images.slice(0, MAX_GENERATED_IMAGES - 1),
            ]) // Keep only last MAX_GENERATED_IMAGES
          }
        }
      } catch (err) {
        console.error('Error generating image', err)
      }
    },
    [canvas, isInit, canvasToBlob, selectImagesToDraw, layers, createLayeredPreview]
  )

  return {
    layers,
    generateStackedImage,
    generatedImages,
    canvas,
  }
}
