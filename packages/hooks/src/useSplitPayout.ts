'use client'

import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SPLIT_MAIN_ADDRESS } from '@buildeross/constants/splits'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import useSWR from 'swr'
import type { Address } from 'viem'
import { isAddressEqual, zeroAddress, zeroHash } from 'viem'
import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { type SplitAllocation, toSplitAllocations } from './splitPayout.helper'

/**
 * The slice of 0xSplits v1 `SplitMain` this needs. Recipients are not readable
 * on chain — the contract only stores a hash of them — so the create/update
 * calls are here too, to decode a split's terms back out of its own calldata.
 */
const splitMainAbi = [
  {
    type: 'function',
    name: 'getHash',
    stateMutability: 'view',
    inputs: [{ name: 'split', type: 'address' }],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'getETHBalance',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'distributeETH',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'split', type: 'address' },
      { name: 'accounts', type: 'address[]' },
      { name: 'percentAllocations', type: 'uint32[]' },
      { name: 'distributorFee', type: 'uint32' },
      { name: 'distributorAddress', type: 'address' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'withdrawETH', type: 'uint256' },
      { name: 'tokens', type: 'address[]' },
    ],
    outputs: [],
  },
] as const

interface SplitTermsResult {
  accounts: readonly AddressType[]
  percentAllocations: readonly number[]
  distributorFee: number
}

/**
 * Recipients are not readable on chain — `SplitMain` keeps only a hash of them —
 * and 0xSplits' own indexer needs an API key. The server route recovers them
 * from the split's creating transaction and proves them against that hash, so
 * everything here works on any RPC tier.
 */
const fetchSplitTerms = async (
  chainId: CHAIN_ID,
  address: AddressType
): Promise<SplitTermsResult | null> => {
  const params = new URLSearchParams({ chainId: String(chainId), address })
  const response = await fetch(`${BASE_URL}/api/splits?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to load split')

  const { data } = await response.json()
  return data?.terms ?? null
}

export interface UseSplitPayoutArgs {
  chainId: CHAIN_ID
  /** A drop's `fundsRecipient`, which may or may not be a split. */
  address: AddressType | undefined
}

export interface UseSplitPayoutResult {
  /** True once `SplitMain` confirms the address is a split it controls. */
  isSplit: boolean
  recipients: SplitAllocation[]
  distributorFee: number
  /** ETH sitting in the split, waiting to be pushed to recipient balances. */
  distributable: bigint | undefined
  /** ETH the connected wallet has already been allocated and can withdraw. */
  withdrawable: bigint | undefined
  isLoading: boolean
  distribute: () => void
  withdraw: () => void
  canDistribute: boolean
  canWithdraw: boolean
  isDistributing: boolean
  isWithdrawing: boolean
  txHash: Address | undefined
  error: Error | null
  /** The split on splits.org, for anything this UI can't do. */
  splitsAppUrl: string
}

/**
 * Everything the drop page needs to explain — and act on — a 0xSplits payout:
 * who the revenue is split between, what is sitting undistributed, and the two
 * transactions that actually move it (`distributeETH`, then `withdraw`).
 */
export const useSplitPayout = ({
  chainId,
  address,
}: UseSplitPayoutArgs): UseSplitPayoutResult => {
  const splitMain = SPLIT_MAIN_ADDRESS[chainId]
  const { address: account } = useAccount()

  const enabled = Boolean(
    splitMain && address && !isAddressEqual(address, zeroAddress as AddressType)
  )

  const { data: splitHash, isLoading: hashLoading } = useReadContract({
    abi: splitMainAbi,
    address: splitMain,
    functionName: 'getHash',
    args: address ? [address] : undefined,
    chainId,
    query: { enabled },
  })

  const isSplit = Boolean(splitHash && splitHash !== zeroHash)

  const { data: terms, isLoading: termsLoading } = useSWR(
    isSplit && address ? ([SWR_KEYS.SPLIT_TERMS, chainId, address] as const) : null,
    ([, _chainId, _address]) => fetchSplitTerms(_chainId, _address),
    { revalidateOnFocus: false }
  )

  const { data: splitBalance } = useReadContract({
    abi: splitMainAbi,
    address: splitMain,
    functionName: 'getETHBalance',
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: isSplit },
  })

  const { data: accountBalance } = useReadContract({
    abi: splitMainAbi,
    address: splitMain,
    functionName: 'getETHBalance',
    args: account ? [account] : undefined,
    chainId,
    query: { enabled: isSplit && Boolean(account) },
  })

  const recipients = terms ? toSplitAllocations(terms) : []

  // Simulating is what tells us a decoded recipient set is the live one: a set
  // that no longer matches the stored hash reverts here rather than at signing.
  const { data: distributeSim } = useSimulateContract({
    abi: splitMainAbi,
    address: splitMain,
    functionName: 'distributeETH',
    args:
      address && terms
        ? [
            address,
            terms.accounts as Address[],
            terms.percentAllocations as number[],
            terms.distributorFee,
            zeroAddress,
          ]
        : undefined,
    chainId,
    query: { enabled: isSplit && Boolean(terms) && (splitBalance ?? 0n) > 1n },
  })

  const { data: withdrawSim } = useSimulateContract({
    abi: splitMainAbi,
    address: splitMain,
    functionName: 'withdraw',
    args: account ? [account, 1n, []] : undefined,
    chainId,
    query: { enabled: isSplit && Boolean(account) && (accountBalance ?? 0n) > 1n },
  })

  const {
    writeContract,
    data: txHash,
    isPending: isSigning,
    error: writeError,
    variables,
  } = useWriteContract()

  const { isLoading: isMining } = useWaitForTransactionReceipt({ hash: txHash, chainId })

  const isBusy = isSigning || isMining
  const pendingFn = variables?.functionName

  return {
    isSplit,
    recipients,
    distributorFee: terms?.distributorFee ?? 0,
    distributable: splitBalance,
    withdrawable: accountBalance,
    isLoading: hashLoading || (isSplit && termsLoading),
    distribute: () => distributeSim && writeContract(distributeSim.request),
    withdraw: () => withdrawSim && writeContract(withdrawSim.request),
    canDistribute: Boolean(distributeSim) && !isBusy,
    canWithdraw: Boolean(withdrawSim) && !isBusy,
    isDistributing: isBusy && pendingFn === 'distributeETH',
    isWithdrawing: isBusy && pendingFn === 'withdraw',
    txHash,
    error: writeError,
    splitsAppUrl: `https://app.splits.org/accounts/${address ?? ''}/?chainId=${chainId}`,
  }
}
