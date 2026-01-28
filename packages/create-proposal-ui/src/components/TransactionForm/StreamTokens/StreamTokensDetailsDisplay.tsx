import { Box, Stack, Text } from '@buildeross/zord'

import { link } from './StreamTokensDetailsDisplay.css'

export const StreamTokensDetailsDisplay: React.FC<{
  balanceError?: string
  totalStreamAmountWithSymbol?: string
  streamCount?: number
}> = ({ totalStreamAmountWithSymbol, balanceError, streamCount }) => {
  return (
    <Box
      position={{ '@initial': 'relative', '@768': 'absolute' }}
      style={{
        height: '100%',
        maxWidth: '100%',
        '@media': {
          '(min-width: 768px)': {
            maxWidth: '50%',
          },
        },
      }}
      top={'x0'}
      right={'x0'}
    >
      <Stack position={'sticky'} top={'x20'} right={'x0'} gap={'x5'} align="flex-end">
        {balanceError && (
          <Text variant="paragraph-sm" color="negative">
            {balanceError}
          </Text>
        )}
        {streamCount !== undefined && (
          <Box style={{ textAlign: 'right' }}>
            <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
              Number of Streams
            </Text>
            <Text variant="heading-sm" style={{ fontWeight: 'bold' }}>
              {streamCount}
            </Text>
          </Box>
        )}
        {totalStreamAmountWithSymbol && (
          <Box style={{ textAlign: 'right' }}>
            <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
              Total Amount
            </Text>
            <Text variant="heading-sm" style={{ fontWeight: 'bold' }}>
              {totalStreamAmountWithSymbol}
            </Text>
          </Box>
        )}
        <Box style={{ textAlign: 'right' }}>
          <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
            Powered by
          </Text>
          <a href="https://sablier.com" target="_blank" rel="noopener noreferrer">
            <Text variant="heading-sm" style={{ fontWeight: 'bold' }} className={link}>
              Sablier
            </Text>
          </a>
        </Box>
      </Stack>
    </Box>
  )
}
