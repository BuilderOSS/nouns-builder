import { Box, Stack, Text } from '@buildeross/zord'

export const SendTokensDetailsDisplay: React.FC<{
  balanceError?: string
  totalAmountWithSymbol?: string
  recipientCount?: number
}> = ({ totalAmountWithSymbol, balanceError, recipientCount }) => {
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
        {recipientCount !== undefined && (
          <Box style={{ textAlign: 'right' }}>
            <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
              Number of Recipients
            </Text>
            <Text variant="heading-sm" style={{ fontWeight: 'bold' }}>
              {recipientCount}
            </Text>
          </Box>
        )}
        {totalAmountWithSymbol && (
          <Box style={{ textAlign: 'right' }}>
            <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
              Total Amount
            </Text>
            <Text variant="heading-sm" style={{ fontWeight: 'bold' }}>
              {totalAmountWithSymbol}
            </Text>
          </Box>
        )}
      </Stack>
    </Box>
  )
}
