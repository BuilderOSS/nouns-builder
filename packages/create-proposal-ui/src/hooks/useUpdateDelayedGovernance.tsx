import { governorAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useState } from 'react'
import { usePublicClient, useWriteContract } from 'wagmi'

export const useUpdateDelayedGovernance = (
  targetGovernorAddress?: AddressType,
  targetChainId?: CHAIN_ID
) => {
  const [txHash, setTxHash] = useState<`0x${string}`>()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string>()

  const { writeContractAsync, isPending } = useWriteContract()
  const publicClient = usePublicClient({ chainId: targetChainId })

  const updateDelayedGovernance = async (delayedTimestamp: bigint) => {
    if (!targetGovernorAddress || !targetChainId) {
      const msg = 'Missing target governor address or chain ID'
      setError(msg)
      throw new Error(msg)
    }

    setError(undefined)
    setIsUpdating(true)
    setIsSuccess(false)

    try {
      console.log('[useUpdateDelayedGovernance] Updating delayed governance:', {
        governor: targetGovernorAddress,
        timestamp: delayedTimestamp.toString(),
        chainId: targetChainId,
      })

      const hash = await writeContractAsync({
        abi: governorAbi,
        address: targetGovernorAddress,
        functionName: 'updateDelayedGovernanceExpirationTimestamp',
        args: [delayedTimestamp],
        chainId: targetChainId,
      })

      console.log('[useUpdateDelayedGovernance] Transaction sent:', { txHash: hash })
      setTxHash(hash)
      setIsUpdating(false)

      // Wait for transaction receipt
      if (publicClient) {
        setIsConfirming(true)
        console.log('[useUpdateDelayedGovernance] Waiting for receipt...')
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        console.log('[useUpdateDelayedGovernance] Transaction confirmed:', {
          txHash: hash,
          status: receipt.status,
          blockNumber: receipt.blockNumber,
        })

        setIsConfirming(false)

        if (receipt.status !== 'success') {
          throw new Error(
            'Transaction failed for updateDelayedGovernanceExpirationTimestamp'
          )
        }

        setIsSuccess(true)
      }

      return hash
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update delayed governance'
      setError(message)
      setIsUpdating(false)
      setIsConfirming(false)
      throw new Error(message)
    }
  }

  return {
    updateDelayedGovernance,
    txHash,
    isUpdating: isUpdating || isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
