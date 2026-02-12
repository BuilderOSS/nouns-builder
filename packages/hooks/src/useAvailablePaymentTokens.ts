import { NATIVE_TOKEN_ADDRESS, WETH_ADDRESS } from '@buildeross/constants/addresses'
import { buildSwapPath } from '@buildeross/swap'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useEffect, useState } from 'react'
import { Address } from 'viem'

export interface PaymentToken {
  address: Address
  symbol: string
  type: 'eth' | 'weth' | 'clanker-token' | 'zora-coin'
}

export interface UseAvailablePaymentTokensResult {
  tokens: PaymentToken[]
  isLoading: boolean
  error: Error | null
}

/**
 * Fetches available payment tokens for swapping with a specific coin
 * Returns ETH, WETH, and any intermediate tokens in the swap path
 */
export function useAvailablePaymentTokens(
  chainId: CHAIN_ID,
  coinAddress: AddressType
): UseAvailablePaymentTokensResult {
  const [tokens, setTokens] = useState<PaymentToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchTokens() {
      setIsLoading(true)
      setError(null)

      try {
        const wethAddress = WETH_ADDRESS[chainId]
        if (!wethAddress) {
          throw new Error(`WETH address not found for chain ${chainId}`)
        }

        // Always include ETH and WETH as base payment options
        const baseTokens: PaymentToken[] = [
          {
            address: NATIVE_TOKEN_ADDRESS,
            symbol: 'ETH',
            type: 'eth',
          },
          {
            address: wethAddress,
            symbol: 'WETH',
            type: 'weth',
          },
        ]

        // Build swap path from coin to WETH to discover intermediate tokens
        const path = await buildSwapPath(chainId, coinAddress as Address, wethAddress)

        if (!path || !path.hops || path.hops.length === 0) {
          // No intermediate tokens, just return ETH and WETH
          if (!cancelled) {
            setTokens(baseTokens)
            setIsLoading(false)
          }
          return
        }

        // Extract unique intermediate tokens from hops
        const intermediateAddresses = new Set<string>()
        path.hops.forEach((hop) => {
          const tokenInLower = hop.tokenIn.toLowerCase()
          const tokenOutLower = hop.tokenOut.toLowerCase()

          // Don't include WETH or the coin itself as intermediate tokens
          if (
            tokenInLower !== wethAddress.toLowerCase() &&
            tokenInLower !== coinAddress.toLowerCase()
          ) {
            intermediateAddresses.add(hop.tokenIn)
          }
          if (
            tokenOutLower !== wethAddress.toLowerCase() &&
            tokenOutLower !== coinAddress.toLowerCase()
          ) {
            intermediateAddresses.add(hop.tokenOut)
          }
        })

        // For now, we'll just return ETH and WETH
        // TODO: Fetch token info (symbol, type) for intermediate tokens from subgraph
        // This would require additional queries to get ClankerToken info for each address

        if (!cancelled) {
          setTokens(baseTokens)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error('Failed to fetch payment tokens')
          )
          setIsLoading(false)
        }
      }
    }

    fetchTokens()

    return () => {
      cancelled = true
    }
  }, [chainId, coinAddress])

  return { tokens, isLoading, error }
}
