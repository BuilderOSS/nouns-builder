import { MERKLE_RESERVE_MINTER } from '@buildeross/constants/addresses'
import { tokenAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useState } from 'react'
import { usePublicClient, useReadContract, useWriteContract } from 'wagmi'

export const useAuthorizeMinter = (
  tokenAddress?: AddressType,
  chainId?: CHAIN_ID,
  onAuthorized?: () => void
) => {
  const [authorizeTxHash, setAuthorizeTxHash] = useState<`0x${string}`>()
  const [error, setError] = useState<string>()

  const { writeContractAsync, isPending } = useWriteContract()
  const publicClient = usePublicClient({ chainId })

  const minterAddress = chainId ? MERKLE_RESERVE_MINTER[chainId] : undefined

  // Check if minter is authorized by checking minter mapping
  const { data: isMinterAuthorized, refetch: refetchAuthorization } = useReadContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: 'minter',
    args: minterAddress ? [minterAddress] : undefined,
    chainId,
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

    try {
      // Call updateMinters with [(minterAddress, true)]
      const hash = await writeContractAsync({
        abi: tokenAbi,
        address: tokenAddress,
        functionName: 'updateMinters',
        args: [[{ minter: minterAddress, allowed: true }]],
        chainId,
      })

      setAuthorizeTxHash(hash)

      // Wait for transaction receipt
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash })

        if (receipt.status !== 'success') {
          throw new Error('Transaction failed to authorize minter')
        }
      }

      // Refetch authorization status
      await refetchAuthorization()

      onAuthorized?.()

      return hash
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to authorize minter'
      setError(message)
      throw new Error(message)
    }
  }

  return {
    authorizeMinter,
    isAuthorizing: isPending,
    isMinterAuthorized,
    authorizeTxHash,
    error,
    minterAddress,
  }
}
