import { CHAIN_ID } from '@buildeross/types'
import { type CoinFormValues, CreatorCoinPreview } from '@buildeross/ui'
import { Box, Stack, Text } from '@buildeross/zord'

import { StickyPreviewContainer } from '../../StickyPreviewContainer'
import { link } from './CreatorCoinPreviewDisplay.css'

export const CreatorCoinPreviewDisplay: React.FC<{
  previewData: CoinFormValues
  chainId: CHAIN_ID
}> = ({ previewData, chainId }) => {
  return (
    <StickyPreviewContainer align="stretch">
      <Stack gap="x5">
        <CreatorCoinPreview {...previewData} chainId={chainId} />
        <Box style={{ textAlign: 'right' }}>
          <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
            Powered by
          </Text>
          <a href="https://clanker.world" target="_blank" rel="noopener noreferrer">
            <Text variant="heading-sm" style={{ fontWeight: 'bold' }} className={link}>
              Clanker
            </Text>
          </a>
        </Box>
      </Stack>
    </StickyPreviewContainer>
  )
}
