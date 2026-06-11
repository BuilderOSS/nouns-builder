import { metadataAbi } from '@buildeross/sdk/contract'
import { encodedDaoMetadataRequest } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useState } from 'react'
import { decodeFunctionData } from 'viem'
import { useWriteContract } from 'wagmi'

export const useSetupMetadata = (
  sourceMetadataAddress?: AddressType,
  targetMetadataAddress?: AddressType,
  sourceChainId?: CHAIN_ID
) => {
  const [properties, setProperties] = useState<string[]>([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(false)
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0)
  const [txHashes, setTxHashes] = useState<`0x${string}`[]>([])
  const [error, setError] = useState<string>()

  const { writeContractAsync, isPending } = useWriteContract()

  const fetchProperties = async () => {
    if (!sourceMetadataAddress || !sourceChainId) {
      setError('Missing source metadata address or chain ID')
      return
    }

    setIsLoadingProperties(true)
    setError(undefined)

    try {
      const encodedProperties = await encodedDaoMetadataRequest(
        sourceChainId,
        sourceMetadataAddress
      )
      setProperties(encodedProperties)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties')
    } finally {
      setIsLoadingProperties(false)
    }
  }

  const addAllProperties = async () => {
    if (!targetMetadataAddress || properties.length === 0) {
      setError('Missing target metadata address or no properties to add')
      return
    }

    setError(undefined)
    const hashes: `0x${string}`[] = []

    try {
      for (let i = 0; i < properties.length; i++) {
        setCurrentPropertyIndex(i)

        // Decode the encoded data to get the args
        const decoded = decodeFunctionData({
          abi: metadataAbi,
          data: properties[i] as `0x${string}`,
        })

        const hash = await writeContractAsync({
          abi: metadataAbi,
          address: targetMetadataAddress,
          functionName: 'addProperties',
          args: decoded.args as any,
        })

        hashes.push(hash)
        setTxHashes([...hashes])
      }

      setCurrentPropertyIndex(properties.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add properties')
      throw err
    }
  }

  return {
    properties,
    isLoadingProperties,
    fetchProperties,
    addAllProperties,
    isAddingProperties: isPending,
    progress: {
      current: currentPropertyIndex,
      total: properties.length,
    },
    txHashes,
    error,
  }
}
