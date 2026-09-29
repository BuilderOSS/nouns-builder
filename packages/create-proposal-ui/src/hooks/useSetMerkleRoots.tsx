import { MERKLE_RESERVE_MINTER } from '@buildeross/constants/addresses'
import {
  merklePropertyMetadataAbi,
  merkleReserveMinterAbi,
} from '@buildeross/sdk/contract'
import { executeAppTransaction } from '@buildeross/sdk/transaction'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useState } from 'react'
import { useConfig } from 'wagmi'
import { simulateContract } from 'wagmi/actions'

const UINT_64_MAX = 18446744073709551615n

export const useSetMerkleRoots = (
  targetMetadataAddress?: AddressType,
  targetTokenAddress?: AddressType,
  targetChainId?: CHAIN_ID
) => {
  const [attributesTxHash, setAttributesTxHash] = useState<`0x${string}`>()
  const [membersTxHash, setMembersTxHash] = useState<`0x${string}`>()
  const [error, setError] = useState<string>()
  const [isSettingRoots, setIsSettingRoots] = useState(false)

  const config = useConfig()

  const setAttributesRoot = async (merkleRoot: `0x${string}`) => {
    if (!targetMetadataAddress) {
      setError('Missing target metadata address')
      throw new Error('Missing target metadata address')
    }

    setError(undefined)
    setIsSettingRoots(true)

    try {
      const { request } = await simulateContract(config, {
        abi: merklePropertyMetadataAbi,
        address: targetMetadataAddress,
        functionName: 'setAttributeMerkleRoot',
        args: [merkleRoot],
        chainId: targetChainId,
      })

      const result = await executeAppTransaction({
        config,
        chainId: targetChainId!,
        request,
      })
      if (result.kind === 'safe-proposed') return result
      const hash = result.hash

      setAttributesTxHash(hash)

      // Wait for transaction receipt
      if (result.kind === 'mined' && result.receipt.status !== 'success') {
        throw new Error('Transaction failed for setAttributeMerkleRoot')
      }

      return hash
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set attributes root'
      setError(message)
      throw new Error(message)
    } finally {
      setIsSettingRoots(false)
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
    setIsSettingRoots(true)

    try {
      const { request } = await simulateContract(config, {
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

      const result = await executeAppTransaction({
        config,
        chainId: targetChainId,
        request,
      })
      if (result.kind === 'safe-proposed') return result
      const hash = result.hash

      setMembersTxHash(hash)

      // Wait for transaction receipt
      if (result.kind === 'mined' && result.receipt.status !== 'success') {
        throw new Error('Transaction failed for setMintSettings')
      }

      return hash
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set mint settings'
      setError(message)
      throw new Error(message)
    } finally {
      setIsSettingRoots(false)
    }
  }

  return {
    setAttributesRoot,
    setMintSettings,
    isSettingRoots,
    attributesTxHash,
    membersTxHash,
    error,
  }
}
