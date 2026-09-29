import { useUniswapSwap } from '@buildeross/hooks'
import type { AddressType, CHAIN_ID, UniswapQuoteMetadata } from '@buildeross/types'
import { Tooltip } from '@buildeross/ui/Tooltip'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Button, Flex, Icon, Spinner, Stack, Text } from '@buildeross/zord'
import { useEffect, useState } from 'react'
import { formatUnits } from 'viem'

interface UniswapSwapDisplayProps {
  chainId: CHAIN_ID
  metadata: UniswapQuoteMetadata
  treasuryAddress?: AddressType
  hasEnded?: boolean
}

export const UniswapSwapDisplay: React.FC<UniswapSwapDisplayProps> = ({
  chainId,
  metadata,
  treasuryAddress,
  hasEnded = false,
}) => {
  const [showCurrentQuote, setShowCurrentQuote] = useState(false)
  const [, setTick] = useState(0)

  // Timer to update age display every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1)
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Fetch current quote if user wants to see it
  const {
    swap: currentSwapData,
    isLoading: isLoadingCurrentQuote,
    refetch,
  } = useUniswapSwap({
    chainId,
    type: metadata.swapDirection === 'buy' ? 'exactOut' : 'exactIn',
    amount:
      metadata.swapDirection === 'buy'
        ? formatUnits(BigInt(metadata.outputAmount), metadata.outputToken.decimals)
        : formatUnits(BigInt(metadata.inputAmount), metadata.inputToken.decimals),
    tokenIn: metadata.inputToken.address,
    inputTokenDecimals: metadata.inputToken.decimals,
    tokenOut: metadata.outputToken.address,
    outputTokenDecimals: metadata.outputToken.decimals,
    slippageTolerance: (metadata.slippage * 100).toString(),
    sender: treasuryAddress,
    enabled: showCurrentQuote,
  })

  // Helper: Format quote age
  const getQuoteAge = (): string => {
    const ageMs = Date.now() - metadata.timestamp
    const ageSeconds = Math.floor(ageMs / 1000)
    const ageMinutes = Math.floor(ageSeconds / 60)
    const ageHours = Math.floor(ageMinutes / 60)
    const ageDays = Math.floor(ageHours / 24)

    if (ageDays > 0) return `${ageDays} day${ageDays > 1 ? 's' : ''} ago`
    if (ageHours > 0) return `${ageHours} hour${ageHours > 1 ? 's' : ''} ago`
    if (ageMinutes > 0) return `${ageMinutes} min ago`
    return 'just now'
  }

  // Helper: Format amount with crypto formatting
  const formatAmount = (amountWei: string, decimals: number) => {
    return formatCryptoVal(formatUnits(BigInt(amountWei), decimals))
  }

  // Helper: Calculate maximum acceptable input for buy mode (with slippage)
  const calculateMaxInput = () => {
    return (
      BigInt(metadata.inputAmount) +
      (BigInt(metadata.inputAmount) * BigInt(Math.floor(metadata.slippage * 10000))) /
        10000n
    )
  }

  // Helper: Calculate price difference percentage
  const calculatePriceDifference = (): number | null => {
    if (!currentSwapData?.quote) return null

    const originalInput = BigInt(metadata.inputAmount)
    const currentInput = BigInt(currentSwapData.quote.amount)
    const originalOutput = BigInt(metadata.outputAmount)
    const currentOutput = BigInt(currentSwapData.quote.quote)

    if (metadata.swapDirection === 'buy') {
      // For buy: compare input amounts (lower is better)
      const diff = Number(currentInput - originalInput)
      return (diff / Number(originalInput)) * 100
    } else {
      // For sell: compare output amounts (higher is better)
      const diff = Number(currentOutput - originalOutput)
      return (diff / Number(originalOutput)) * 100
    }
  }

  // Helper: Get color for price change text
  const getPriceChangeColor = (pct: number): string => {
    const threshold = 5
    if (metadata.swapDirection === 'buy') {
      // For buy: negative is good (paying less)
      return pct < -threshold ? 'positive' : pct > threshold ? 'negative' : 'text2'
    } else {
      // For sell: positive is good (receiving more)
      return pct > threshold ? 'positive' : pct < -threshold ? 'negative' : 'text2'
    }
  }

  // Helper: Get icon for price change direction
  const getPriceChangeIcon = (pct: number): string => {
    if (metadata.swapDirection === 'buy') {
      return pct < 0 ? '↓' : pct > 0 ? '↑' : '='
    } else {
      return pct > 0 ? '↑' : pct < 0 ? '↓' : '='
    }
  }

  // Helper: Determine if price change is favorable
  const isPriceImprovement = (pct: number): boolean => {
    return metadata.swapDirection === 'buy' ? pct < 0 : pct > 0
  }

  // Helper: Get badge background color
  const getBadgeBackgroundColor = (pct: number): string => {
    return isPriceImprovement(pct) ? 'positive' : 'negative'
  }

  // Helper: Get badge text color
  const getBadgeTextColor = (pct: number): string => {
    return isPriceImprovement(pct) ? 'onPositive' : 'onNegative'
  }

  // Helper: Get badge text
  const getBadgeText = (pct: number): string => {
    return isPriceImprovement(pct) ? 'BETTER' : 'WORSE'
  }

  // Helper: Check if current price is within slippage tolerance
  const isWithinSlippage = (): boolean | null => {
    if (!currentSwapData?.quote) return null

    if (metadata.swapDirection === 'buy') {
      const currentInput = BigInt(currentSwapData.quote.amount)
      const maxAcceptable = calculateMaxInput()
      return currentInput <= maxAcceptable
    } else {
      const currentOutput = BigInt(currentSwapData.quote.quote)
      const minAcceptable = BigInt(metadata.minimumAmountOut)
      return currentOutput >= minAcceptable
    }
  }

  const priceDiff = calculatePriceDifference()
  const withinSlippage = isWithinSlippage()

  return (
    <Box
      p="x4"
      backgroundColor="background1"
      borderRadius="curved"
      borderWidth="thin"
      borderStyle="solid"
      borderColor="border"
      mb="x4"
    >
      <Stack gap="x4">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Flex align="center" gap="x2">
            <Text fontSize="14" fontWeight="display" mb="x2">
              Original Uniswap Quote
            </Text>
          </Flex>
          <Box
            px="x2"
            py="x1"
            backgroundColor="background2"
            borderRadius="curved"
            borderWidth="thin"
            borderStyle="solid"
            borderColor="border"
          >
            <Text fontSize="12" color="text3">
              Created {getQuoteAge()}
            </Text>
          </Box>
        </Flex>

        {/* Original Quote Section */}
        <Box>
          <Stack gap="x2">
            {metadata.swapDirection === 'buy' ? (
              <>
                <Flex justify="space-between">
                  <Text fontSize="14" color="text3">
                    Buying
                  </Text>
                  <Text fontSize="14" fontWeight="display">
                    {formatAmount(metadata.outputAmount, metadata.outputToken.decimals)}{' '}
                    {metadata.outputToken.symbol}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontSize="14" color="text3">
                    Estimated Cost
                  </Text>
                  <Text fontSize="14">
                    ~{formatAmount(metadata.inputAmount, metadata.inputToken.decimals)}{' '}
                    {metadata.inputToken.symbol}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontSize="14" color="text3">
                    Max Cost (with {(metadata.slippage * 100).toFixed(1)}% slippage)
                  </Text>
                  <Text fontSize="14" color="text2">
                    ≤
                    {formatAmount(
                      calculateMaxInput().toString(),
                      metadata.inputToken.decimals
                    )}{' '}
                    {metadata.inputToken.symbol}
                  </Text>
                </Flex>
              </>
            ) : (
              <>
                <Flex justify="space-between">
                  <Text fontSize="14" color="text3">
                    Selling
                  </Text>
                  <Text fontSize="14" fontWeight="display">
                    {formatAmount(metadata.inputAmount, metadata.inputToken.decimals)}{' '}
                    {metadata.inputToken.symbol}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontSize="14" color="text3">
                    Estimated Proceeds
                  </Text>
                  <Text fontSize="14">
                    ~{formatAmount(metadata.outputAmount, metadata.outputToken.decimals)}{' '}
                    {metadata.outputToken.symbol}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontSize="14" color="text3">
                    Min Proceeds (with {(metadata.slippage * 100).toFixed(1)}% slippage)
                  </Text>
                  <Text fontSize="14" color="text2">
                    ≥
                    {formatAmount(
                      metadata.minimumAmountOut,
                      metadata.outputToken.decimals
                    )}{' '}
                    {metadata.outputToken.symbol}
                  </Text>
                </Flex>
              </>
            )}

            <Box
              borderWidth="thin"
              borderStyle="solid"
              borderColor="border"
              style={{ borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}
              mt="x1"
            />

            <Flex justify="space-between">
              <Text fontSize="12" color="text3">
                Routing
              </Text>
              <Text fontSize="12" fontWeight="display">
                {metadata.routing}
              </Text>
            </Flex>
            <Flex justify="space-between">
              <Text fontSize="12" color="text3">
                Price Impact
              </Text>
              <Text
                fontSize="12"
                fontWeight="display"
                color={parseFloat(metadata.priceImpact) > 5 ? 'negative' : 'text1'}
              >
                {Number(metadata.priceImpact).toFixed(2)}%
              </Text>
            </Flex>
          </Stack>
        </Box>

        {/* Current Quote Section */}
        {!hasEnded && (
          <>
            {!showCurrentQuote ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCurrentQuote(true)}
              >
                <Flex align="center" gap="x2">
                  <Icon id="refresh" size="sm" />
                  <Text>Check Current Market Price</Text>
                </Flex>
              </Button>
            ) : (
              <Box
                p="x4"
                backgroundColor="background2"
                borderRadius="curved"
                borderWidth="thin"
                borderStyle="solid"
                borderColor="border"
              >
                <Flex justify="space-between" align="center" mb="x2">
                  <Flex align="center" gap="x2">
                    <Text fontSize="14" fontWeight="display">
                      Current Market Quote
                    </Text>
                    <Tooltip label="Price change note">
                      Market prices may change between now and execution. The slippage
                      tolerance protects against unfavorable price movements.
                    </Tooltip>
                  </Flex>
                  <Button
                    type="button"
                    variant="secondary"
                    size="xs"
                    onClick={() => refetch()}
                    isDisabled={isLoadingCurrentQuote}
                  >
                    <Icon id="refresh" size="sm" />
                  </Button>
                </Flex>

                {isLoadingCurrentQuote ? (
                  <Flex gap="x3" align="center" justify="center" py="x4">
                    <Spinner size="sm" />
                    <Text fontSize="14" color="text3">
                      Fetching current quote...
                    </Text>
                  </Flex>
                ) : currentSwapData?.quote ? (
                  <Stack gap="x2">
                    <Flex justify="space-between">
                      <Text fontSize="14" color="text3">
                        {metadata.swapDirection === 'buy'
                          ? 'Current Cost'
                          : 'Current Proceeds'}
                      </Text>
                      <Text fontSize="14" fontWeight="display">
                        ~
                        {formatAmount(
                          metadata.swapDirection === 'buy'
                            ? currentSwapData.quote.amount
                            : currentSwapData.quote.quote,
                          metadata.swapDirection === 'buy'
                            ? metadata.inputToken.decimals
                            : metadata.outputToken.decimals
                        )}{' '}
                        {metadata.swapDirection === 'buy'
                          ? metadata.inputToken.symbol
                          : metadata.outputToken.symbol}
                      </Text>
                    </Flex>

                    {priceDiff !== null && (
                      <Flex justify="space-between" align="center">
                        <Text fontSize="14" color="text3">
                          Price Change
                        </Text>
                        <Flex align="center" gap="x2">
                          <Text
                            fontSize="14"
                            fontWeight="display"
                            color={getPriceChangeColor(priceDiff)}
                          >
                            {getPriceChangeIcon(priceDiff)}{' '}
                            {Math.abs(priceDiff).toFixed(2)}%
                          </Text>
                          {Math.abs(priceDiff) > 5 && (
                            <Box
                              px="x2"
                              py="x1"
                              backgroundColor={getBadgeBackgroundColor(priceDiff)}
                              borderRadius="curved"
                            >
                              <Text
                                fontSize="10"
                                fontWeight="display"
                                color={getBadgeTextColor(priceDiff)}
                              >
                                {getBadgeText(priceDiff)}
                              </Text>
                            </Box>
                          )}
                        </Flex>
                      </Flex>
                    )}

                    {withinSlippage !== null && (
                      <Flex justify="space-between" align="center">
                        <Text fontSize="14" color="text3">
                          Execution Viability
                        </Text>
                        <Box
                          px="x2"
                          py="x1"
                          backgroundColor={withinSlippage ? 'positive' : 'warning'}
                          borderRadius="curved"
                        >
                          <Text
                            fontSize="12"
                            fontWeight="display"
                            color={withinSlippage ? 'onPositive' : 'onWarning'}
                          >
                            {withinSlippage ? 'Within Slippage' : 'Outside Slippage'}
                          </Text>
                        </Box>
                      </Flex>
                    )}

                    {!withinSlippage && (
                      <Flex align="flex-start" gap="x2" mt="x2">
                        <Icon id="warning" size="sm" color="warning" />
                        <Text fontSize="12" color="text3">
                          Current market price has moved significantly. This transaction
                          would revert if executed now.
                        </Text>
                      </Flex>
                    )}
                  </Stack>
                ) : (
                  <Flex align="flex-start" gap="x2">
                    <Icon id="warning" size="sm" color="negative" />
                    <Text fontSize="14" color="text3">
                      Unable to fetch current quote. Market conditions may have changed.
                    </Text>
                  </Flex>
                )}
              </Box>
            )}
          </>
        )}
      </Stack>
    </Box>
  )
}
