import { SplitsClient } from '@0xsplits/splits-sdk'
import { SPLIT_MAIN_ADDRESS } from '@buildeross/constants/splits'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import axios from 'axios'
import {
  decodeEventLog,
  decodeFunctionData,
  getAddress,
  type Hex,
  parseAbiItem,
  zeroHash,
} from 'viem'

import { InvalidRequestError } from './errors'
import { getRedisConnection } from './redisConnection'

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY ?? ''
const ETHERSCAN_API_KEY_PARAM = ETHERSCAN_API_KEY ? `&apikey=${ETHERSCAN_API_KEY}` : ''

const splitMainAbi = [
  parseAbiItem('function getHash(address split) view returns (bytes32)'),
  parseAbiItem(
    'function createSplit(address[] accounts, uint32[] percentAllocations, uint32 distributorFee, address controller) returns (address)'
  ),
  parseAbiItem(
    'function updateSplit(address split, address[] accounts, uint32[] percentAllocations, uint32 distributorFee)'
  ),
  parseAbiItem(
    'function updateAndDistributeETH(address split, address[] accounts, uint32[] percentAllocations, uint32 distributorFee, address distributorAddress)'
  ),
  // Polygon/Optimism/Base/Sepolia event with full recipient data
  parseAbiItem(
    'event CreateSplit(address indexed split, address[] accounts, uint32[] percentAllocations, uint32 distributorFee, address controller)'
  ),
  parseAbiItem(
    'event UpdateSplit(address indexed split, address[] accounts, uint32[] percentAllocations, uint32 distributorFee)'
  ),
] as const

export type SplitTerms = {
  accounts: AddressType[]
  percentAllocations: number[]
  distributorFee: number
}

export type SplitInfoResult = {
  isSplit: boolean
  /** The transaction that originally deployed this split contract. */
  creationTxHash: Hex | null
  /** Null when the recipient set could not be recovered — see `reason`. */
  terms: SplitTerms | null
  reason?: 'not-a-split' | 'creation-not-found' | 'undecodable'
  source: 'fetched' | 'cache'
}

const redisKey = (chainId: CHAIN_ID, address: string, hash: string) =>
  `splits:info:v2:${chainId}:${address}:${hash}`

/**
 * Fetch split terms from 0xSplits GraphQL API using the SDK. Works for all
 * splits on all chains, but requires an API key from splits.org.
 */
const fetchTermsFromGraphQL = async (
  chainId: CHAIN_ID,
  address: AddressType,
  needsCreationHash: boolean
): Promise<{ terms: SplitTerms; creationTxHash: Hex | null } | null> => {
  const SPLITS_API_KEY = process.env.SPLITS_API_KEY ?? ''
  if (!SPLITS_API_KEY) {
    return null // API key not configured
  }

  try {
    const provider = getProvider(chainId)
    const client = new SplitsClient({
      chainId,
      publicClient: provider as any,
      apiConfig: {
        apiKey: SPLITS_API_KEY,
      },
    })

    const split = await client.dataClient!.getSplitMetadata({
      chainId,
      splitAddress: address,
    })

    const terms = {
      accounts: split.recipients.map((r) => r.recipient.address as AddressType),
      percentAllocations: split.recipients.map((r) =>
        Math.round(r.percentAllocation * 10000)
      ),
      distributorFee: Math.round(split.distributorFeePercent * 10000),
    }
    const creationTxHash = needsCreationHash
      ? await fetchGraphQLCreationHash(
          chainId,
          address,
          split.createdBlock,
          SPLITS_API_KEY
        )
      : null
    return { terms, creationTxHash }
  } catch {
    return null
  }
}

const isTransactionHash = (value: unknown): value is Hex =>
  typeof value === 'string' && /^0x[0-9a-fA-F]{64}$/.test(value)

/** Query only the creation block's events, so older splits don't require paging
 * through their entire activity history. Updates must never become creation links.
 */
