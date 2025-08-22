import { OrderedTraits } from '@buildeross/hooks/useArtworkPreview'
import { ImageProps } from '@buildeross/hooks/useArtworkUpload'
import { AnimatedModal } from '@buildeross/ui'
import { Flex, Icon } from '@buildeross/zord'

import { artworkPreviewGenerateButton, artworkPreviewImageWrapper } from './Artwork.css'
import { Playground } from './Playground'

export interface ArtworkPreviewProps {
  canvas: React.MutableRefObject<HTMLCanvasElement | null>
  generatedImages: any[]
  generateStackedImage: () => Promise<void>
  images: ImageProps[] | undefined
  orderedLayers: OrderedTraits
}

export const ArtworkPreview: React.FC<ArtworkPreviewProps> = ({
  canvas,
  generatedImages,
  generateStackedImage,
  images,
  orderedLayers,
}) => {
  return (
    <Flex align={'center'} justify={'center'} direction={'column'}>
      <Flex className={artworkPreviewImageWrapper} mb={'x8'}>
        {generatedImages[0] && (
          <img height={'100%'} width={'100%'} src={generatedImages[0]} alt="preview" />
        )}
        <canvas ref={canvas} style={{ display: 'none' }} />
      </Flex>
      <Flex
        mb={'x6'}
        align={'center'}
        onClick={() => generateStackedImage()}
        className={artworkPreviewGenerateButton}
      >
        <Flex w={'x6'} h={'x6'} mr={'x2'}>
          <Icon id="refresh" />
        </Flex>
        <Flex>Generate Randomized Preview</Flex>
      </Flex>
      <Flex></Flex>
      {images && orderedLayers && (
        <AnimatedModal
          size={'large'}
          trigger={<Flex>See more in Advanced Preview Playground</Flex>}
        >
          <Playground images={images} orderedLayers={orderedLayers} />
        </AnimatedModal>
      )}
    </Flex>
  )
}
