import { Box, Stack, Text } from '@buildeross/zord'

import { StickyPreviewContainer } from '../../StickyPreviewContainer'
import { link } from './CreatorCoinPreviewDisplay.css'

export const CreatorCoinPreviewDisplay: React.FC = () => {
  return (
    <StickyPreviewContainer align="flex-end">
      <Stack gap="x5">
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
