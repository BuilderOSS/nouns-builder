import { MediaPreview } from '@buildeross/ui/MediaPreview'
import { Box, Flex, Text } from '@buildeross/zord'
import { FormikProps } from 'formik'

import { previewTextStyle } from './Droposal.css'
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
  const {
    mediaUrl,
    coverUrl,
    mediaType,
    symbol,
    name,
    description,
    pricePerMint,
    maxSupply,
  } = formik.values
  return (
    <Box position={'absolute'} style={{ height: '100%' }} top={'x0'} right={'x0'}>
      <Box position={'sticky'} top={'x6'} right={'x0'}>
        <Box style={{ width: '400px', height: '400px' }}>
          <MediaPreview mediaUrl={mediaUrl} coverUrl={coverUrl} mediaType={mediaType} />
        </Box>
        <Text mt="x4" variant="heading-sm" className={previewTextStyle}>
          {name || 'Collection name'}
        </Text>
        <Flex mt="x2" align={'center'}>
          <Text
            style={{ backgroundColor: 'black', color: 'white' }}
            py="x1"
            px="x2"
            variant="eyebrow"
            borderRadius="normal"
          >
            ${symbol || 'SYMBOL'}
          </Text>
          <Text ml="x2" color="text4" fontSize={14} style={{ fontWeight: 'bold' }}>
            EDITION
          </Text>
        </Flex>
        <Text
          mt="x2"
          variant={'paragraph-lg'}
          className={previewTextStyle}
          style={{
            fontWeight: 500,
          }}
        >
          {description || 'description'}
        </Text>
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
      </Box>
    </Box>
  )
}
