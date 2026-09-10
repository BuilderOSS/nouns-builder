import { SPLIT_MAIN_ADDRESS } from '@buildeross/constants/splits'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import axios from 'axios'
import { decodeFunctionData, getAddress, type Hex, parseAbiItem, zeroHash } from 'viem'

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
] as const

export type SplitTerms = {
  accounts: AddressType[]
  percentAllocations: number[]
  distributorFee: number
}

export type SplitInfoResult = {
  isSplit: boolean
  /** Null when the recipient set could not be recovered — see `reason`. */
  terms: SplitTerms | null
  reason?: 'not-a-split' | 'creation-not-found' | 'undecodable'
  source: 'fetched' | 'cache'
}

const redisKey = (chainId: CHAIN_ID, address: string) =>
  `splits:terms:${chainId}:${address}`

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
  const creationUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getcontractcreation&contractaddresses=${address}${ETHERSCAN_API_KEY_PARAM}`

  const { data } = await axios.get(creationUrl, { timeout: 10_000 })
  const txHash: string | undefined = data?.result?.[0]?.txHash
  if (!txHash) return null

  const provider = getProvider(chainId)
  const tx = await provider.getTransaction({ hash: txHash as Hex })
  return tx?.input ?? null
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
    return { isSplit: false, terms: null, reason: 'not-a-split', source: 'fetched' }

  const provider = getProvider(chainId)
  const storedHash = await provider.readContract({
    address: splitMain,
    abi: splitMainAbi,
    functionName: 'getHash',
    args: [address],
  })

  if (!storedHash || storedHash === zeroHash) {
    return { isSplit: false, terms: null, reason: 'not-a-split', source: 'fetched' }
  }

  const redis = getRedisConnection()
  const key = redisKey(chainId, address)
  const cached = await redis?.get(key)
  if (cached) {
    return { isSplit: true, terms: JSON.parse(cached) as SplitTerms, source: 'cache' }
  }

  const input = await fetchCreationInput(chainId, address)
  if (!input) {
    return { isSplit: true, terms: null, reason: 'creation-not-found', source: 'fetched' }
  }

  const terms = decodeTerms(input)
  if (!terms) {
    return { isSplit: true, terms: null, reason: 'undecodable', source: 'fetched' }
  }

  // These terms are the ones the split was created with. A mutable split could
  // have been re-pointed since, so they are a proposal, not a promise: the
  // client simulates `distributeETH` with them before enabling the button, and
  // `SplitMain` itself rejects any set that doesn't match its stored hash. An
  // hour is short enough that an updated split corrects itself quickly.
  await redis?.setex(key, 60 * 60, JSON.stringify(terms))

  return { isSplit: true, terms, source: 'fetched' }
}
