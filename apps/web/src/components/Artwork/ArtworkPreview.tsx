import { Flex } from '@zoralabs/zord'

import {
  artworkPreviewGenerateButton,
  artworkPreviewImageWrapper,
} from 'src/components/Fields/styles.css'
import { ImageProps } from 'src/hooks/useArtworkUpload'
import { Playground } from 'src/modules/create-dao'

import { Icon } from '../Icon'
import AnimatedModal from '../Modal/AnimatedModal'

export interface ArtworkPreviewProps {
  canvas: React.MutableRefObject<HTMLCanvasElement | null>
  generatedImages: any[]
  generateStackedImage: () => Promise<void>
  images: ImageProps[] | undefined
}

export const ArtworkPreview: React.FC<ArtworkPreviewProps> = ({
  canvas,
  generatedImages,
  generateStackedImage,
  images,
}) => {
  return (
    <Flex align={'center'} justify={'center'} direction={'column'}>
      <Flex className={artworkPreviewImageWrapper} mb={'x8'}>
        <img height={'100%'} width={'100%'} src={generatedImages[0]} alt="preview" />
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
      {images && (
        <AnimatedModal
          size={'large'}
          trigger={<Flex>See more in Advanced Preview Playground</Flex>}
        >
          <Playground images={images} />
        </AnimatedModal>
      )}
    </Flex>
  )
}
