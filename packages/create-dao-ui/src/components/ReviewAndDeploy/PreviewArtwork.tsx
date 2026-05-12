import { Box, Flex } from '@buildeross/zord'

import { useFormStore } from '../../stores'

export const PreviewArtwork: React.FC = () => {
  const { ipfsUpload, orderedLayers } = useFormStore()

  const filesCount = ipfsUpload ? ipfsUpload.length : 0
  const traitCategoriesCount = orderedLayers?.length || 0
  const totalTraitOptions = orderedLayers
    ? orderedLayers.reduce((acc, layer) => {
        return acc + (layer.properties?.length || 0)
      }, 0)
    : 0

  return (
    <Flex direction="column" gap="x2">
      <Box>{filesCount} PNG files</Box>
      <Box>{traitCategoriesCount} trait categories</Box>
      <Box>{totalTraitOptions} total trait options</Box>
    </Flex>
  )
}
