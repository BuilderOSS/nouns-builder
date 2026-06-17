import { MERKLE_RESERVE_MINTER } from '@buildeross/constants/addresses'
import { merkleReserveMinterAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { useState } from 'react'
import { useWriteContract } from 'wagmi'

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

  const startMinting = async () => {
    if (!memberSnapshot || !targetTokenAddress || !targetChainId) {
      setError('Missing required parameters for minting')
      throw new Error('Missing required parameters')
    }

    const minterAddress = MERKLE_RESERVE_MINTER[targetChainId]
    if (!minterAddress) {
      setError(`No MerkleReserveMinter on chain ${targetChainId}`)
      throw new Error(`No MerkleReserveMinter on chain ${targetChainId}`)
    }

    setError(undefined)

    try {
      // Create merkle tree from member snapshot
      // Use 'ownerAlias' which is the L1->L2 aliased address for cross-chain compatibility
      const leaves = memberSnapshot.flatMap((member) =>
        member.tokens.map((tokenId) => [member.ownerAlias, BigInt(tokenId)])
      )

      const tree = StandardMerkleTree.of(leaves, ['address', 'uint256'])

      // Generate all claims
      const allClaims = memberSnapshot.flatMap((member) =>
        member.tokens.map((tokenId) => {
          const leaf = [member.ownerAlias, BigInt(tokenId)]
          const proof = tree.getProof(leaf)

          return {
            mintTo: member.ownerAlias,
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

      return { minted, hashes }
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
  }
}
