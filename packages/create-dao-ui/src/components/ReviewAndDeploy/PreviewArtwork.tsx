import { Box, Flex } from '@buildeross/zord'
import React from 'react'

import { useFormStore } from '../../stores'

export const PreviewArtwork: React.FC = () => {
  const { ipfsUpload, orderedLayers } = useFormStore()

  const filesCount = React.useMemo(() => {
    if (!ipfsUpload) return 0
    return Object.keys(ipfsUpload).length
  }, [ipfsUpload])

  const traitCategoriesCount = React.useMemo(() => {
    return orderedLayers?.length || 0
  }, [orderedLayers])

  const totalTraitOptions = React.useMemo(() => {
    if (!orderedLayers) return 0
    return orderedLayers.reduce((acc, layer) => {
      return acc + (layer.properties?.length || 0)
    }, 0)
  }, [orderedLayers])

  return (
    <Flex direction="column" gap="x2" fontSize="sm">
      <Box>{filesCount} PNG files</Box>
      <Box>{traitCategoriesCount} trait categories</Box>
      <Box>{totalTraitOptions} total trait options</Box>
    </Flex>
  )
}
