import { CHAIN_ID } from '@buildeross/types'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { MediaPreview } from '../MediaPreview'
import * as styles from './CreatorCoinPreview.css'

export interface CreatorCoinPreviewProps {
  name: string
  symbol: string
  description: string
  imageUrl?: string
  mediaUrl?: string
  mediaMimeType?: string
  chainId: CHAIN_ID
  daoName?: string
}

export const CreatorCoinPreview: React.FC<CreatorCoinPreviewProps> = ({
  name,
  description,
  imageUrl,
  mediaUrl,
  mediaMimeType,
}) => {
  const displayMediaUrl = mediaUrl || imageUrl
  const displayMediaType = mediaUrl ? mediaMimeType : 'image/png'

  return (
    <Box
      borderRadius="curved"
      borderStyle="solid"
      borderWidth="normal"
      borderColor="border"
      backgroundColor="background1"
      p="x4"
      className={styles.previewContainer}
    >
      <Stack gap="x4">
        {/* Preview Header */}
        <Box>
          <Text fontSize="16" fontWeight="label" color="text3">
            Preview
          </Text>
        </Box>

        {/* Content Card */}
        <Stack gap="x3">
          {/* Title */}
          {name && (
            <Text fontSize="18" fontWeight="display" color="text1">
              {name}
            </Text>
          )}

          {/* Media Display */}
          {displayMediaUrl && (
            <Box
              borderRadius="curved"
              overflow="hidden"
              backgroundColor="background2"
              style={{ width: '100%' }}
            >
              <MediaPreview
                mediaUrl={displayMediaUrl}
                mediaType={displayMediaType}
                coverUrl={imageUrl}
              />
            </Box>
          )}

          {/* Description */}
          {description && (
            <Box
              p="x4"
              borderRadius="curved"
              backgroundColor="border"
              style={{
                maxHeight: '300px',
                overflow: 'auto',
              }}
            >
              <Text fontSize="14" color="text2" style={{ whiteSpace: 'pre-wrap' }}>
                {description}
              </Text>
            </Box>
          )}

          {/* Empty State */}
          {!name && !displayMediaUrl && !description && (
            <Box
              p="x6"
              borderRadius="curved"
              backgroundColor="background2"
              style={{ textAlign: 'center' }}
            >
              <Text fontSize="14" color="text3">
                Fill in the form to see your creator coin preview
              </Text>
            </Box>
          )}
        </Stack>

        {/* Info */}
        <Box p="x3" borderRadius="curved" backgroundColor="background2">
          <Text fontSize="12" color="text3">
            This is how your creator coin will appear to collectors
          </Text>
        </Box>
      </Stack>
    </Box>
  )
}