const fetchGraphQLCreationHash = async (
  chainId: CHAIN_ID,
  address: AddressType,
  createdBlock: number,
  apiKey: string
): Promise<Hex | null> => {
  if (!Number.isSafeInteger(createdBlock) || createdBlock < 0) return null
  const provider = getProvider(chainId)
  const blockNumber = BigInt(createdBlock)
  try {
    const block = await provider.getBlock({ blockNumber })
    const { data } = await axios.post(
      'https://api.splits.org/graphql',
      {
        query: `query SplitCreation($address: ID!, $chainId: String!, $timestamp: Int!) {
          split(id: $address, chainId: $chainId) {
            accountEvents(minTimestamp: $timestamp, maxTimestamp: $timestamp) {
              __typename
              ... on SetSplitEvent { type transaction { id } }
            }
          }
        }`,
        variables: {
          address: address.toLowerCase(),
          chainId: String(chainId),
          timestamp: Number(block.timestamp),
        },
      },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 10_000 }
    )
    const events = data?.data?.split?.accountEvents as
      | { __typename: string; type?: string; transaction?: { id?: string } }[]
      | undefined
    const hash = events?.find(
      (event) => event.__typename === 'SetSplitEvent' && event.type === 'create'
    )?.transaction?.id
    if (isTransactionHash(hash)) return hash
  } catch {
    // Metadata still gives us the exact block to check on chain below.
  }

  try {
    const logs = await provider.getLogs({
      address: SPLIT_MAIN_ADDRESS[chainId],
      events: [
        parseAbiItem('event CreateSplit(address indexed split)'),
        parseAbiItem(
          'event CreateSplit(address indexed split, address[] accounts, uint32[] percentAllocations, uint32 distributorFee, address controller)'
        ),
      ],
      fromBlock: blockNumber,
      toBlock: blockNumber,
    })
    const hash = logs.find(
      (log) => log.args.split?.toLowerCase() === address.toLowerCase()
    )?.transactionHash
    return isTransactionHash(hash) ? hash : null
  } catch {
    return null
  }
}

/**
 * Extract split terms from transaction logs by reading CreateSplit/UpdateSplit
 * events. Works for splits created via any method (direct, factory, multicall,
 * Safe) on chains that emit full event data (Polygon, Optimism, Base, Sepolia).
 * Ethereum mainnet only emits the split address in the event.
 */
