import { AddressType } from '@buildeross/types'
import {
  formatRational,
  formatUsdFromRational,
  humanPriceQuotePerBase,
  pow10,
  price1Per0FromSqrtX96,
  targetSqrtPriceX96FromMarketCap,
} from '@buildeross/utils'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import { nearestUsableTick, TickMath } from '@uniswap/v3-sdk'
import JSBI from 'jsbi'
import React, { useMemo } from 'react'

import { Toggle } from '../Toggle'

export interface LaunchEconomicsPreviewProps {
  // Chain ID
  chainId: number

  // Token configuration
  totalSupply: bigint
  baseTokenAddress: AddressType
  baseTokenSymbol: string
  baseTokenDecimals: number
  quoteTokenAddress: AddressType
  quoteTokenSymbol: string
  quoteTokenDecimals: number

  // Pool configuration
  lowerTick: number
  upperTick: number
  tickSpacing: number

  // Target market cap (optional)
  targetMarketCapUsd?: number
  quoteTokenUsdPrice?: number

  // Display options
  showPredictedAddress?: boolean
}

interface EconomicsData {
  currentTick: number
  currentPriceStr: string
  inversePriceStr: string
  priceLowerStr: string
  priceUpperStr: string
  startingMarketCapStr: string
  startingMarketCapUsdStr: string | null
  targetPriceStr: string | null
  targetTick: number | null
  targetTickUsable: number | null
  isTargetInRange: boolean
  isCurrentInRange: boolean
  tickRangeValid: boolean
  validLowerTick: number
  validUpperTick: number
  warnings: string[]
}

