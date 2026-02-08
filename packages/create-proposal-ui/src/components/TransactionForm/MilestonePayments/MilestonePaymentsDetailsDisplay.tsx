import { Box, Stack, Text } from '@buildeross/zord'

import { link } from './MilestonePaymentsDetailsDisplay.css'

export const MilestonePaymentsDetailsDisplay: React.FC<{
  escrowAmountError?: string
  totalEscrowAmountWithSymbol?: string
  milestoneCount?: number
}> = ({ totalEscrowAmountWithSymbol, escrowAmountError, milestoneCount }) => {
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
        {escrowAmountError && (
          <Text variant="paragraph-sm" color="negative">
            {escrowAmountError}
          </Text>
        )}
        {milestoneCount !== undefined && (
          <Box style={{ textAlign: 'right' }}>
            <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
              Number of Milestones
            </Text>
            <Text variant="heading-sm" style={{ fontWeight: 'bold' }}>
              {milestoneCount}
            </Text>
          </Box>
        )}
        {totalEscrowAmountWithSymbol && (
          <Box style={{ textAlign: 'right' }}>
            <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
              Total Amount
            </Text>
            <Text variant="heading-sm" style={{ fontWeight: 'bold' }}>
              {totalEscrowAmountWithSymbol}
            </Text>
          </Box>
        )}
        <Box style={{ textAlign: 'right' }}>
          <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
            Powered by
          </Text>
          <a
            href="https://www.smartinvoice.xyz/getting-started/what-is-smart-invoice"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Text variant="heading-sm" style={{ fontWeight: 'bold' }} className={link}>
              Smart Invoice
            </Text>
          </a>
        </Box>
        <Box style={{ textAlign: 'right' }}>
          <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
            Arbitration by
          </Text>
          <a
            href="https://www.smartinvoice.xyz/arbitration/kleros-arbitration"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Text variant="heading-sm" style={{ fontWeight: 'bold' }} className={link}>
              Kleros
            </Text>
          </a>
        </Box>
      </Stack>
    </Box>
  )
}