const extractTermsFromLogs = async (
  chainId: CHAIN_ID,
  txHash: string,
  splitAddress: AddressType
): Promise<SplitTerms | null> => {
  try {
    const provider = getProvider(chainId)
    const receipt = await provider.getTransactionReceipt({ hash: txHash as Hex })

    if (!receipt) return null

    // Look for CreateSplit or UpdateSplit events in the transaction logs
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: splitMainAbi,
          data: log.data,
          topics: log.topics,
        })

        // Check if this is a CreateSplit or UpdateSplit event for our split address
        if (
          (decoded.eventName === 'CreateSplit' || decoded.eventName === 'UpdateSplit') &&
          decoded.args.split.toLowerCase() === splitAddress.toLowerCase()
        ) {
          // Only Polygon/Optimism/Base/Sepolia emit the full data in events
          // Ethereum mainnet events only have the split address
          if ('accounts' in decoded.args) {
            return {
              accounts: [...decoded.args.accounts] as AddressType[],
              percentAllocations: [...decoded.args.percentAllocations] as number[],
              distributorFee: Number(decoded.args.distributorFee),
            }
          }
        }
      } catch {
        // Not a split event, continue to next log
        continue
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * `SplitMain` stores only a hash of a split's recipients — the accounts and
 * allocations themselves live in the calldata that created the split. 0xSplits'
 * own apps read them from their indexer, which needs an API key; the creating
 * transaction is public, so fetch that instead and decode it.
 */
const fetchCreationInput = async (
  chainId: CHAIN_ID,
  address: AddressType
): Promise<Hex | null> => {
  try {
    const creationUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getcontractcreation&contractaddresses=${address}${ETHERSCAN_API_KEY_PARAM}`

    const { data } = await axios.get(creationUrl, { timeout: 10_000 })
    const txHash: string | undefined = data?.result?.[0]?.txHash
    if (!txHash) return null

    const provider = getProvider(chainId)
    const tx = await provider.getTransaction({ hash: txHash as Hex })
    return tx?.input ?? null
  } catch {
    return null
  }
}

const decodeTerms = (input: Hex): SplitTerms | null => {
  try {
    const { functionName, args } = decodeFunctionData({ abi: splitMainAbi, data: input })

    if (functionName === 'createSplit') {
      const [accounts, percentAllocations, distributorFee] = args
      return {
        accounts: [...accounts] as AddressType[],
        percentAllocations: [...percentAllocations] as number[],
        distributorFee: Number(distributorFee),
      }
    }

    if (functionName === 'updateSplit' || functionName === 'updateAndDistributeETH') {
      const [, accounts, percentAllocations, distributorFee] = args
      return {
        accounts: [...accounts] as AddressType[],
        percentAllocations: [...percentAllocations] as number[],
        distributorFee: Number(distributorFee),
      }
    }
  } catch {
    // Split created through a factory, a multicall, or a Safe: the calldata is
    // not a bare SplitMain call and there is nothing safe to infer from it.
    return null
  }

  return null
}

export const getSplitInfo = async (
  chainId: CHAIN_ID,
  addressInput?: string
): Promise<SplitInfoResult> => {
  let address: AddressType
  try {
    address = getAddress(addressInput ?? '') as AddressType
  } catch {
    throw new InvalidRequestError('Invalid address')
  }

  const splitMain = SPLIT_MAIN_ADDRESS[chainId]
  if (!splitMain)
    return {
      isSplit: false,
      terms: null,
      creationTxHash: null,
      reason: 'not-a-split',
      source: 'fetched',
    }

  const provider = getProvider(chainId)
  const storedHash = await provider.readContract({
    address: splitMain,
    abi: splitMainAbi,
    functionName: 'getHash',
    args: [address],
  })

  if (!storedHash || storedHash === zeroHash) {
    return {
      isSplit: false,
      terms: null,
      creationTxHash: null,
      reason: 'not-a-split',
      source: 'fetched',
    }
  }

  const redis = getRedisConnection()
  const key = redisKey(chainId, address, storedHash)
  const cached = await redis?.get(key)
  let terms: SplitTerms | null = null
  let creationTxHash: Hex | null = null
  if (cached) {
    const info = JSON.parse(cached) as Pick<SplitInfoResult, 'terms' | 'creationTxHash'>
    if (isTransactionHash(info.creationTxHash)) {
      return { isSplit: true, ...info, source: 'cache' }
    }
    // Keep usable terms, but retry missing creation metadata instead of letting
    // a temporary explorer failure suppress the link for the cache's full TTL.
    terms = info.terms
  }

  // Try fetching from Etherscan creation transaction
  try {
    const creationUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getcontractcreation&contractaddresses=${address}${ETHERSCAN_API_KEY_PARAM}`

    const { data } = await axios.get(creationUrl, { timeout: 10_000 })
    const txHash: string | undefined = data?.result?.[0]?.txHash

    if (isTransactionHash(txHash)) {
      creationTxHash = txHash
      // Try extracting from event logs first (works for all creation methods on
      // Polygon/Optimism/Base/Sepolia which emit full data in CreateSplit event)
      terms ??= await extractTermsFromLogs(chainId, txHash, address)

      // Fall back to calldata decoding if log extraction didn't work
      // (e.g., on Ethereum mainnet which doesn't emit recipient data in events)
      if (!terms) {
        const input = await fetchCreationInput(chainId, address)
        if (input) {
          terms = decodeTerms(input)
        }
      }
    }
  } catch {
    // Etherscan API failed, will try GraphQL fallback below
  }

  // Final fallback: use 0xSplits GraphQL API if available
  // (works for all splits on all chains, including factory/multicall/Safe deployments)
  if (!terms || !creationTxHash) {
    const info = await fetchTermsFromGraphQL(chainId, address, !creationTxHash)
    terms ??= info?.terms ?? null
    creationTxHash ??= info?.creationTxHash ?? null
  }

  if (!terms) {
    return {
      isSplit: true,
      terms: null,
      creationTxHash,
      reason: 'undecodable',
      source: 'fetched',
    }
  }

  // Cache the successfully extracted terms
  await redis?.setex(key, 60 * 60, JSON.stringify({ terms, creationTxHash }))

  return { isSplit: true, terms, creationTxHash, source: 'fetched' }
}
