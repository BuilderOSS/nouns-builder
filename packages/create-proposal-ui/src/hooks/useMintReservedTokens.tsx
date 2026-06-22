import { MERKLE_RESERVE_MINTER } from '@buildeross/constants/addresses'
import { merkleReserveMinterAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { useState } from 'react'
import { useReadContract, useWriteContract } from 'wagmi'

import { DaoMemberSimplified } from './useGenerateMerkleRoots'

export const BATCH_SIZE = 50

export const useMintReservedTokens = (
  memberSnapshot?: DaoMemberSimplified[],
  targetTokenAddress?: AddressType,
  targetChainId?: CHAIN_ID,
  alreadyMinted?: number[],
  onTokensMinted?: (tokenIds: number[]) => void,
  onTxHash?: (hash: `0x${string}`) => void
) => {
  const [totalTokens, setTotalTokens] = useState(0)
  const [tokensMinted, setTokensMinted] = useState<number[]>(alreadyMinted || [])
  const [txHashes, setTxHashes] = useState<`0x${string}`[]>([])
  const [error, setError] = useState<string>()

  const { writeContractAsync, isPending } = useWriteContract()

  const minterAddress = targetChainId ? MERKLE_RESERVE_MINTER[targetChainId] : undefined

  // Fetch the on-chain merkle root to compare
  // allowedMerkles returns: [mintStart, mintEnd, pricePerToken, merkleRoot]
  const { data: onChainSettings } = useReadContract({
    address: minterAddress,
    abi: merkleReserveMinterAbi,
    functionName: 'allowedMerkles',
    args: targetTokenAddress ? [targetTokenAddress] : undefined,
    chainId: targetChainId,
    query: {
      enabled: !!minterAddress && !!targetTokenAddress && !!targetChainId,
    },
  })

  const onChainMerkleRoot = onChainSettings?.[3]

  const startMinting = async () => {
    if (!memberSnapshot || !targetTokenAddress || !targetChainId) {
      setError('Missing required parameters for minting')
      throw new Error('Missing required parameters')
    }

    if (!minterAddress) {
      setError(`No MerkleReserveMinter on chain ${targetChainId}`)
      throw new Error(`No MerkleReserveMinter on chain ${targetChainId}`)
    }

    setError(undefined)

    try {
      // Create merkle tree from member snapshot
      // Use 'owner' (original L1 address) since we're minting directly on L2
      // The ownerAlias is only needed for L1->L2 bridge messages, not for direct L2 minting
      const leaves = memberSnapshot.flatMap((member) =>
        member.tokens.map((tokenId) => [member.owner, BigInt(tokenId)])
      )

      const tree = StandardMerkleTree.of(leaves, ['address', 'uint256'])
      const calculatedRoot = tree.root as `0x${string}`

      console.log('[useMintReservedTokens] Merkle root verification:', {
        calculatedRoot,
        onChainMerkleRoot,
        rootsMatch: calculatedRoot === onChainMerkleRoot,
        snapshotSize: memberSnapshot.length,
        totalLeaves: leaves.length,
        sampleMember: memberSnapshot[0]
          ? {
              owner: memberSnapshot[0].owner,
              tokenCount: memberSnapshot[0].tokens.length,
            }
          : null,
      })

      // Check if calculated root matches on-chain root
      if (onChainMerkleRoot && calculatedRoot !== onChainMerkleRoot) {
        const errorMsg = `Merkle root mismatch! Calculated: ${calculatedRoot}, On-chain: ${onChainMerkleRoot}. Please go back to Step 5 and regenerate merkle roots.`
        setError(errorMsg)
        throw new Error(errorMsg)
      }

      // Generate all claims
      const allClaims = memberSnapshot.flatMap((member) =>
        member.tokens.map((tokenId) => {
          const leaf = [member.owner, BigInt(tokenId)]
          const proof = tree.getProof(leaf)

          return {
            mintTo: member.owner,
            tokenId: BigInt(tokenId),
            merkleProof: proof as `0x${string}`[],
          }
        })
      )

      setTotalTokens(allClaims.length)

      // Filter out already minted tokens to support resuming
      const alreadyMintedSet = new Set(tokensMinted)
      const claimsToMint = allClaims.filter(
        (claim) => !alreadyMintedSet.has(Number(claim.tokenId))
      )

      console.log('[useMintReservedTokens] Minting status:', {
        total: allClaims.length,
        alreadyMinted: tokensMinted.length,
        remaining: claimsToMint.length,
      })

      if (claimsToMint.length === 0) {
        console.log('[useMintReservedTokens] All tokens already minted')
        return { minted: tokensMinted, hashes: txHashes }
      }

      // Batch mint
      const hashes: `0x${string}`[] = [...txHashes]
      const minted: number[] = [...tokensMinted]

      for (let i = 0; i < claimsToMint.length; i += BATCH_SIZE) {
        const batch = claimsToMint.slice(i, i + BATCH_SIZE)

        console.log(
          `[useMintReservedTokens] Minting batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(claimsToMint.length / BATCH_SIZE)}`,
          { batchSize: batch.length }
        )

        const hash = await writeContractAsync({
          abi: merkleReserveMinterAbi,
          address: minterAddress,
          functionName: 'mintFromReserve',
          args: [targetTokenAddress, batch],
          chainId: targetChainId,
        })

        hashes.push(hash)
        setTxHashes([...hashes])
        onTxHash?.(hash)

        const batchTokenIds = batch.map((claim) => Number(claim.tokenId))
        minted.push(...batchTokenIds)
        setTokensMinted([...minted])
        onTokensMinted?.(batchTokenIds)
      }

      return { minted, hashes, calculatedRoot }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mint tokens'
      setError(message)
      throw new Error(message)
    }
  }

  return {
    startMinting,
    isMinting: isPending,
    totalTokens,
    tokensMinted,
    progress: totalTokens > 0 ? (tokensMinted.length / totalTokens) * 100 : 0,
    txHashes,
    error,
    onChainMerkleRoot,
  }
}
