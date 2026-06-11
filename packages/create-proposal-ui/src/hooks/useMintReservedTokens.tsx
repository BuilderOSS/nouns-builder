import { MERKLE_RESERVE_MINTER } from '@buildeross/constants/addresses'
import { merkleReserveMinterAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { useState } from 'react'
import { useWriteContract } from 'wagmi'

import { DaoMemberSimplified } from './useGenerateMerkleRoots'

const BATCH_SIZE = 15

export const useMintReservedTokens = (
  memberSnapshot?: DaoMemberSimplified[],
  targetTokenAddress?: AddressType,
  targetChainId?: CHAIN_ID
) => {
  const [totalTokens, setTotalTokens] = useState(0)
  const [tokensMinted, setTokensMinted] = useState<number[]>([])
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

      // Batch mint
      const hashes: `0x${string}`[] = []
      const minted: number[] = []

      for (let i = 0; i < allClaims.length; i += BATCH_SIZE) {
        const batch = allClaims.slice(i, i + BATCH_SIZE)

        const hash = await writeContractAsync({
          abi: merkleReserveMinterAbi,
          address: minterAddress,
          functionName: 'mintFromReserve',
          args: [targetTokenAddress, batch],
        })

        hashes.push(hash)
        setTxHashes([...hashes])

        batch.forEach((claim) => {
          minted.push(Number(claim.tokenId))
        })
        setTokensMinted([...minted])
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
