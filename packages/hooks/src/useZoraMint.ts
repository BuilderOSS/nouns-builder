import { CHAIN_ID } from '@buildeross/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Address } from 'viem'
import { isAddress, isAddressEqual, parseEther, zeroAddress } from 'viem'
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

// Zora protocol reward fee per token (0.000777 ETH)
export const ZORA_PROTOCOL_REWARD = 0.000777

// Zora NFT Drop ABI for mintWithRewards function
const zoraNftMintAbi = [
  {
    type: 'function',
    name: 'mintWithRewards',
    stateMutability: 'payable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'quantity', type: 'uint256' },
      { name: 'comment', type: 'string' },
      { name: 'mintReferral', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export interface UseZoraMintArgs {
  chainId: CHAIN_ID
  dropAddress: Address | undefined
  priceEth: string
  mintReferral?: Address
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
}

export type MintStatus = 'idle' | 'confirming-wallet' | 'pending-tx' | 'success' | 'error'

export interface MintError {
  type:
    | 'rejected'
    | 'insufficient-funds'
    | 'sale-inactive'
    | 'invalid-config'
    | 'wallet-not-connected'
    | 'network-error'
    | 'unknown'
  message: string
}

export function useZoraMint({
  chainId,
  dropAddress,
  priceEth,
  mintReferral,
  onSuccess,
  onError,
}: UseZoraMintArgs) {
  const [mintStatus, setMintStatus] = useState<MintStatus>('idle')
  const [mintError, setMintError] = useState<MintError | null>(null)
  const { address } = useAccount()
  const successHandledRef = useRef<string | null>(null)
  const mintResetTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Validate drop address
  const isValidDropAddress =
    dropAddress &&
    isAddress(dropAddress, { strict: false }) &&
    !isAddressEqual(dropAddress, zeroAddress)

  const isReady = isValidDropAddress && Boolean(address)

  // Calculate total price including protocol reward
  const protocolRewardWei = parseEther(String(ZORA_PROTOCOL_REWARD))
  const parsedPriceWei = (() => {
    try {
      return parseEther(priceEth)
    } catch {
      return null
    }
  })()
  const simulationPrice =
    parsedPriceWei !== null ? parsedPriceWei + protocolRewardWei : protocolRewardWei

  // Simulate the mintWithRewards transaction
  const { isError: simulateError } = useSimulateContract({
    abi: zoraNftMintAbi,
    address: dropAddress as Address,
    functionName: 'mintWithRewards',
    args: [address!, 1n, '', (mintReferral || address!) as Address],
    value: simulationPrice,
    query: {
      enabled:
        isReady && mintStatus === 'idle' && Boolean(address) && parsedPriceWei !== null,
    },
    chainId: chainId,
  })

  const { writeContractAsync, data: pendingHash, reset: resetWrite } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: pendingHash,
    query: {
      enabled: Boolean(pendingHash),
    },
  })

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (mintResetTimerRef.current) {
        clearTimeout(mintResetTimerRef.current)
        mintResetTimerRef.current = null
      }
    }
  }, [])

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && pendingHash && successHandledRef.current !== pendingHash) {
      successHandledRef.current = pendingHash
      setMintStatus('success')
      setMintError(null)
      onSuccess?.(pendingHash)

      // Reset to idle after a delay
      const timer = setTimeout(() => {
        setMintStatus('idle')
        resetWrite()
      }, 3000)

      return () => {
        clearTimeout(timer)
      }
    }
    return () => {}
  }, [isSuccess, pendingHash, onSuccess, resetWrite])

  const mint = useCallback(
    async (quantity: number = 1, comment?: string): Promise<`0x${string}` | null> => {
      if (mintResetTimerRef.current) {
        clearTimeout(mintResetTimerRef.current)
        mintResetTimerRef.current = null
      }
      // Check wallet connection first
      if (!address) {
        const error: MintError = {
          type: 'wallet-not-connected',
          message: 'Please connect your wallet first.',
        }
        setMintError(error)
        return null
      }

      // Check drop configuration
      if (!dropAddress || !isReady) {
        const error: MintError = {
          type: 'invalid-config',
          message: 'Drop configuration is invalid or sale is not available.',
        }
        setMintError(error)
        return null
      }

      try {
        setMintError(null)

        // Phase 1: Waiting for wallet confirmation
        setMintStatus('confirming-wallet')

        // Calculate total price with protocol reward
        const salePriceWei = parseEther(priceEth) * BigInt(quantity)
        const protocolRewardWei =
          parseEther(String(ZORA_PROTOCOL_REWARD)) * BigInt(quantity)
        const totalPriceWei = salePriceWei + protocolRewardWei

        // Use mintWithRewards
        const txHash = await writeContractAsync({
          abi: zoraNftMintAbi,
          address: dropAddress,
          functionName: 'mintWithRewards',
          args: [
            address, // recipient
            BigInt(quantity), // quantity
            comment?.trim() || '', // comment
            (mintReferral || address) as Address, // mintReferral
          ],
          value: totalPriceWei,
          chainId: chainId,
        })

        // Phase 2: Transaction submitted, waiting for confirmation
        setMintStatus('pending-tx')

        return txHash
      } catch (err: unknown) {
        setMintStatus('error')
        const error = err instanceof Error ? err : new Error('Mint failed')
        const message = error.message

        let mintError: MintError

        if (message.includes('rejected') || message.includes('denied')) {
          mintError = {
            type: 'rejected',
            message: 'You rejected the transaction in your wallet.',
          }
        } else if (message.includes('insufficient funds')) {
          mintError = {
            type: 'insufficient-funds',
            message: "You don't have enough ETH to complete this purchase.",
          }
        } else if (
          message.includes('Sale_Inactive') ||
          message.includes('sale not active')
        ) {
          mintError = {
            type: 'sale-inactive',
            message: 'The sale is not currently active.',
          }
        } else if (message.includes('0x6a1c179e')) {
          mintError = {
            type: 'invalid-config',
            message: 'The mint configuration is invalid. Please try again.',
          }
        } else {
          mintError = {
            type: 'unknown',
            message: message.slice(0, 100),
          }
        }

        setMintError(mintError)
        onError?.(error)

        // Clear any existing timer before setting a new one
        if (mintResetTimerRef.current) {
          clearTimeout(mintResetTimerRef.current)
        }

        // Reset to idle after error
        mintResetTimerRef.current = setTimeout(() => {
          setMintStatus('idle')
          mintResetTimerRef.current = null
        }, 100)

        return null
      }
    },
    [
      chainId,
      dropAddress,
      address,
      isReady,
      priceEth,
      mintReferral,
      onError,
      writeContractAsync,
    ]
  )

  const isPending =
    mintStatus === 'confirming-wallet' || mintStatus === 'pending-tx' || isConfirming

  return {
    isReady,
    isPending,
    isSuccess: mintStatus === 'success',
    mintStatus,
    mintError,
    simulateError,
    transactionHash: pendingHash,
    mint,
  }
}
