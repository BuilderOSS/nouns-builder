import { MERKLE_RESERVE_MINTER } from '@buildeross/constants/addresses'
import {
  merklePropertyMetadataAbi,
  merkleReserveMinterAbi,
} from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useState } from 'react'
import { usePublicClient, useWriteContract } from 'wagmi'

const UINT_64_MAX = 18446744073709551615n

export const useSetMerkleRoots = (
  targetMetadataAddress?: AddressType,
  targetTokenAddress?: AddressType,
  targetChainId?: CHAIN_ID
) => {
  const [attributesTxHash, setAttributesTxHash] = useState<`0x${string}`>()
  const [membersTxHash, setMembersTxHash] = useState<`0x${string}`>()
  const [error, setError] = useState<string>()

  const { writeContractAsync, isPending } = useWriteContract()
  const publicClient = usePublicClient({ chainId: targetChainId })

  const setAttributesRoot = async (merkleRoot: `0x${string}`) => {
    if (!targetMetadataAddress) {
      setError('Missing target metadata address')
      throw new Error('Missing target metadata address')
    }

    setError(undefined)

    try {
      const hash = await writeContractAsync({
        abi: merklePropertyMetadataAbi,
        address: targetMetadataAddress,
        functionName: 'setAttributeMerkleRoot',
        args: [merkleRoot],
        chainId: targetChainId,
      })

      console.log('[useSetMerkleRoots] Attributes root transaction sent:', {
        txHash: hash,
      })
      setAttributesTxHash(hash)

      // Wait for transaction receipt
      if (publicClient) {
        console.log('[useSetMerkleRoots] Waiting for attributes root receipt...')
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        console.log('[useSetMerkleRoots] Attributes root confirmed:', {
          txHash: hash,
          status: receipt.status,
          blockNumber: receipt.blockNumber,
        })

        if (receipt.status !== 'success') {
          throw new Error('Transaction failed for setAttributeMerkleRoot')
        }
      }

      return hash
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set attributes root'
      setError(message)
      throw new Error(message)
    }
  }

  const setMintSettings = async (merkleRoot: `0x${string}`) => {
    if (!targetTokenAddress || !targetChainId) {
      setError('Missing target token address or chain ID')
      throw new Error('Missing target token address or chain ID')
    }

    const minterAddress = MERKLE_RESERVE_MINTER[targetChainId]
    if (!minterAddress) {
      setError(`No MerkleReserveMinter on chain ${targetChainId}`)
      throw new Error(`No MerkleReserveMinter on chain ${targetChainId}`)
    }

    setError(undefined)

    try {
      const hash = await writeContractAsync({
        abi: merkleReserveMinterAbi,
        address: minterAddress,
        functionName: 'setMintSettings',
        args: [
          targetTokenAddress,
          {
            mintStart: 0n,
            mintEnd: UINT_64_MAX,
            pricePerToken: 0n,
            merkleRoot,
          },
        ],
        chainId: targetChainId,
      })

      console.log('[useSetMerkleRoots] Mint settings transaction sent:', { txHash: hash })
      setMembersTxHash(hash)

      // Wait for transaction receipt
      if (publicClient) {
        console.log('[useSetMerkleRoots] Waiting for mint settings receipt...')
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        console.log('[useSetMerkleRoots] Mint settings confirmed:', {
          txHash: hash,
          status: receipt.status,
          blockNumber: receipt.blockNumber,
        })

        if (receipt.status !== 'success') {
          throw new Error('Transaction failed for setMintSettings')
        }
      }

      return hash
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set mint settings'
      setError(message)
      throw new Error(message)
    }
  }

  return {
    setAttributesRoot,
    setMintSettings,
    isSettingRoots: isPending,
    attributesTxHash,
    membersTxHash,
    error,
  }
}
