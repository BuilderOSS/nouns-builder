import { Box, Button, Flex, Icon, Spinner, Stack, Text } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React from 'react'
import { formatUnits } from 'viem'

interface PresetAmount {
  usd: number
  eth: bigint
}

interface LikePopupContentProps {
  // Loading state while fetching prices
  isLoadingData: boolean
  // Available preset amounts with ETH conversion
  presetAmounts: PresetAmount[]
  // Currently executing transaction
  isExecuting: boolean
  // Selected amount (during execution)
  selectedAmount: bigint | null
  // Success state
  txSuccess: boolean
  // Transaction hash
  txHash: string | null
  // Chain ID for explorer link
  chainId: number
  // Error message
  error: string | null
  // User's balance
  userBalance: bigint | undefined
  // Handlers
  onSelectAmount: (amount: bigint) => void
  onClose: () => void
}

const LikePopupContent: React.FC<LikePopupContentProps> = ({
  isLoadingData,
  presetAmounts,
  isExecuting,
  selectedAmount,
  txSuccess,
  txHash,
  chainId,
  error,
  userBalance,
  onSelectAmount,
  onClose,
}) => {
  // Format ETH amount for display
  const formatEth = (amount: bigint) => {
    const formatted = formatUnits(amount, 18)
    const num = parseFloat(formatted)
    if (num < 0.0001) return `${formatted} ETH`
    return `${num.toFixed(4)} ETH`
  }

  // Check if user has sufficient balance
  const hasSufficientBalance = (amount: bigint) => {
    if (!userBalance) return false
    return userBalance >= amount
  }

  // Get explorer URL
  const getExplorerUrl = () => {
    if (!txHash) return ''
    const baseUrl =
      chainId === 8453 ? 'https://basescan.org' : 'https://sepolia.basescan.org'
    return `${baseUrl}/tx/${txHash}`
  }

  // Loading state
  if (isLoadingData) {
    return (
      <Box p="x6" style={{ minWidth: '280px' }}>
        <Flex justify="center" align="center" gap="x3">
          <Spinner size="sm" />
          <Text variant="paragraph-sm">Loading options...</Text>
        </Flex>
      </Box>
    )
  }

  // Success state
  if (txSuccess && txHash) {
    return (
      <Box p="x6" style={{ minWidth: '280px' }}>
        <Stack gap="x4" align="center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Icon id="checkInCircle" size="lg" />
          </motion.div>
          <Text variant="heading-xs" align="center">
            Liked!
          </Text>
          <Button
            as="a"
            href={getExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="sm"
            style={{ textDecoration: 'none' }}
          >
            <Flex align="center" gap="x2">
              <Text variant="paragraph-sm">View on Basescan</Text>
              <Icon id="arrowTopRight" size="sm" />
            </Flex>
          </Button>
        </Stack>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box p="x6" style={{ minWidth: '280px' }}>
        <Stack gap="x4">
          <Flex align="center" gap="x2">
            <Icon id="warning-16" size="sm" />
            <Text variant="paragraph-sm" color="negative">
              {error}
            </Text>
          </Flex>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </Stack>
      </Box>
    )
  }

  // Preset selection state
  return (
    <Box p="x6" style={{ minWidth: '280px' }}>
      <Stack gap="x4">
        <Text variant="heading-xs" align="center">
          Select Amount
        </Text>
        <Flex gap="x3" justify="space-between">
          {presetAmounts.map((preset) => {
            const isSelected = selectedAmount === preset.eth
            const isSufficientBalance = hasSufficientBalance(preset.eth)
            const isDisabled = isExecuting || !isSufficientBalance

            return (
              <Button
                key={preset.usd}
                variant={isSelected && isExecuting ? 'primary' : 'outline'}
                size="sm"
                onClick={() => !isDisabled && onSelectAmount(preset.eth)}
                disabled={isDisabled}
                style={{ flex: 1, minWidth: 0 }}
              >
                {isSelected && isExecuting ? (
                  <Flex align="center" gap="x2" justify="center">
                    <Spinner size="xs" />
                  </Flex>
                ) : (
                  <Stack gap="x1" align="center">
                    <Text variant="label-md" style={{ fontWeight: 'bold' }}>
                      ${preset.usd.toFixed(2)}
                    </Text>
                    <Text
                      variant="label-xs"
                      color="tertiary"
                      style={{ fontSize: '0.7rem' }}
                    >
                      ≈ {formatEth(preset.eth)}
                    </Text>
                  </Stack>
                )}
              </Button>
            )
          })}
        </Flex>
        {userBalance !== undefined && (
          <Text variant="label-xs" color="tertiary" align="center">
            Balance: {formatEth(userBalance)}
          </Text>
        )}
      </Stack>
    </Box>
  )
}

export default LikePopupContent
