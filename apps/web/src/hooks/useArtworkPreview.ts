import React, { BaseSyntheticEvent } from 'react'

import { OrderedTraits } from 'src/components/Artwork/LayerBox'
import { BASE_URL } from 'src/constants/baseUrl'
import { RENDERER_BASE } from 'src/constants/rendererBase'

import { ImageProps } from './useArtworkUpload'

export interface UseArtworkPreviewProps {
  orderedLayers: OrderedTraits
  images?: ImageProps[]
  selectedTraits?: SelectedTraitsProps[]
}

export interface ImagesByTraitProps {
  trait: string
  images: ImageProps[]
}

export interface SelectedTraitsProps {
  picker: string
  trait: string
  uri: string
  url: string
  content?: File
}

export const useArtworkPreview = ({
  images,
  orderedLayers,
  selectedTraits,
}: UseArtworkPreviewProps) => {
  const canvas = React.useRef<HTMLCanvasElement | null>(null)
  const [generatedImages, setGeneratedImages] = React.useState<string[]>([])
  const [isInit, setIsInit] = React.useState<boolean>(true)

  // Group images by trait
  // Build layer structure
  const layers = React.useMemo(() => {
    if (!images || !orderedLayers) return []
    console.log('images', images)
    console.log('orderedLayers', orderedLayers)

    const imagesByTrait = images.reduce((acc: ImagesByTraitProps[], image) => {
      const trait = image.trait
      const propertyTrait = orderedLayers.find(
        (item) => item?.trait?.replace(/\s/g, '') === image?.trait?.replace(/\s/g, '')
      )
      const orderedIndex = orderedLayers.indexOf(propertyTrait!)
      const existingIndex = acc.findIndex((e) => e.trait === trait)

      if (existingIndex === -1) {
        acc[orderedIndex] = { trait, images: [image] }
      } else {
        acc[existingIndex].images.push(image)
      }

      return acc
    }, [])

    return imagesByTrait.map((layer) => ({
      trait: layer.trait.replace(/^\d+-/, ''),
      images: layer.images,
    }))
  }, [images, orderedLayers])

  console.log('layers', layers)

  const selectTraits = React.useCallback(() => {
    if (!layers) return []

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

  console.log('outer selectedTraits', selectedTraits)

  const selectImagesToDraw = React.useCallback(() => {
    if (!layers || !layers.length)
      return { imagesToDraw: [], hasLocalFile: false, imageLayerStack: [] }

    // Select one random image per trait
    const traits: SelectedTraitsProps[] = selectTraits()
    console.log('selectedTraits', traits)
    // Generate local/remote URLs for stacking

    const stack = traits.map((trait) => {
      const isLocal = trait.content && trait.content?.webkitRelativePath?.length > 0
      return isLocal && trait.content ? URL.createObjectURL(trait.content) : trait.url
    })

    const imageLayerStack = stack.reverse()

    console.log('imageLayerStack', imageLayerStack)

    // Determine if any trait is using a local file
    const hasLocalFile = traits.some(
      (trait) => !!trait.content && trait.content?.webkitRelativePath?.length > 0
    )

    console.log('hasLocalFile', hasLocalFile)

    console.log('imageLayerStack', imageLayerStack)

    // Convert image URLs into Image objects for canvas rendering
    const imagesToDraw = imageLayerStack.map((src) => {
      const img = new Image()
      img.src = src
      return img
    })

    console.log('imagesToDraw', imagesToDraw)

    return { imagesToDraw, hasLocalFile, imageLayerStack }
  }, [layers, selectTraits])

  // Draw stacked image on canvas
  const canvasToBlob = React.useCallback((canvas: HTMLCanvasElement, stack: string[]) => {
    if (canvas.height > 0) {
      const data = canvas.toDataURL()
      stack.forEach((blob) => {
        if (blob.startsWith('blob:')) URL.revokeObjectURL(blob)
      })

      setGeneratedImages((images) => [data, ...images])
    }
  }, [])

  const generateStackedImage = React.useCallback(
    async (e?: BaseSyntheticEvent) => {
      try {
        if (e) e.stopPropagation()
        console.log('generateStackedImage')
        if (!canvas.current || !layers.length) return

        const _canvas = canvas.current
        const ctx = _canvas.getContext('2d')

        const { imagesToDraw, hasLocalFile, imageLayerStack } = selectImagesToDraw()

        console.log('imagesToDraw', imagesToDraw)

        const draw = () => {
          _canvas.width = imagesToDraw[0].naturalWidth
          _canvas.height = imagesToDraw[0].naturalHeight

          imagesToDraw.forEach((img) => {
            ctx?.drawImage(img, 0, 0)
          })

          canvasToBlob(_canvas, imageLayerStack)
        }

        if (hasLocalFile) {
          if (isInit) {
            imagesToDraw[0].onload = () => {
              draw()
              setIsInit(false)
            }
          } else {
            draw()
          }
        } else {
          const rendererBase = RENDERER_BASE.replace('https://nouns.build', BASE_URL)
          const url = new URL(rendererBase)
          for (const image of imageLayerStack) {
            url.searchParams.append('images', encodeURI(image))
          }
          setGeneratedImages((images) => [url.href, ...images])
        }
      } catch (err) {
        console.error('Error generating image', err)
      }
    },
    [canvas, isInit, canvasToBlob, selectImagesToDraw, layers]
  )

  return {
    layers,
    generateStackedImage,
    generatedImages,
    canvas,
  }
}
