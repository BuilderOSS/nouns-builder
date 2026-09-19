import { MERKLE_RESERVE_MINTER } from '@buildeross/constants/addresses'
import { tokenAbi } from '@buildeross/sdk/contract'
import { executeAppTransaction } from '@buildeross/sdk/transaction'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useState } from 'react'
import { useConfig, useReadContract } from 'wagmi'
import { simulateContract } from 'wagmi/actions'

export const useAuthorizeMinter = (
  tokenAddress?: AddressType,
  chainId?: CHAIN_ID,
  onAuthorized?: () => void
) => {
  const [authorizeTxHash, setAuthorizeTxHash] = useState<`0x${string}`>()
  const [error, setError] = useState<string>()
  const [isAuthorizing, setIsAuthorizing] = useState(false)

  const config = useConfig()

  const minterAddress = chainId ? MERKLE_RESERVE_MINTER[chainId] : undefined

  // Check if minter is authorized by checking minter mapping
  const { data: isMinterAuthorized, refetch: refetchAuthorization } = useReadContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: 'minter',
    args: minterAddress ? [minterAddress] : undefined,
    query: {
      enabled: !!tokenAddress && !!minterAddress && !!chainId,
    },
  })

  const authorizeMinter = async () => {
    if (!tokenAddress || !chainId || !minterAddress) {
      setError('Missing required parameters for authorizing minter')
      throw new Error('Missing required parameters')
    }

    setError(undefined)
    setIsAuthorizing(true)

    try {
      // Call updateMinters with [(minterAddress, true)]
      const { request } = await simulateContract(config, {
        abi: tokenAbi,
        address: tokenAddress,
        functionName: 'updateMinters',
        args: [[{ minter: minterAddress, allowed: true }]],
        chainId,
      })

      const result = await executeAppTransaction({
        config,
        request,
        chainId,
      })

      setAuthorizeTxHash(result.hash)
      if (result.kind === 'safe-proposed') return result.hash

      // Wait for transaction receipt
      if (result.receipt.status !== 'success') {
        throw new Error('Transaction failed to authorize minter')
      }

      // Refetch authorization status
      await refetchAuthorization()

      onAuthorized?.()

      return result.hash
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to authorize minter'
      setError(message)
      throw new Error(message)
    } finally {
      setIsAuthorizing(false)
    }
  }

  return {
    authorizeMinter,
    isAuthorizing,
    isMinterAuthorized,
    authorizeTxHash,
    error,
    minterAddress,
  }
}
