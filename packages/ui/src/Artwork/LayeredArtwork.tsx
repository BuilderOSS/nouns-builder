import type { GeneratedArtworkImage } from '@buildeross/types'
import { Box } from '@buildeross/zord'
import React from 'react'

const layerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain',
}

/** Stable React key for a generated preview. */
export const generatedArtworkKey = (image: GeneratedArtworkImage) =>
  image.type === 'single' ? image.src : image.layers.join('|')

/**
 * Stacks layer images (bottom first) so animated GIF layers keep playing,
 * matching how the stack-images renderer composites them.
 */
export const LayeredArtwork: React.FC<{ layers: string[]; alt?: string }> = ({
  layers,
  alt = '',
}) => (
  <Box position="relative" w="100%" h="100%">
    {layers.map((src, index) => (
      <img
        key={`${index}-${src}`}
        src={src}
        alt={index === 0 ? alt : ''}
        style={layerStyle}
      />
    ))}
  </Box>
)
