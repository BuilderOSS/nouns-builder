import { MERKLE_RESERVE_MINTER } from '@buildeross/constants/addresses'
import { merkleReserveMinterAbi, tokenAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { MerkleTree } from 'merkletreejs'
import { useEffect, useState } from 'react'
import { encodeAbiParameters, keccak256, parseAbiParameters } from 'viem'
import { useAccount, usePublicClient, useReadContract, useWriteContract } from 'wagmi'

import { DaoMemberSimplified } from './useGenerateMerkleRoots'

export const DEFAULT_BATCH_SIZE = 50

export const useMintReservedTokens = (
  memberSnapshot?: DaoMemberSimplified[],
  targetTokenAddress?: AddressType,
  targetChainId?: CHAIN_ID,
  alreadyMinted?: number[],
  onTokensMinted?: (tokenIds: number[]) => void,
  onTxHash?: (hash: `0x${string}`) => void,
  batchSize: number = DEFAULT_BATCH_SIZE
) => {
  const [totalTokens, setTotalTokens] = useState(0)
  const [tokensMinted, setTokensMinted] = useState<number[]>(alreadyMinted || [])
  const [txHashes, setTxHashes] = useState<`0x${string}`[]>([])
  const [error, setError] = useState<string>()

  const { writeContractAsync, isPending } = useWriteContract()
  const publicClient = usePublicClient({ chainId: targetChainId })
  const { address } = useAccount()

  const minterAddress = targetChainId ? MERKLE_RESERVE_MINTER[targetChainId] : undefined

  // Fetch the on-chain merkle root to compare
  // allowedMerkles returns: [mintStart, mintEnd, pricePerToken, merkleRoot]
  const { data: onChainSettings, refetch: refetchOnChainRoot } = useReadContract({
    address: minterAddress,
    abi: merkleReserveMinterAbi,
    functionName: 'allowedMerkles',
    args: targetTokenAddress ? [targetTokenAddress] : undefined,
    chainId: targetChainId,
    query: {
      enabled: !!minterAddress && !!targetTokenAddress && !!targetChainId,
      staleTime: 0, // Always fetch fresh data
      gcTime: 0, // Don't cache (previously cacheTime in older wagmi versions)
    },
  })

  const onChainMerkleRoot = onChainSettings?.[3]

  // Auto-refetch on mount to ensure we have latest on-chain value
  useEffect(() => {
    if (minterAddress && targetTokenAddress && targetChainId) {
      console.log('[useMintReservedTokens] Refetching on-chain merkle root on mount')
      refetchOnChainRoot()
    }
  }, [minterAddress, targetTokenAddress, targetChainId, refetchOnChainRoot])

  // Log on-chain root changes for debugging
  useEffect(() => {
    if (onChainMerkleRoot) {
      console.log('[useMintReservedTokens] On-chain merkle root:', onChainMerkleRoot)
    }
  }, [onChainMerkleRoot])

  const startMinting = async () => {
    if (!memberSnapshot || !targetTokenAddress || !targetChainId) {
      setError('Missing required parameters for minting')
      throw new Error('Missing required parameters')
    }

    if (!minterAddress) {
      setError(`No MerkleReserveMinter on chain ${targetChainId}`)
      throw new Error(`No MerkleReserveMinter on chain ${targetChainId}`)
    }

    if (!publicClient) {
      setError('No public client available')
      throw new Error('No public client available')
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

      console.log(
        '[useMintReservedTokens] Calculated merkle root from snapshot:',
        calculatedRoot
      )
      console.log('[useMintReservedTokens] On-chain merkle root:', onChainMerkleRoot)
      console.log(
        '[useMintReservedTokens] Member snapshot length:',
        memberSnapshot.length
      )
      console.log(
        '[useMintReservedTokens] Total tokens in snapshot:',
        memberSnapshot.reduce((sum, m) => sum + m.tokens.length, 0)
      )

      // Check if calculated root matches on-chain root
      if (onChainMerkleRoot && calculatedRoot !== onChainMerkleRoot) {
        const errorMsg = `Merkle root mismatch! Calculated: ${calculatedRoot}, On-chain: ${onChainMerkleRoot}. Please go back to Step 5 and regenerate merkle roots.`
        console.error('[useMintReservedTokens] MISMATCH:', errorMsg)
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

          return {
            mintTo: member.owner,
            tokenId: BigInt(tokenId),
            merkleProof: proof,
          }
        })
      )

      setTotalTokens(allClaims.length)

      // Check which tokens are already minted on-chain
      console.log('[useMintReservedTokens] Checking on-chain ownership for', allClaims.length, 'tokens...')
      const onChainMintedTokens = new Set<number>()

      // Check each token's owner on-chain
      for (const claim of allClaims) {
        try {
          const owner = await publicClient.readContract({
            address: targetTokenAddress,
            abi: tokenAbi,
            functionName: 'ownerOf',
            args: [claim.tokenId],
          })
          // If ownerOf succeeds, token is minted
          onChainMintedTokens.add(Number(claim.tokenId))
          console.log(`[useMintReservedTokens] Token ${claim.tokenId} already minted to ${owner}`)
        } catch (err) {
          // If ownerOf reverts, token is not minted yet (still in reserve)
          console.log(`[useMintReservedTokens] Token ${claim.tokenId} not minted yet`)
        }
      }

      console.log('[useMintReservedTokens] On-chain minted tokens:', Array.from(onChainMintedTokens))
      console.log('[useMintReservedTokens] UI tracked minted tokens:', tokensMinted)

      // Filter out already minted tokens (both from UI state and on-chain check)
      const alreadyMintedSet = new Set([...tokensMinted, ...onChainMintedTokens])
      const claimsToMint = allClaims.filter(
        (claim) => !alreadyMintedSet.has(Number(claim.tokenId))
      )

      console.log('[useMintReservedTokens] Claims to mint:', claimsToMint.length)

      if (claimsToMint.length === 0) {
        setError('All tokens are already minted. Nothing to mint.')
        return { minted: tokensMinted, hashes: txHashes }
      }

      // Batch mint
      const hashes: `0x${string}`[] = [...txHashes]
      const minted: number[] = [...tokensMinted]

      for (let i = 0; i < claimsToMint.length; i += batchSize) {
        const batch = claimsToMint.slice(i, i + batchSize)

        // Estimate gas for this batch with proper error handling
        let gasLimit: bigint | undefined
        if (publicClient && address) {
          try {
            const estimatedGas = await publicClient.estimateContractGas({
              abi: merkleReserveMinterAbi,
              address: minterAddress,
              functionName: 'mintFromReserve',
              args: [targetTokenAddress, batch],
              account: address,
            })
            // Add 50% buffer for safety (merkle proofs can be gas-intensive)
            gasLimit = (estimatedGas * 150n) / 100n
          } catch (estimationError) {
            console.error(
              `Gas estimation failed for batch ${i / batchSize + 1}:`,
              estimationError
            )
            throw new Error(
              `Gas estimation failed for batch ${i / batchSize + 1}. Try reducing batch size below ${batchSize}.`
            )
          }
        }

        const hash = await writeContractAsync({
          abi: merkleReserveMinterAbi,
          address: minterAddress,
          functionName: 'mintFromReserve',
          args: [targetTokenAddress, batch],
          chainId: targetChainId,
          gas: gasLimit,
        })

        hashes.push(hash)
        setTxHashes([...hashes])
        onTxHash?.(hash)

        // Wait for transaction receipt before continuing to next batch
        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash })

          if (receipt.status !== 'success') {
            throw new Error(`Transaction failed for batch ${i / batchSize + 1}`)
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

  const clearError = () => setError(undefined)

  return {
    startMinting,
    isMinting: isPending,
    totalTokens,
    tokensMinted,
    progress: totalTokens > 0 ? (tokensMinted.length / totalTokens) * 100 : 0,
    txHashes,
    error,
    onChainMerkleRoot: onChainMerkleRoot as `0x${string}` | undefined,
    refetchOnChainRoot: refetchOnChainRoot as () => Promise<any>,
    clearError,
  }
}
