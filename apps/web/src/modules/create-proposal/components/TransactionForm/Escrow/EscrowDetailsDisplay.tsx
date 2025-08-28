import { Box, Stack, Text } from '@buildeross/zord'
import { useLayoutStore } from 'src/stores'

import { link } from './EscrowDetailsDisplay.css'

export const EscrowDetailsDisplay: React.FC<{
  escrowAmountError?: string
  totalEscrowAmount?: string
}> = ({ totalEscrowAmount, escrowAmountError }) => {
  const isMobile = useLayoutStore((x) => x.isMobile)

  return (
    <Box
      position={isMobile ? 'relative' : 'absolute'}
      style={{
        height: '100%',
        maxWidth: isMobile ? '100%' : '50%',
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
        {totalEscrowAmount && (
          <Box>
            <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
              Total Escrow Amount
            </Text>
            <Text variant="heading-sm" style={{ fontWeight: 'bold' }}>
              {totalEscrowAmount}
            </Text>
          </Box>
        )}
        <Box style={{ textAlign: 'right' }}>
          <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
            Escrow Service by
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
