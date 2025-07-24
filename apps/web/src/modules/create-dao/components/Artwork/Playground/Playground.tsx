import {
  SelectedTraitsProps,
  useArtworkPreview,
} from '@buildeross/hooks/useArtworkPreview'
import { ImageProps } from '@buildeross/hooks/useArtworkUpload'
import { Button, Flex } from '@buildeross/zord'
import React, { BaseSyntheticEvent } from 'react'
import {
  previewGridWrapperStyle,
  previewHeadingStyle,
  previewLayerSelectorWrapperStyle,
  previewModalWrapperStyle,
  previewWrapperInnerStyle,
} from 'src/styles/Artwork.css'

import { useFormStore } from '../../../stores'
import { ImageGrid } from './ImageGrid'
import { LayerMenu } from './LayerMenu'

export interface PlaygroundProps {
  images: ImageProps[]
}

export const Playground: React.FC<PlaygroundProps> = ({ images }) => {
  const { orderedLayers } = useFormStore()

  const [selectedTraits, setSelectedTraits] = React.useState<SelectedTraitsProps[]>([])

  const { layers, canvas, generateStackedImage, generatedImages } = useArtworkPreview({
    images,
    orderedLayers,
    selectedTraits,
  })

  return (
    <Flex direction={'column'} className={previewModalWrapperStyle}>
      <h3 className={previewHeadingStyle}>Preview Artwork</h3>
      <Flex direction={'row'} gap={'x6'} className={previewWrapperInnerStyle}>
        <Flex
          className={previewLayerSelectorWrapperStyle}
          direction={'column'}
          justify="flex-start"
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
