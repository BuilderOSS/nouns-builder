import { WETH_ADDRESS } from '@buildeross/constants/addresses'
import { CHAIN_ID } from '@buildeross/types'
import { Address } from 'viem'

import { getCoinInfo as getCoinInfoUncached } from './getCoinInfo'
import { CoinInfo, SwapPath, SwapPathHop } from './types'

const addrEq = (a?: Address, b?: Address) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase()

function hopFromPairingSide(
  pairingSide: CoinInfo,
  tokenIn: Address,
  tokenOut: Address
): SwapPathHop {
  return {
    tokenIn,
    tokenOut,
    poolId: pairingSide.poolId || pairingSide.poolKeyHash || '',
    fee: pairingSide.fee, // optional per your type
    hooks: pairingSide.hooks, // optional
    tickSpacing: pairingSide.tickSpacing, // optional
  }
}

/**
 * Create a hop between two tokens if they are paired in either direction.
 * We pick hop metadata from the token whose `pairedToken` points at the other.
 */
function makeDirectHop(a: CoinInfo, b: CoinInfo): SwapPathHop | null {
  if (addrEq(a.pairedToken, b.address)) {
    return hopFromPairingSide(a, a.address, b.address)
  }
  if (addrEq(b.pairedToken, a.address)) {
    return hopFromPairingSide(b, a.address, b.address)
  }
  return null
}

/**
 * Build a coin-info chain from `start` to WETH by following pairedToken pointers.
 * Example: Z2 -> C2 -> C1 -> WETH
 */
async function buildChainToWeth(
  start: Address,
  weth: Address,
  getCoinInfo: (a: Address) => Promise<CoinInfo | null>,
  maxSteps = 4
): Promise<CoinInfo[] | null> {
  const chain: CoinInfo[] = []
  const visited = new Set<string>()

  let cur: Address = start

  for (let i = 0; i < maxSteps; i++) {
    const info = await getCoinInfo(cur)
    if (!info) return null

    const key = info.address.toLowerCase()
    if (visited.has(key)) return null // cycle / bad data
    visited.add(key)

    chain.push(info)

    if (addrEq(info.address, weth)) return chain

    if (!info.pairedToken) return null
    cur = info.pairedToken
  }

  return null
}

/**
 * buildSwapPath constraint:
 * - tokenIn === WETH OR tokenOut === WETH
 */
export async function buildSwapPath(
  chainId: CHAIN_ID,
  tokenIn: Address,
  tokenOut: Address
): Promise<SwapPath | null> {
  const weth = WETH_ADDRESS[chainId]
  if (!weth) return null

  const tokenInIsWeth = addrEq(tokenIn, weth)
  const tokenOutIsWeth = addrEq(tokenOut, weth)

  // Enforce your constraint (or allow WETH->WETH as a no-op)
  if (!tokenInIsWeth && !tokenOutIsWeth) return null
  if (tokenInIsWeth && tokenOutIsWeth) return { hops: [], isOptimal: true }

  // Cache per call to avoid repeated subgraph requests
  const cache = new Map<string, Promise<CoinInfo | null>>()
  const getCoinInfo = (addr: Address) => {
    const key = addr.toLowerCase()
    if (!cache.has(key)) cache.set(key, getCoinInfoUncached(chainId, addr))
    return cache.get(key)!
  }

  const nonWeth = (tokenInIsWeth ? tokenOut : tokenIn) as Address
  const chainToWeth = await buildChainToWeth(nonWeth, weth, getCoinInfo, 4)
  if (!chainToWeth) return null

  // Convert chain to hops:
  // - If swapping nonWeth -> WETH: use chain order
  // - If swapping WETH -> nonWeth: reverse chain
  const ordered = tokenOutIsWeth ? chainToWeth : [...chainToWeth].reverse()

  const hops: SwapPathHop[] = []
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i]
    const b = ordered[i + 1]
    const hop = makeDirectHop(a, b)
    if (!hop) return null // inconsistent pairing info vs expected adjacency
    hops.push(hop)
  }

  return { hops, isOptimal: true }
}
