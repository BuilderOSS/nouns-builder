import { LayeredImageData } from '@buildeross/hooks/useArtworkPreview'
import { ImageProps, OrderedTraits } from '@buildeross/types'
import { Flex, Icon } from '@buildeross/zord'

import { AnimatedModal } from '../Modal'
import { Playground } from '../Playground'
import { artworkPreviewGenerateButton, artworkPreviewImageWrapper } from './Artwork.css'

export interface ArtworkPreviewProps {
  canvas: React.MutableRefObject<HTMLCanvasElement | null>
  generatedImages: LayeredImageData[]
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
        {generatedImages[0] &&
          (generatedImages[0].type === 'single' ? (
            <img
              height={'100%'}
              width={'100%'}
              src={generatedImages[0].url}
              alt="preview"
            />
          ) : (
            <Flex position="relative" height={'100%'} width={'100%'}>
              {generatedImages[0].layers?.map((layer, index) => (
                <img
                  key={index}
                  src={layer.url}
                  alt={layer.trait}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    zIndex: index,
                  }}
                />
              ))}
            </Flex>
          ))}
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
