import type { CHAIN_ID } from '@buildeross/types'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Button, Flex, Icon, Spinner, Stack, Text } from '@buildeross/zord'
import { useEffect, useState } from 'react'
import { formatUnits } from 'viem'

interface SwapData {
  routing: string
  quote: {
    amount: string // Input amount in wei
    quote: string // Expected output amount in wei
    minimumAmountOut: string // Minimum output with slippage in wei
    quoteGasAdjusted: string
    gasUseEstimate: string
    gasUseEstimateQuote: string
    gasUseEstimateUSD: string
    gasPriceWei: string
    priceImpact: string
    routeString: string
  }
  quoteId: string
  gasFee: string
  transaction: {
    to: string
    from: string
    data: string
    value: string
    chainId: number
  }
}

interface QuoteDisplayProps {
  chainId: CHAIN_ID
  inputSymbol: string
  inputDecimals: number
  outputSymbol: string
  outputDecimals: number
  slippage: number
  swapData: SwapData | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
  swapDirection: 'buy' | 'sell'
  maxInputForBuy?: bigint // Maximum input including slippage for buy mode
}

export const QuoteDisplay: React.FC<QuoteDisplayProps> = ({
  inputSymbol,
  inputDecimals,
  outputSymbol,
  outputDecimals,
  slippage,
  swapData,
  isLoading,
  error,
  refetch,
  swapDirection,
  maxInputForBuy,
}) => {
  const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now())
  const [, setTick] = useState(0) // Force rerender for age updates

  // Update last fetch time when swap data loads successfully
  useEffect(() => {
    if (swapData && !isLoading) {
      setLastFetchTime(Date.now())
    }
  }, [swapData, isLoading])

  // Timer to refresh quote age display every 5 seconds
  useEffect(() => {
    if (!swapData || isLoading) {
      return
    }

    const timer = setInterval(() => {
      setTick((prev) => prev + 1)
    }, 5000)

    return () => clearInterval(timer)
  }, [swapData, isLoading])

  const handleRefresh = () => {
    refetch()
    setLastFetchTime(Date.now())
  }

  const getQuoteAge = (): string => {
    const ageSeconds = Math.floor((Date.now() - lastFetchTime) / 1000)
    if (ageSeconds < 60) return `${ageSeconds}s ago`
    const ageMinutes = Math.floor(ageSeconds / 60)
    if (ageMinutes < 60) return `${ageMinutes}m ago`
    const ageHours = Math.floor(ageMinutes / 60)
    return `${ageHours}h ago`
  }

  const isStale = Date.now() - lastFetchTime > 60000 // 1 minute

  if (!swapData && !isLoading && !error) {
    return null
  }

  if (error) {
    return (
      <Box
        p="x4"
        borderRadius="phat"
        borderWidth="normal"
        borderStyle="solid"
        borderColor="negative"
      >
        <Stack gap="x2">
          <Text fontWeight="display" fontSize="14">
            ❌ Unable to Get Quote
          </Text>
          <Text fontSize="14">
            {error.message || 'Failed to fetch swap quote. Please try again.'}
          </Text>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            style={{ alignSelf: 'flex-start', marginTop: '8px' }}
          >
            <Flex align="center" gap="x2">
              <Icon id="refresh" size="sm" />
              <Text>Retry</Text>
            </Flex>
          </Button>
        </Stack>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box p="x4" backgroundColor="background2" borderRadius="curved">
        <Flex gap="x3" align="center">
          <Spinner size="sm" />
          <Text fontSize="14" color="text3">
            Fetching swap quote from Uniswap...
          </Text>
        </Flex>
      </Box>
    )
  }

  if (!swapData) {
    return null
  }

  // API returns amounts in wei (smallest units), so we need to format them to human-readable
  const formattedAmountIn = formatCryptoVal(
    formatUnits(BigInt(swapData.quote.amount), inputDecimals)
  )
  const formattedAmountOut = formatCryptoVal(
    formatUnits(BigInt(swapData.quote.quote), outputDecimals)
  )
  const formattedMinAmountOut = formatCryptoVal(
    formatUnits(BigInt(swapData.quote.minimumAmountOut), outputDecimals)
  )

  // For 'buy' (exactOut): output is exact, input is estimated (show MAX with slippage)
  // For 'sell' (exactIn): input is exact, output is estimated
  const isBuyMode = swapDirection === 'buy'

  // For buy mode, format the maximum input (quote + slippage)
  const formattedMaxInputForBuy = maxInputForBuy
    ? formatCryptoVal(formatUnits(maxInputForBuy, inputDecimals))
    : formattedAmountIn

  return (
    <Box
      p="x4"
      backgroundColor="background1"
      borderRadius="curved"
      borderWidth="thin"
      borderStyle="solid"
      borderColor="border"
    >
      <Flex justify="space-between" align="center" mb="x3">
        <Text fontWeight="display">Swap Quote</Text>
        <Flex align="center" gap="x2">
          {isStale && (
            <Box
              px="x2"
              py="x1"
              backgroundColor="warning"
              borderRadius="curved"
              style={{ opacity: 0.8 }}
            >
              <Text color="onWarning" fontSize="12" fontWeight="display">
                STALE
              </Text>
            </Box>
          )}
          <Text fontSize="12" color="text3">
            {getQuoteAge()}
          </Text>
          <Button type="button" variant="ghost" size="xs" onClick={handleRefresh}>
            <Icon id="refresh" size="sm" />
          </Button>
        </Flex>
      </Flex>

      <Stack gap="x3">
        {isBuyMode ? (
          <>
            {/* Buy mode: output is exact, input varies with slippage */}
            <Flex justify="space-between">
              <Text fontSize="14" color="text3">
                You Receive
              </Text>
              <Text fontSize="14" fontWeight="display">
                {formattedAmountOut} {outputSymbol}
              </Text>
            </Flex>
            <Flex justify="space-between">
              <Text fontSize="14" color="text3">
                Estimated Cost
              </Text>
              <Text fontSize="14" fontWeight="display" color="text2">
                ~{formattedAmountIn} {inputSymbol}
              </Text>
            </Flex>
            <Flex justify="space-between">
              <Text fontSize="14" color="text3">
                Maximum Cost ({Number((slippage * 100).toFixed(2))}% slippage)
              </Text>
              <Text fontSize="14" fontWeight="display" color="text2">
                ≤{formattedMaxInputForBuy} {inputSymbol}
              </Text>
            </Flex>
          </>
        ) : (
          <>
            {/* Sell mode: input is exact, output varies with slippage */}
            <Flex justify="space-between">
              <Text fontSize="14" color="text3">
                You Sell
              </Text>
              <Text fontSize="14" fontWeight="display">
                {formattedAmountIn} {inputSymbol}
              </Text>
            </Flex>
            <Flex justify="space-between">
              <Text fontSize="14" color="text3">
                Estimated Proceeds
              </Text>
              <Text fontSize="14" fontWeight="display" color="text2">
                ~{formattedAmountOut} {outputSymbol}
              </Text>
            </Flex>
            <Flex justify="space-between">
              <Text fontSize="14" color="text3">
                Minimum Proceeds ({Number((slippage * 100).toFixed(2))}% slippage)
              </Text>
              <Text fontSize="14" fontWeight="display">
                ≥{formattedMinAmountOut} {outputSymbol}
              </Text>
            </Flex>
          </>
        )}

        {/* Routing Info */}
        <Box
          borderWidth="thin"
          borderStyle="solid"
          borderColor="border"
          style={{ borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}
        />
        <Stack gap="x2">
          <Flex justify="space-between" align="center">
            <Text fontSize="12" color="text3">
              Optimal Route
            </Text>
            <Box
              px="x2"
              py="x1"
              backgroundColor="background2"
              borderRadius="curved"
              borderWidth="thin"
              borderStyle="solid"
              borderColor="border"
            >
              <Text fontSize="12" fontWeight="display">
                {swapData.routing?.toUpperCase() || 'UNISWAP'}
              </Text>
            </Box>
          </Flex>
          {swapData.quote.routeString && (
            <Text fontSize="12" color="text3" style={{ wordBreak: 'break-word' }}>
              {swapData.quote.routeString}
            </Text>
          )}
          {swapData.quote.priceImpact && (
            <Flex justify="space-between">
              <Text fontSize="12" color="text3">
                Price Impact
              </Text>
              <Text
                fontSize="12"
                fontWeight="display"
                color={parseFloat(swapData.quote.priceImpact) > 5 ? 'negative' : 'text1'}
              >
                {Number(swapData.quote.priceImpact).toFixed(2)}%
              </Text>
            </Flex>
          )}
        </Stack>

        <Box
          pt="x3"
          borderWidth="thin"
          borderStyle="solid"
          borderColor="border"
          style={{ borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}
        >
          <Flex align="center" gap="x2">
            <Icon id="question" size="sm" color="text3" />
            <Text fontSize="12" color="text3">
              Quote may change before proposal execution. Slippage tolerance protects
              against price movement.
            </Text>
          </Flex>
        </Box>
      </Stack>
    </Box>
  )
}
