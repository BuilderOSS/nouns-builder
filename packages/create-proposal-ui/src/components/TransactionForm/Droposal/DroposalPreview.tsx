import { ContentPreview } from '@buildeross/ui/ContentPreview'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import { FormikProps } from 'formik'

import { StickyPreviewContainer } from '../../StickyPreviewContainer'
import { EditionType } from './DroposalForm'
import { DroposalFormValues } from './DroposalForm.schema'

interface DroposalPreviewProps {
  formik: FormikProps<DroposalFormValues>
  editionType: EditionType
}

export const DroposalPreview: React.FC<DroposalPreviewProps> = ({
  formik,
  editionType,
}) => {
  const { mediaUrl, coverUrl, mediaType, name, description, pricePerMint, maxSupply } =
    formik.values
  return (
    <StickyPreviewContainer align="stretch">
      <Stack gap="x4">
        <ContentPreview
          name={name || 'Collection name'}
          description={description || 'description'}
          imageUrl={coverUrl}
          mediaUrl={mediaUrl}
          mediaMimeType={mediaType}
          type="drop"
        />
        <Flex mt="x4">
          <Box>
            <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
              EDITION PRICE
            </Text>
            <Text variant="heading-sm" style={{ fontWeight: 'bold' }}>
              {pricePerMint || '0.00'} ETH
            </Text>
          </Box>
          <Box ml="x8">
            <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
              TOTAL SUPPLY
            </Text>
            <Text variant="heading-sm" style={{ fontWeight: 'bold' }}>
              {editionType === 'fixed' ? maxSupply || '---' : 'OPEN'}
            </Text>
          </Box>
        </Flex>
      </Stack>
    </StickyPreviewContainer>
  )
}
