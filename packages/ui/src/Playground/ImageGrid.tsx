import { Box, Flex, Grid, Spinner } from '@buildeross/zord'
import React from 'react'

import {
  imageGridWrapperStyle,
  loadingImage,
  previewGeneratedImageStyle,
} from '../Artwork/Artwork.css'
import { FallbackImage } from '../FallbackImage'

export const ImageGrid: React.FC<{ generatedImages: string[] }> = ({
  generatedImages,
}) => {
  return (
    <Grid gap="x4" className={imageGridWrapperStyle}>
      {generatedImages &&
        generatedImages.map((image: string) => (
          <Box className={previewGeneratedImageStyle} key={image} position="relative">
            <FallbackImage
              src={image}
              alt=""
              height={'100%'}
              width={'100%'}
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
              }}
              loadingPlaceholder={
                <Flex
                  position="absolute"
                  top="x0"
                  right="x0"
                  bottom="x0"
                  left="x0"
                  className={loadingImage}
                  align="center"
                  justify="center"
                >
                  <Spinner />
                </Flex>
              }
            />
          </Box>
        ))}
    </Grid>
  )
}
