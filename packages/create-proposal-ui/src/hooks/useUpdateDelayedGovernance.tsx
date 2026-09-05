import { governorAbi } from '@buildeross/sdk/contract'
import { executeAppTransaction } from '@buildeross/sdk/transaction'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useState } from 'react'
import { useConfig } from 'wagmi'
import { simulateContract } from 'wagmi/actions'

export const useUpdateDelayedGovernance = (
  targetGovernorAddress?: AddressType,
  targetChainId?: CHAIN_ID
) => {
  const [txHash, setTxHash] = useState<`0x${string}`>()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string>()

  const config = useConfig()

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
      const { request } = await simulateContract(config, {
        abi: governorAbi,
        address: targetGovernorAddress,
        functionName: 'updateDelayedGovernanceExpirationTimestamp',
        args: [delayedTimestamp],
        chainId: targetChainId,
      })

      const result = await executeAppTransaction({
        config,
        chainId: targetChainId,
        request,
      })
      const hash = result.hash

      setTxHash(hash)
      setIsUpdating(false)

      // Wait for transaction receipt
      if (result.kind === 'mined') {
        setIsConfirming(true)
        setIsConfirming(false)

        if (result.receipt.status !== 'success') {
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
    isUpdating,
    isConfirming,
    isSuccess,
    error,
  }
}
