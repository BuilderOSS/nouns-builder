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

/** Object URL for a Blob, created and revoked with the component's lifecycle. */
const useSourceUrl = (source: string | Blob): string | undefined => {
  const [url, setUrl] = React.useState(typeof source === 'string' ? source : undefined)

  React.useEffect(() => {
    if (typeof source === 'string') {
      setUrl(source)
      return
    }
    const objectUrl = URL.createObjectURL(source)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [source])

  return url
}

const Layer: React.FC<{ source: string | Blob; alt: string }> = ({ source, alt }) => {
  const src = useSourceUrl(source)
  if (!src) return null
  return <img src={src} alt={alt} style={layerStyle} />
}

/**
 * Stacks layer images (bottom first) so animated GIF layers keep playing,
 * matching how the stack-images renderer composites them.
 */
export const LayeredArtwork: React.FC<{
  layers: Extract<GeneratedArtworkImage, { type: 'layered' }>['layers']
  alt?: string
}> = ({ layers, alt = '' }) => (
  <Box position="relative" w="100%" h="100%">
    {layers.map((source, index) => (
      <Layer key={index} source={source} alt={index === 0 ? alt : ''} />
    ))}
  </Box>
)
