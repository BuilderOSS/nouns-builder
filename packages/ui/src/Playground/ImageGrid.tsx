import { LayeredImageData } from '@buildeross/hooks/useArtworkPreview'
import { Box, Flex, Grid } from '@buildeross/zord'
import React from 'react'

import { imageGridWrapperStyle, previewGeneratedImageStyle } from '../Artwork/Artwork.css'

export const ImageGrid: React.FC<{ generatedImages: LayeredImageData[] }> = ({
  generatedImages,
}) => {
  return (
    <Grid gap="x4" className={imageGridWrapperStyle}>
      {generatedImages &&
        generatedImages.map((imageData: LayeredImageData, index: number) => (
          <Box className={previewGeneratedImageStyle} key={index}>
            {imageData.type === 'single' ? (
              <img src={imageData.url} alt="" height={'100%'} width={'100%'} />
            ) : (
              <Flex position="relative" height={'100%'} width={'100%'}>
                {imageData.layers?.map((layer, layerIndex) => (
                  <img
                    key={layerIndex}
                    src={layer.url}
                    alt={layer.trait}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      zIndex: layerIndex,
                    }}
                  />
                ))}
              </Flex>
            )}
          </Box>
        ))}
    </Grid>
  )
}
