import { Box, Text } from '@buildeross/zord'

interface RiskWarningBannerProps {
  executionDelayText?: string
}

export const RiskWarningBanner: React.FC<RiskWarningBannerProps> = ({
  executionDelayText,
}) => {
  const delayDisplay = executionDelayText || 'several days'

  return (
    <Box
      p="x4"
      borderRadius="phat"
      borderWidth="normal"
      borderColor="warning"
      borderStyle="solid"
    >
      <Box>
        <Text fontWeight="display" fontSize="14" mb="x2">
          ⚠️ Important: Governance Timeline
        </Text>
        <Text fontSize="14" style={{ lineHeight: 1.5 }}>
          This proposal will execute approximately <strong>{delayDisplay}</strong> after
          submission. Token prices may change significantly during this time.
        </Text>
        <Text fontSize="14" style={{ lineHeight: 1.5 }} mt="x2">
          <strong>Recommendations:</strong>
        </Text>
        <Box as="ul" pl="x5" mt="x1" style={{ listStyleType: 'disc' }}>
          <Box as="li">
            <Text fontSize="14">
              Use high slippage tolerance (5-15%) to account for price movement
            </Text>
          </Box>
          <Box as="li">
            <Text fontSize="14">
              Set an appropriate deadline to prevent execution with stale prices
            </Text>
          </Box>
          <Box as="li">
            <Text fontSize="14">
              Monitor the proposal and be prepared to vote against if market conditions
              change drastically
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
