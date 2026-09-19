import { BASE_URL } from '@buildeross/constants/baseUrl'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { useQuery } from '@tanstack/react-query'

interface UseUniswapSwapParams {
  chainId: CHAIN_ID
  tokenIn?: AddressType
  tokenOut?: AddressType
  amount?: string // Amount in token units (human-readable, e.g., "0.001")
  inputTokenDecimals?: number // Decimals of input token for wei conversion
  outputTokenDecimals?: number // Decimals of output token for wei conversion
  type?: 'exactIn' | 'exactOut'
  slippageTolerance?: string // e.g., '0.5' for 0.5%
  sender?: AddressType // User's wallet address
  recipient?: AddressType // Optional recipient (defaults to sender)
  deadline?: number // Unix timestamp
  enabled?: boolean
}

interface UniswapSwapResponse {
  success: boolean
  data: {
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
    permitData?: {
      domain: any
      types: any
      values: any
    }
    transaction: {
      to: AddressType
      from: AddressType
      data: string // Transaction calldata
      value: string // ETH value in wei
      gasLimit?: string
      gasPrice?: string
      maxFeePerGas?: string
      maxPriorityFeePerGas?: string
      chainId: number
    }
  }
}

interface UseUniswapSwapReturn {
  swap: UniswapSwapResponse['data'] | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

const fetchUniswapSwap = async (
  chainId: number,
  tokenIn: AddressType,
  tokenOut: AddressType,
  amount: string,
  inputTokenDecimals: number,
  outputTokenDecimals: number,
  type: 'exactIn' | 'exactOut',
  sender: AddressType,
  slippageTolerance?: string,
  recipient?: AddressType,
  deadline?: number,
  signal?: AbortSignal
): Promise<UniswapSwapResponse> => {
  // Normalize native ETH address: Uniswap API expects 0x0000...0000, not 0xEeee...eeee
  const normalizeAddress = (addr: AddressType): AddressType => {
    const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    return addr.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
      ? ('0x0000000000000000000000000000000000000000' as AddressType)
      : addr
  }

  const response = await fetch(`${BASE_URL}/api/uniswap/swap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chainId,
      tokenIn: normalizeAddress(tokenIn),
      tokenOut: normalizeAddress(tokenOut),
      amount,
      inputTokenDecimals,
      outputTokenDecimals,
      type,
      slippageTolerance,
      sender,
      recipient,
      deadline,
    }),
    signal,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Swap request failed: ${response.status}`)
  }

  return response.json()
}

/**
 * Hook to get executable swap transaction calldata from Uniswap Trading API
 * Returns transaction data ready to be submitted on-chain, including:
 * - Transaction calldata (data field)
 * - Target contract address (to field)
 * - ETH value if needed (value field)
 * - Quote information and routing details
 * - Gas estimates
 *
 * This supports V2, V3, and V4 pools automatically based on optimal routing
 */
export const useUniswapSwap = ({
  chainId,
  tokenIn,
  tokenOut,
  amount,
  inputTokenDecimals = 18,
  outputTokenDecimals = 18,
  type = 'exactIn',
  slippageTolerance,
  sender,
  recipient,
  deadline,
  enabled = true,
}: UseUniswapSwapParams): UseUniswapSwapReturn => {
  // Only fetch if all required parameters are present
  const canFetch =
    enabled && !!tokenIn && !!tokenOut && !!amount && amount !== '0' && !!sender

  const {
    data,
    error,
    isLoading,
    refetch,
  } = useQuery<UniswapSwapResponse, Error>({
    queryKey: [
      'uniswap-swap',
      chainId,
      tokenIn,
      tokenOut,
      amount,
      inputTokenDecimals,
      outputTokenDecimals,
      type,
      sender,
      slippageTolerance,
      recipient,
      deadline,
    ],
    queryFn: ({ signal }) =>
      fetchUniswapSwap(
        chainId,
        tokenIn!,
        tokenOut!,
        amount!,
        inputTokenDecimals,
        outputTokenDecimals,
        type,
        sender!,
        slippageTolerance,
        recipient,
        deadline,
        signal
      ),
    enabled: canFetch,
    staleTime: 0, // Always fetch fresh quotes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: false, // Don't retry failed swap requests automatically
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  return {
    swap: data?.data ?? null,
    isLoading,
    error: error ?? null,
    refetch,
  }
}
