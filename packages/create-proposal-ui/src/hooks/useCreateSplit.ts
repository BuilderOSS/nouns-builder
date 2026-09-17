'use client'

import { SplitsClient } from '@0xsplits/splits-sdk'
import { useChainStore } from '@buildeross/stores'
import { useState } from 'react'
import { decodeEventLog } from 'viem'
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
  // No forced chainId: the caller (ContractButton) guarantees the wallet is on
  // the DAO chain before invoking, so the connected wallet client is correct.
  // Forcing chainId here returns undefined when the wallet is on another chain,
  // which misreads as "not connected".
  const { data: walletClient } = useWalletClient()

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

      // Check if the split already exists (CREATE2 deterministic deployment)
      const { splitAddress: predictedAddress, splitExists } =
        await splitsClient.splitV1.predictImmutableSplitAddress({
          recipients: sdkConfig.recipients,
          distributorFeePercent: sdkConfig.distributorFeePercent,
        })

      if (splitExists) {
        // Split already exists, return the existing address without deploying
        setSplitAddress(predictedAddress)
        return predictedAddress
      }

      // Split doesn't exist, create it
      // 1. Submit transaction and get hash immediately
      const { txHash } = await splitsClient.splitV1.submitCreateSplitTransaction({
        recipients: sdkConfig.recipients,
        distributorFeePercent: sdkConfig.distributorFeePercent,
        controller: sdkConfig.controller,
      })

      // 2. Persist hash BEFORE waiting for receipt (critical for unknown-outcome state)
      setTxHash(txHash)

      // 3. Wait for receipt and get events (can fail without losing hash)
      const eventTopics = splitsClient.splitV1.getEventTopics(chainId)
      const events = await splitsClient.getTransactionEvents({
        txHash,
        eventTopics: eventTopics.createSplit,
      })

      const event = events.length > 0 ? events[0] : undefined
      if (!event) {
        throw new Error('Split creation transaction did not emit a CreateSplit event')
      }

      // 4. Decode event to get split address
      // Access the protected _getSplitMainAbi method via bracket notation
      const abi = (splitsClient.splitV1 as any)['_getSplitMainAbi'](chainId)
      const log = decodeEventLog({
        abi,
        data: event.data,
        topics: event.topics,
      }) as {
        eventName: string
        args: { split: string }
      }

      if (log.eventName !== 'CreateSplit') {
        throw new Error('Unexpected event type')
      }

      const address = log.args.split
      setSplitAddress(address)
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