export const LaunchEconomicsPreview: React.FC<LaunchEconomicsPreviewProps> = ({
  totalSupply,
  baseTokenAddress,
  baseTokenSymbol,
  baseTokenDecimals,
  quoteTokenSymbol,
  quoteTokenDecimals,
  lowerTick,
  upperTick,
  tickSpacing,
  targetMarketCapUsd,
  quoteTokenUsdPrice,
  showPredictedAddress = true,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  // Calculate sqrtPriceX96 from lowerTick
  const sqrtPriceX96 = useMemo(
    () => BigInt(TickMath.getSqrtRatioAtTick(lowerTick).toString()),
    [lowerTick]
  )

  const economics = useMemo((): EconomicsData | null => {
    try {
      const warnings: string[] = []

      // Determine token order using Uniswap SDK
      const baseIsToken0 = true // the pool config is always created with base as token0. its inverted in the clanker code when deploying based on token0/token1 order

      // Validate and snap ticks to spacing
      let validLowerTick = lowerTick
      let validUpperTick = upperTick
      let tickRangeValid = true

      if (lowerTick % tickSpacing !== 0) {
        validLowerTick = nearestUsableTick(lowerTick, tickSpacing)
        warnings.push(
          `Lower tick ${lowerTick} is not a multiple of tick spacing ${tickSpacing}. Snapped to ${validLowerTick}.`
        )
        tickRangeValid = false
      }

      if (upperTick % tickSpacing !== 0) {
        validUpperTick = nearestUsableTick(upperTick, tickSpacing)
        warnings.push(
          `Upper tick ${upperTick} is not a multiple of tick spacing ${tickSpacing}. Snapped to ${validUpperTick}.`
        )
        tickRangeValid = false
      }

      if (validLowerTick >= validUpperTick) {
        warnings.push('Invalid range: lower tick must be less than upper tick.')
        return null
      }

      // Calculate current tick from sqrtPriceX96
      const currentTick = TickMath.getTickAtSqrtRatio(
        JSBI.BigInt(sqrtPriceX96.toString())
      )

      // --- price rational (quote per base, human units) ---
      const qpb = (() => {
        if (baseIsToken0) {
          // quote/base = token1/token0
          return price1Per0FromSqrtX96(
            sqrtPriceX96,
            baseTokenDecimals,
            quoteTokenDecimals
          )
        }
        // base is token1, quote is token0 => quote/base = token0/token1 = inverse(token1/token0)
        const { numerator, denominator } = price1Per0FromSqrtX96(
          sqrtPriceX96,
          quoteTokenDecimals,
          baseTokenDecimals
        )
        return { numerator: denominator, denominator: numerator }
      })()

      const currentPriceStr = formatRational(qpb.numerator, qpb.denominator, 8)
      const inversePriceStr = formatRational(qpb.denominator, qpb.numerator, 8)

      // Calculate prices at bounds
      const sqrtPriceLower = TickMath.getSqrtRatioAtTick(validLowerTick)
      const sqrtPriceUpper = TickMath.getSqrtRatioAtTick(validUpperTick)

      const priceLowerStr = humanPriceQuotePerBase(
        BigInt(sqrtPriceLower.toString()),
        baseTokenDecimals,
        quoteTokenDecimals,
        baseIsToken0
      )

      const priceUpperStr = humanPriceQuotePerBase(
        BigInt(sqrtPriceUpper.toString()),
        baseTokenDecimals,
        quoteTokenDecimals,
        baseIsToken0
      )

      // --- starting market cap in quote token ---
      const marketCapNumerator = totalSupply * qpb.numerator
      const marketCapDenominator = pow10(baseTokenDecimals) * qpb.denominator
      const startingMarketCapStr = formatRational(
        marketCapNumerator,
        marketCapDenominator,
        6
      )

      // --- starting market cap in USD (keep as rational; don't integer-divide early) ---
      let startingMarketCapUsdStr: string | null = null
      if (quoteTokenUsdPrice && quoteTokenUsdPrice > 0) {
        const quoteUsdBigInt = BigInt(Math.floor(quoteTokenUsdPrice * 1e18)) // USD with 18 decimals

        const marketCapUsdNumerator = marketCapNumerator * quoteUsdBigInt
        const marketCapUsdDenominator = marketCapDenominator * 1_000_000_000_000_000_000n

        // Use adaptive USD formatting for proper precision at all scales
        startingMarketCapUsdStr = formatUsdFromRational(
          marketCapUsdNumerator,
          marketCapUsdDenominator
        )
      }

      // Calculate target price and tick if target market cap provided
      let targetPriceStr: string | null = null
      let targetTick: number | null = null
      let targetTickUsable: number | null = null
      let isTargetInRange = false

      if (targetMarketCapUsd && quoteTokenUsdPrice && quoteTokenUsdPrice > 0) {
        try {
          const targetMarketCapUsdBigInt = BigInt(Math.floor(targetMarketCapUsd * 1e6))
          const quoteUsdPriceBigInt = BigInt(Math.floor(quoteTokenUsdPrice * 1e6))

          const targetSqrtPriceX96 = targetSqrtPriceX96FromMarketCap({
            totalSupply,
            baseTokenDecimals,
            targetMarketCapUsd: targetMarketCapUsdBigInt,
            usdDecimals: 6,
            quoteTokenUsdPrice: quoteUsdPriceBigInt,
            quoteTokenDecimals,
            baseIsToken0,
          })

          targetPriceStr = humanPriceQuotePerBase(
            targetSqrtPriceX96,
            baseTokenDecimals,
            quoteTokenDecimals,
            baseIsToken0
          )

          targetTick = TickMath.getTickAtSqrtRatio(
            JSBI.BigInt(targetSqrtPriceX96.toString())
          )

          targetTickUsable = nearestUsableTick(targetTick, tickSpacing)

          isTargetInRange =
            targetTickUsable >= validLowerTick && targetTickUsable <= validUpperTick
        } catch (error) {
          // Target market cap calculation failed (likely underflow for very small targets)
          // Silently skip showing target analysis
          console.warn('Could not calculate target market cap analysis:', error)
        }
      }

      // Check if current tick is in range
      const isCurrentInRange =
        currentTick >= validLowerTick && currentTick <= validUpperTick

      return {
        currentTick,
        currentPriceStr,
        inversePriceStr,
        priceLowerStr,
        priceUpperStr,
        startingMarketCapStr,
        startingMarketCapUsdStr,
        targetPriceStr,
        targetTick,
        targetTickUsable,
        isTargetInRange,
        isCurrentInRange,
        tickRangeValid,
        validLowerTick,
        validUpperTick,
        warnings,
      }
    } catch (error) {
      console.error('Error calculating launch economics:', error)
      return null
    }
  }, [
    totalSupply,
    baseTokenDecimals,
    quoteTokenDecimals,
    sqrtPriceX96,
    lowerTick,
    upperTick,
    tickSpacing,
    targetMarketCapUsd,
    quoteTokenUsdPrice,
  ])

  if (!economics) {
    return (
      <Box
        p="x4"
        borderRadius="curved"
        style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)' }}
      >
        <Text variant="paragraph-sm" color="negative">
          Unable to calculate launch economics. Please check your pool configuration.
        </Text>
      </Box>
    )
  }

  return (
    <Box mt="x8" color="text1">
      <Flex justify="space-between" align="center" mb="x4">
        <Text as="h3" variant="heading-sm">
          Launch Economics Preview
        </Text>
        <Toggle on={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
      </Flex>

      {isExpanded && (
        <Stack gap="x4">
          {/* Warnings */}
          {economics.warnings.length > 0 && (
            <Box
              p="x4"
              borderRadius="curved"
              borderStyle="solid"
              borderWidth="normal"
              borderColor="warning"
              backgroundColor="background2"
            >
              <Text variant="label-md" mb="x2" color="warning">
                ⚠️ Configuration Warnings
              </Text>
              {economics.warnings.map((warning, idx) => (
                <Text key={idx} variant="paragraph-sm" color="text3">
                  • {warning}
                </Text>
              ))}
            </Box>
          )}

          {/* Predicted Token Address */}
          {showPredictedAddress && (
            <Box
              p="x4"
              borderRadius="curved"
              borderStyle="solid"
              borderWidth="normal"
              borderColor="border"
              backgroundColor="background2"
            >
              <Text variant="label-md" mb="x2">
                Predicted Token Address
              </Text>
              <Text
                variant="paragraph-sm"
                color="text3"
                style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}
              >
                {baseTokenAddress}
              </Text>
            </Box>
          )}

          {/* Quote Token Price */}
          {quoteTokenUsdPrice && quoteTokenUsdPrice > 0 && (
            <Box
              p="x4"
              borderRadius="curved"
              borderStyle="solid"
              borderWidth="normal"
              borderColor="border"
              backgroundColor="background2"
            >
              <Text variant="label-md" mb="x2">
                Quote Token Price
              </Text>
              <Text variant="paragraph-sm" color="text3">
                1 {quoteTokenSymbol} ≈ $
                {(() => {
                  // Convert number to rational for adaptive formatting
                  const scale = 1_000_000_000_000_000_000n // 18 decimals precision
                  const scaled = BigInt(Math.floor(quoteTokenUsdPrice * 1e18))
                  return formatUsdFromRational(scaled, scale)
                })()}
              </Text>
            </Box>
          )}

          {/* Initial Price */}
          <Box
            p="x4"
            borderRadius="curved"
            borderStyle="solid"
            borderWidth="normal"
            borderColor="border"
            backgroundColor="background2"
          >
            <Text variant="label-md" mb="x2">
              Initial Price
            </Text>
            <Text variant="paragraph-sm" color="text3">
              1 {baseTokenSymbol} = {economics.currentPriceStr} {quoteTokenSymbol}
            </Text>
            <Text variant="paragraph-sm" color="text3">
              1 {quoteTokenSymbol} = {economics.inversePriceStr} {baseTokenSymbol}
            </Text>
            <Text variant="paragraph-sm" color="text3" mt="x2">
              Current Tick: {economics.currentTick}
            </Text>
          </Box>

          {/* Price Range */}
          <Box
            p="x4"
            borderRadius="curved"
            borderStyle="solid"
            borderWidth="normal"
            borderColor="border"
            backgroundColor="background2"
          >
            <Text variant="label-md" mb="x2">
              Price Range
            </Text>
            <Text variant="paragraph-sm" color="text3">
              Lower: {economics.priceLowerStr} {quoteTokenSymbol} (Tick:{' '}
              {economics.validLowerTick})
            </Text>
            <Text variant="paragraph-sm" color="text3">
              Upper: {economics.priceUpperStr} {quoteTokenSymbol} (Tick:{' '}
              {economics.validUpperTick})
            </Text>
            <Text
              variant="paragraph-sm"
              color={economics.isCurrentInRange ? 'positive' : 'warning'}
              mt="x2"
            >
              {economics.isCurrentInRange
                ? '✓ Initial price is in range'
                : '⚠ Initial price is outside range'}
            </Text>
          </Box>

          {/* Market Cap */}
          <Box
            p="x4"
            borderRadius="curved"
            borderStyle="solid"
            borderWidth="normal"
            borderColor="border"
            backgroundColor="background2"
          >
            <Text variant="label-md" mb="x2">
              Starting Market Cap
            </Text>
            <Text variant="paragraph-sm" color="text3">
              {economics.startingMarketCapStr} {quoteTokenSymbol}
              {economics.startingMarketCapUsdStr && (
                <Text variant="paragraph-sm" color="text3" as="span">
                  {` ≈ $${economics.startingMarketCapUsdStr}`}
                </Text>
              )}
            </Text>
            {targetMarketCapUsd && (
              <Text variant="paragraph-sm" color="text3" mt="x2">
                Target FDV: $
                {targetMarketCapUsd.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Text>
            )}
          </Box>

          {/* Target Market Cap */}
          {economics.targetPriceStr && (
            <Box
              p="x4"
              borderRadius="curved"
              borderStyle="solid"
              borderWidth="normal"
              borderColor={economics.isTargetInRange ? 'positive' : 'warning'}
              backgroundColor="background2"
            >
              <Text variant="label-md" mb="x2">
                Target Market Cap Analysis
              </Text>
              <Text variant="paragraph-sm" color="text3">
                Target Price: {economics.targetPriceStr} {quoteTokenSymbol}
              </Text>
              <Text variant="paragraph-sm" color="text3">
                Target Tick: {economics.targetTickUsable} (spacing: {tickSpacing})
              </Text>
              <Text
                variant="paragraph-sm"
                color={economics.isTargetInRange ? 'positive' : 'warning'}
                mt="x2"
              >
                {economics.isTargetInRange
                  ? '✓ Target price is within liquidity range'
                  : '⚠ Target price is outside liquidity range - consider adjusting bounds'}
              </Text>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  )
}
