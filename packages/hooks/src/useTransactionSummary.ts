import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import type {
  AddressType,
  CHAIN_ID,
  DaoContractAddresses,
  DecodedArgs,
} from '@buildeross/types'
import type { DecodedEscrowData } from '@buildeross/utils/escrow'
import useSWR from 'swr'

import type { SerializedNftMetadata } from './useNftMetadata'
import type { TokenMetadata } from './useTokenMetadata'

// Types for AI summary data
export type TransactionSummaryData = {
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  transaction: { args: DecodedArgs; functionName: string }
  target: AddressType
  tokenMetadata?: TokenMetadata
  nftMetadata?: SerializedNftMetadata | null
  escrowData?: DecodedEscrowData | null
}

// AI Summary fetcher function
const aiSummaryFetcher = async (data: TransactionSummaryData): Promise<string> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch('/api/ai/generateTxSummary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const result = await response.json()
    if (result && typeof result === 'string' && result.trim()) {
      return result
    } else if (
      result &&
      result.text &&
      typeof result.text === 'string' &&
      result.text.trim()
    ) {
      return result.text
    } else {
      throw new Error('Empty or invalid response format')
    }
  } catch (error) {
    console.error('Error fetching AI summary:', error)
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('AI summary generation timed out')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export const useTransactionSummary = (transactionData: TransactionSummaryData | null) => {
  // Use SWR for AI summary
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    transactionData ? [SWR_KEYS.AI_TRANSACTION_SUMMARY, transactionData] : null,
    ([_key, data]) => aiSummaryFetcher(data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 10000,
    }
  )
  return {
    summary: data,
    isLoading,
    error,
    isValidating,
    mutate,
  }
}
