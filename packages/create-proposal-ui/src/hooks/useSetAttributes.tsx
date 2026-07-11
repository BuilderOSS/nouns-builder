import { merklePropertyMetadataAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { MerkleTree } from 'merkletreejs'
import { useState } from 'react'
import { encodePacked, keccak256 } from 'viem'
import { usePublicClient, useWriteContract } from 'wagmi'

export const DEFAULT_ATTRIBUTES_BATCH_SIZE = 50

export const useSetAttributes = (
  targetMetadataAddress?: AddressType,
  targetChainId?: CHAIN_ID,
  attributesData?: number[][], // Array of attribute arrays indexed by token ID
  attributesMerkleRoot?: `0x${string}`, // Expected on-chain merkle root
  alreadySet?: number[] // Token IDs already set (for continuation after refresh)
) => {
  const [error, setError] = useState<string>()
  const [txHashes, setTxHashes] = useState<`0x${string}`[]>([])
  const [tokensSet, setTokensSet] = useState<number>(alreadySet?.length || 0)
  const [totalTokens, setTotalTokens] = useState<number>(0)
  const [batchSize, setBatchSize] = useState<number>(DEFAULT_ATTRIBUTES_BATCH_SIZE)

  const { writeContractAsync, isPending } = useWriteContract()
  const publicClient = usePublicClient({ chainId: targetChainId })

  const setAllAttributes = async () => {
    if (!targetMetadataAddress || !attributesData || !attributesMerkleRoot) {
      const errorMsg = 'Missing required parameters for setting attributes'
      setError(errorMsg)
      throw new Error(errorMsg)
    }

    setError(undefined)
    setTxHashes([])
    setTokensSet(0)

    try {
      // Build merkle tree from attributes data
      // Leaf format: keccak256(abi.encodePacked(tokenId, uint16[16] attributes))
      // Define the tuple type for 16 attributes
      type AttributesTuple = readonly [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
      ]

      const leaves: `0x${string}`[] = []
      const tokenAttributeMap = new Map<number, AttributesTuple>()

      attributesData.forEach((attributes, tokenId) => {
        // Convert to uint16[16] format (pad with zeros if needed)
        // Include all tokens, even those with missing/empty attributes (normalized to zero-filled array)
        const attributeArray: [
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
        ] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        if (attributes && attributes.length > 0) {
          for (let i = 0; i < Math.min(attributes.length, 16); i++) {
            attributeArray[i] = attributes[i]
          }
        }

        tokenAttributeMap.set(tokenId, attributeArray)

        // Create leaf: keccak256(abi.encodePacked(tokenId, uint16[16]))
        // Using array encoding to match Solidity's abi.encodePacked(uint256, uint16[16])
        const packed = encodePacked(
          ['uint256', 'uint16[16]'],
          [BigInt(tokenId), attributeArray]
        )
        const leafHash = keccak256(packed)
        leaves.push(leafHash)
      })

      if (leaves.length === 0) {
        throw new Error('No attribute data found to set')
      }

      // Sort leaves for deterministic tree
      const sortedLeaves = [...leaves].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))

      // Build merkle tree
      const tree = new MerkleTree(sortedLeaves, keccak256, { sortPairs: true })
      const rootBuffer = tree.getRoot()
      const rootHex = Buffer.from(rootBuffer).toString('hex')
      const calculatedRoot = rootHex.startsWith('0x')
        ? (rootHex as `0x${string}`)
        : (`0x${rootHex}` as `0x${string}`)

      // Verify calculated root matches expected root
      if (calculatedRoot !== attributesMerkleRoot) {
        const errorMsg = `Attributes merkle root mismatch! Calculated: ${calculatedRoot}, Expected: ${attributesMerkleRoot}`
        console.error('[useSetAttributes] MISMATCH:', errorMsg)
        setError(errorMsg)
        throw new Error(errorMsg)
      }

      // Generate SetAttributeParams for each token, excluding already-set tokens
      const allParams: {
        tokenId: bigint
        attributes: AttributesTuple
        proof: readonly `0x${string}`[]
      }[] = []

      const alreadySetSet = new Set(alreadySet || [])

      for (const [tokenId, attributes] of tokenAttributeMap.entries()) {
        // Skip tokens that were already set in a previous run
        if (alreadySetSet.has(tokenId)) continue
        // Recreate leaf hash using same encoding as above
        const packed = encodePacked(
          ['uint256', 'uint16[16]'],
          [BigInt(tokenId), attributes]
        )
        const leafHash = keccak256(packed)

        // Generate proof
        const proof = tree.getProof(leafHash).map((p: any) => {
          const hex = p.data.toString('hex')
          return hex.startsWith('0x')
            ? (hex as `0x${string}`)
            : (`0x${hex}` as `0x${string}`)
        })

        allParams.push({
          tokenId: BigInt(tokenId),
          attributes, // No cast needed - already correct type from Map
          proof,
        })
      }

      setTotalTokens(allParams.length)

      // Validate publicClient before processing
      if (!publicClient) {
        const errorMsg = 'Public client not available for transaction verification'
        setError(errorMsg)
        throw new Error(errorMsg)
      }

      // Batch process
      const hashes: `0x${string}`[] = []
      const setTokenIds: number[] = [...(alreadySet || [])] // Start with already-set tokens
      let tokensProcessed = 0

      for (let i = 0; i < allParams.length; i += batchSize) {
        const batch = allParams.slice(i, i + batchSize)

        const hash = await writeContractAsync({
          abi: merklePropertyMetadataAbi,
          address: targetMetadataAddress,
          functionName: 'setManyAttributes',
          args: [batch],
          chainId: targetChainId,
        })

        hashes.push(hash)
        setTxHashes([...hashes])

        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({ hash })

        if (receipt.status !== 'success') {
          throw new Error(`Transaction failed for batch ${Math.floor(i / batchSize) + 1}`)
        }

        // Track which tokens were successfully set
        batch.forEach((param) => setTokenIds.push(Number(param.tokenId)))
        tokensProcessed += batch.length
        setTokensSet((alreadySet?.length || 0) + tokensProcessed)
      }

      return { hashes, setTokenIds }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to set attributes on-chain'
      console.error('[useSetAttributes] Error:', err)
      setError(message)
      throw err
    }
  }

  const clearError = () => setError(undefined)

  return {
    setAllAttributes,
    isSettingAttributes: isPending,
    txHashes,
    tokensSet,
    totalTokens,
    batchSize,
    setBatchSize,
    error,
    clearError,
  }
}
