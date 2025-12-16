import { useArtworkPreview } from '@buildeross/hooks/useArtworkPreview'
import { ImageProps, OrderedTraits, SelectedTraitsProps } from '@buildeross/types'
import { Button, Flex, Text } from '@buildeross/zord'
import React, { BaseSyntheticEvent } from 'react'

import {
  previewGridWrapperStyle,
  previewHeadingStyle,
  previewLayerSelectorWrapperStyle,
  previewModalWrapperStyle,
  previewWrapperInnerStyle,
} from '../Artwork/Artwork.css'
import { ImageGrid } from './ImageGrid'
import { LayerMenu } from './LayerMenu'

export interface PlaygroundProps {
  images: ImageProps[]
  orderedLayers: OrderedTraits
}

export const Playground: React.FC<PlaygroundProps> = ({ images, orderedLayers }) => {
  const [selectedTraits, setSelectedTraits] = React.useState<SelectedTraitsProps[]>([])

  const { layers, canvas, generateStackedImage, generatedImages } = useArtworkPreview({
    images,
    orderedLayers,
    selectedTraits,
  })

  return (
    <Flex direction={'column'} className={previewModalWrapperStyle}>
      <Text variant="heading-md" className={previewHeadingStyle}>
        Preview Artwork
      </Text>
      <Flex direction={'row'} gap={'x6'} className={previewWrapperInnerStyle}>
        <Flex
          className={previewLayerSelectorWrapperStyle}
          direction={'column'}
          justify="flex-start"
          gap={'x6'}
        >
          {layers && (
            <LayerMenu
              layers={layers}
              selectedTraits={selectedTraits}
              setSelectedTraits={setSelectedTraits}
            />
          )}
          <Button
            width="100%"
            style={{ alignSelf: 'center', borderRadius: '16px' }}
            onClick={(e: BaseSyntheticEvent) => generateStackedImage(e)}
            disabled={!layers.length}
          >
            Generate
          </Button>
        </Flex>
        <Flex className={previewGridWrapperStyle}>
          <canvas ref={canvas} style={{ display: 'none' }} />
          {generatedImages.length ? (
            <ImageGrid generatedImages={generatedImages} />
          ) : null}
        </Flex>
      </Flex>
    </Flex>
  )
}
