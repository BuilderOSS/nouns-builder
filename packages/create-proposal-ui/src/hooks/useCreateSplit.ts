'use client'

import { SplitsClient } from '@0xsplits/splits-sdk'
import { useChainStore } from '@buildeross/stores'
import { useState } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'

import { prepareSplitConfigForSDK, type SplitConfig } from '../utils/splits'

export interface UseCreateSplitResult {
  /** Sends the createSplit wallet transaction; resolves to the split address. */
  createSplit: (config: SplitConfig) => Promise<string | null>
  isPending: boolean
  error: Error | null
  splitAddress: string | null
  txHash: string | null
  reset: () => void
}

/**
 * Creates a 0xSplits v1 split from the connected wallet via `@0xsplits/splits-sdk`.
 * nouns-builder is wagmi-native, so viem clients feed the SDK directly (no
 * thirdweb/viem bridge). Split creation is a wallet action, not a governance
 * transaction — the resulting address is used as a droposal's funds recipient.
 */
export const useCreateSplit = (): UseCreateSplitResult => {
  const chainId = useChainStore((x) => x.chain.id)
  const publicClient = usePublicClient({ chainId })
  const { data: walletClient } = useWalletClient({ chainId })

  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [splitAddress, setSplitAddress] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const createSplit = async (config: SplitConfig): Promise<string | null> => {
    if (!publicClient || !walletClient) {
      const err = new Error('Wallet not connected')
      setError(err)
      throw err
    }

    setIsPending(true)
    setError(null)
    setSplitAddress(null)
    setTxHash(null)

    try {
      const splitsClient = new SplitsClient({
        chainId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        publicClient: publicClient as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        walletClient: walletClient as any,
      })

      const sdkConfig = prepareSplitConfigForSDK(config)
      const response = await splitsClient.splitV1.createSplit({
        recipients: sdkConfig.recipients,
        distributorFeePercent: sdkConfig.distributorFeePercent,
        controller: sdkConfig.controller,
      })

      const address = response.splitAddress
      setSplitAddress(address)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setTxHash((response.event as any)?.transactionHash ?? null)
      return address
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to create split')
      setError(e)
      throw e
    } finally {
      setIsPending(false)
    }
  }

  const reset = () => {
    setIsPending(false)
    setError(null)
    setSplitAddress(null)
    setTxHash(null)
  }

  return { createSplit, isPending, error, splitAddress, txHash, reset }
}
