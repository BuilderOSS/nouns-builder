import { CHAIN_ID } from '@buildeross/types'
import { type CoinFormValues, ContentCoinPreview } from '@buildeross/ui'
import { Box, Stack, Text } from '@buildeross/zord'

import { StickyPreviewContainer } from '../../StickyPreviewContainer'
import { link } from './ContentCoinPreviewDisplay.css'

export const ContentCoinPreviewDisplay: React.FC<{
  previewData: CoinFormValues
  chainId: CHAIN_ID
}> = ({ previewData, chainId }) => {
  return (
    <StickyPreviewContainer align="stretch">
      <Stack gap="x5">
        <ContentCoinPreview {...previewData} chainId={chainId} />
        <Box style={{ textAlign: 'right' }}>
          <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
            Powered by
          </Text>
          <a href="https://zora.co" target="_blank" rel="noopener noreferrer">
            <Text variant="heading-sm" style={{ fontWeight: 'bold' }} className={link}>
              Zora
            </Text>
          </a>
        </Box>
      </Stack>
    </StickyPreviewContainer>
  )
}
