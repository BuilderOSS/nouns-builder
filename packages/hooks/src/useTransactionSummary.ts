import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import type {
  AddressType,
  CHAIN_ID,
  DaoContractAddresses,
  DecodedArgs,
  ProposalDescriptionMetadataV1,
  ProposalTransactionBundleContext,
} from '@buildeross/types'
import type { DecodedEscrowData } from '@buildeross/utils/escrow'
import type { StreamConfig } from '@buildeross/utils/sablier'
import useSWR from 'swr'

import type { SerializedNftMetadata } from './useNftMetadata'
import type { TokenMetadata } from './useTokenMetadata'

// Types for AI summary data
export type TransactionSummaryData = {
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  transaction: { args: DecodedArgs; functionName: string }
  target: AddressType
  /** Native value (wei) sent with the call */
  value?: string
  tokenMetadata?: TokenMetadata
  nftMetadata?: SerializedNftMetadata | null
  escrowData?: DecodedEscrowData | null
  streamData?: {
    lockupAddress: `0x${string}`
    tokenAddress: `0x${string}`
    streams: StreamConfig[]
    isDurationsMode: boolean
  }
  proposalMetadata?: ProposalDescriptionMetadataV1
  bundleContext?: ProposalTransactionBundleContext
}

/**
 * `hidden` errors mean the summary should not be shown at all (signed out, or no AI
 * provider configured); the others carry a short, user-facing message.
 */
export type TransactionSummaryErrorKind = 'hidden' | 'rateLimited' | 'timeout' | 'failed'

export class TransactionSummaryError extends Error {
  kind: TransactionSummaryErrorKind

  constructor(kind: TransactionSummaryErrorKind, message: string) {
    super(message)
    this.name = 'TransactionSummaryError'
    this.kind = kind
  }
}

const readErrorCode = async (response: Response) => {
  try {
    const result = await response.json()
    return typeof result?.error === 'string' ? result.error : undefined
  } catch {
    return undefined
  }
}

export const getTransactionSummaryError = (status: number, code?: string) => {
  if (status === 401 || status === 403 || code === 'ai_unavailable') {
    return new TransactionSummaryError('hidden', code || 'Unauthorized')
  }
  if (status === 429) {
    return new TransactionSummaryError(
      'rateLimited',
      'Too many requests. Try again in a minute.'
    )
  }
  return new TransactionSummaryError('failed', "Couldn't generate a summary.")
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
      throw getTransactionSummaryError(response.status, await readErrorCode(response))
    }

    const result = await response.json()
    if (result && typeof result.text === 'string' && result.text.trim()) {
      return result.text
    }

    throw new TransactionSummaryError('failed', "Couldn't generate a summary.")
  } catch (error) {
    if (error instanceof TransactionSummaryError) throw error

    console.error('Error fetching AI summary:', error)
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new TransactionSummaryError('timeout', 'Summary took too long to generate.')
    }
    throw new TransactionSummaryError('failed', "Couldn't generate a summary.")
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
