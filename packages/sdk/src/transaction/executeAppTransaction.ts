import type { CHAIN_ID } from '@buildeross/types'
import { isSafeProposalHash } from '@buildeross/utils'
import {
  encodeFunctionData,
  type TransactionReceipt,
  type WriteContractParameters,
} from 'viem'
import type { Config } from 'wagmi'
import { waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { awaitSubgraphSync } from '../subgraph/requests/sync'

/**
 * Result of executing an app transaction.
 * Discriminated union based on whether the transaction was mined on-chain
 * or proposed to a Safe multi-sig.
 */
export type AppTransactionResult =
  | {
      /** Transaction was mined on-chain (EOA or 1-of-1 Safe) */
      kind: 'mined'
      /** Transaction hash */
      hash: `0x${string}`
      /** Transaction receipt with logs and events */
      receipt: TransactionReceipt
      /** Whether the subgraph has synced to this transaction */
      subgraphSynced: boolean
    }
  | {
      /** Transaction was proposed to Safe multi-sig (not yet executed) */
      kind: 'safe-proposed'
      /** Safe transaction hash (for tracking in Safe UI) */
      hash: `0x${string}`
    }

/**
 * Parameters for executing an app transaction
 */
type ExecuteAppTransactionParams = {
  /** Wagmi config with connected wallet */
  config: Config
  /**
   * Write contract request parameters from simulateContract.
   * simulateContract returns parameters without wallet-specific fields
   * that writeContract will fill from the wagmi config.
   */
  request: WriteContractParameters
  /** Chain ID where the transaction will be executed */
  chainId: CHAIN_ID
  /**
   * Whether to wait for subgraph to sync after transaction mines.
   * Only applies to 'mined' transactions (not Safe proposals).
   * @default true
   */
  waitForSubgraphSync?: boolean
}

export async function executeAppTransactions({
  config,
  requests,
  chainId,
}: {
  config: Config
  requests: WriteContractParameters[]
  chainId: CHAIN_ID
}): Promise<AppTransactionResult | AppTransactionResult[]> {
  if (requests.length === 0) return []
  const connection = config.state.current
    ? config.state.connections.get(config.state.current)
    : undefined
  const connector = connection?.connector
  if (connector?.id === 'safeOwner') {
    const provider = (await connector.getProvider()) as {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
    const transactions = requests.map((request) => ({
      to: request.address,
      data: encodeFunctionData({
        abi: request.abi,
        functionName: request.functionName,
        args: request.args,
      }),
      value: request.value,
    }))
    const hash = (await provider.request({
      method: 'eth_sendTransaction',
      params: [{ ...transactions[0], safeTransactions: transactions }],
    })) as `0x${string}`
    if (isSafeProposalHash(hash)) return { kind: 'safe-proposed', hash }
    const receipt = await waitForTransactionReceipt(config, { hash, chainId })
    if (receipt.status !== 'success') throw new Error(`Transaction reverted: ${hash}`)
    let subgraphSynced = false
    try {
      subgraphSynced = await awaitSubgraphSync(chainId, receipt.blockNumber)
    } catch {
      subgraphSynced = false
    }
    return { kind: 'mined', hash, receipt, subgraphSynced }
  }
  const results: AppTransactionResult[] = []
  for (const request of requests) {
    results.push(await executeAppTransaction({ config, request, chainId }))
  }
  return results
}

/**
 * Execute a write transaction, handling both EOA and Safe wallets.
 *
 * This is the unified transaction execution function for the entire app.
 * It abstracts away the difference between EOA wallets and Safe multi-sig wallets:
 *
 * - **EOA wallets**: Transaction is sent on-chain immediately and we wait for it to mine
 * - **1-of-1 Safes**: Transaction is executed immediately (no multi-sig needed)
 * - **Multi-sig Safes**: Transaction is proposed to Safe Service, requiring additional signatures
 *
 * @example
 * ```typescript
 * // Typical usage with simulateContract
 * const { request } = await simulateContract(config, {
 *   address: contractAddress,
 *   abi: contractAbi,
 *   functionName: 'transfer',
 *   args: [recipient, amount],
 * })
 *
 * const result = await executeAppTransaction({ config, request, chainId })
 *
 * if (result.kind === 'safe-proposed') {
 *   // Transaction needs more signatures in Safe UI
 *   console.log('Safe proposal hash:', result.hash)
 *   return // Don't show success UI yet
 * }
 *
 * // Transaction mined successfully
 * const receipt = result.receipt
 * const logs = receipt.logs
 * // Extract event data, show success UI, etc.
 * ```
 *
 * @param params - Transaction execution parameters
 * @returns Promise resolving to transaction result (mined or safe-proposed)
 * @throws Error if transaction fails or is rejected by user
 */
export async function executeAppTransaction({
  config,
  request,
  chainId,
  waitForSubgraphSync = true,
}: ExecuteAppTransactionParams): Promise<AppTransactionResult> {
  const hash = await writeContract(config, request)

  if (isSafeProposalHash(hash)) {
    return { kind: 'safe-proposed', hash }
  }

  const receipt = await waitForTransactionReceipt(config, { hash, chainId })
  if (receipt.status !== 'success') {
    throw new Error(`Transaction reverted: ${hash}`)
  }

  let subgraphSynced = false
  if (waitForSubgraphSync) {
    try {
      subgraphSynced = await awaitSubgraphSync(chainId, receipt.blockNumber)
    } catch {
      // The chain result is authoritative. A delayed subgraph must not make users
      // retry an already-mined transaction.
      subgraphSynced = false
    }
  }

  return { kind: 'mined', hash, receipt, subgraphSynced }
}
