import { MERKLE_RESERVE_MINTER } from '@buildeross/constants/addresses'
import { merkleReserveMinterAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { MerkleTree } from 'merkletreejs'
import { useState } from 'react'
import { encodeAbiParameters, keccak256, parseAbiParameters } from 'viem'
import { usePublicClient, useReadContract, useWriteContract } from 'wagmi'

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
  const publicClient = usePublicClient({ chainId: targetChainId })

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

      // Build mapping of leaf hash to {owner, tokenId} for proof generation
      const leafDataMap = new Map<string, { owner: AddressType; tokenId: number }>()

      // Create leaves using the same encoding as the contract: keccak256(abi.encode(address, uint256))
      const leaves = memberSnapshot
        .flatMap((member) =>
          member.tokens.map((tokenId) => {
            const encoded = encodeAbiParameters(parseAbiParameters('address, uint256'), [
              member.owner as `0x${string}`,
              BigInt(tokenId),
            ])
            const leafHash = keccak256(encoded)

            // Store mapping for later proof generation
            leafDataMap.set(leafHash, { owner: member.owner, tokenId })

            return leafHash
          })
        )
        .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)) // Sort for deterministic tree

      const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
      const rootBuffer = tree.getRoot()
      const rootHex = Buffer.from(rootBuffer).toString('hex')
      const calculatedRoot = rootHex.startsWith('0x')
        ? (rootHex as `0x${string}`)
        : (`0x${rootHex}` as `0x${string}`)

      // Check if calculated root matches on-chain root
      if (onChainMerkleRoot && calculatedRoot !== onChainMerkleRoot) {
        const errorMsg = `Merkle root mismatch! Calculated: ${calculatedRoot}, On-chain: ${onChainMerkleRoot}. Please go back to Step 5 and regenerate merkle roots.`
        setError(errorMsg)
        throw new Error(errorMsg)
      }

      // Generate all claims
      const allClaims = memberSnapshot.flatMap((member) =>
        member.tokens.map((tokenId) => {
          const encoded = encodeAbiParameters(parseAbiParameters('address, uint256'), [
            member.owner as `0x${string}`,
            BigInt(tokenId),
          ])
          const leafHash = keccak256(encoded)
          const proof = tree.getProof(leafHash).map((p: any) => {
            const hex = p.data.toString('hex')
            return hex.startsWith('0x')
              ? (hex as `0x${string}`)
              : (`0x${hex}` as `0x${string}`)
          })

          // Debug: log first claim details
          if (tokenId === member.tokens[0]) {
            const canVerify = tree.verify(
              proof.map((p) => Buffer.from(p.slice(2), 'hex')),
              leafHash,
              calculatedRoot
            )
          }

          return {
            mintTo: member.owner,
            tokenId: BigInt(tokenId),
            merkleProof: proof,
          }
        })
      )

      setTotalTokens(allClaims.length)

      // Filter out already minted tokens to support resuming
      const alreadyMintedSet = new Set(tokensMinted)
      const claimsToMint = allClaims.filter(
        (claim) => !alreadyMintedSet.has(Number(claim.tokenId))
      )

      if (claimsToMint.length === 0) {
        return { minted: tokensMinted, hashes: txHashes }
      }

      // Batch mint
      const hashes: `0x${string}`[] = [...txHashes]
      const minted: number[] = [...tokensMinted]

      for (let i = 0; i < claimsToMint.length; i += BATCH_SIZE) {
        const batch = claimsToMint.slice(i, i + BATCH_SIZE)

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

        // Wait for transaction receipt before continuing to next batch
        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash })

          if (receipt.status !== 'success') {
            throw new Error(`Transaction failed for batch ${i / BATCH_SIZE + 1}`)
          }
        }

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
