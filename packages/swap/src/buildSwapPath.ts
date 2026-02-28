import { NATIVE_TOKEN_ADDRESS, WETH_ADDRESS } from '@buildeross/constants/addresses'
import { CHAIN_ID } from '@buildeross/types'
import { Address } from 'viem'

import { getCoinInfo } from './getCoinInfo'
import { CoinInfo, SwapPath, SwapPathHop } from './types'

const addrEq = (a?: Address, b?: Address) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase()

/**
 * Check if address is a valid payment currency (ETH or WETH)
 */
const isValidPaymentCurrency = (addr: Address, weth: Address): boolean => {
  return addrEq(addr, weth) || addrEq(addr, NATIVE_TOKEN_ADDRESS)
}

function hopFromPairingSide(
  pairingSide: CoinInfo,
  tokenIn: Address,
  tokenOut: Address
): SwapPathHop {
  // Only Zora coins and Clanker tokens have pool info
  if (pairingSide.type !== 'zora-coin' && pairingSide.type !== 'clanker-token') {
    throw new Error('Cannot create hop from non-pool coin')
  }

  return {
    tokenIn,
    tokenOut,
    poolId:
      pairingSide.type === 'clanker-token' ? pairingSide.poolId : pairingSide.poolKeyHash,
    fee: pairingSide.fee,
    hooks: pairingSide.hooks,
    tickSpacing: pairingSide.tickSpacing,
  }
}

/**
 * Create a hop between two tokens if they are paired in either direction.
 * We pick hop metadata from the token whose `pairedToken` points at the other.
 */
function makeDirectHop(a: CoinInfo, b: CoinInfo): SwapPathHop | null {
  // Check if a has pairedToken and it matches b
  if (
    (a.type === 'zora-coin' || a.type === 'clanker-token') &&
    addrEq(a.pairedToken, b.address)
  ) {
    return hopFromPairingSide(a, a.address, b.address)
  }
  // Check if b has pairedToken and it matches a
  if (
    (b.type === 'zora-coin' || b.type === 'clanker-token') &&
    addrEq(b.pairedToken, a.address)
  ) {
    return hopFromPairingSide(b, a.address, b.address)
  }
  return null
}

/**
 * Build a coin-info chain from `start` to WETH by following pairedToken pointers.
 * Example: Z2 -> C2 -> C1 -> WETH
 */
async function buildChainToWeth(
  chainId: CHAIN_ID,
  start: Address,
  weth: Address,
  maxSteps = 4
): Promise<CoinInfo[] | null> {
  const chain: CoinInfo[] = []
  const visited = new Set<string>()

  let cur: Address = start

  for (let i = 0; i < maxSteps; i++) {
    const info = await getCoinInfo(chainId, cur)
    if (!info) return null

    const key = info.address.toLowerCase()
    if (visited.has(key)) return null // cycle / bad data
    visited.add(key)

    chain.push(info)

    if (addrEq(info.address, weth)) return chain

    // Only Zora coins and Clanker tokens have pairedToken
    if (info.type !== 'zora-coin' && info.type !== 'clanker-token') return null
    if (!info.pairedToken) return null
    cur = info.pairedToken
  }

  return null
}

/**
 * buildSwapPath constraint:
 * - tokenIn === WETH/ETH OR tokenOut === WETH/ETH
 * - ETH (NATIVE_TOKEN_ADDRESS) and WETH are both valid payment currencies
 * - Routing still goes through WETH pools (executeSwap handles ETH wrapping)
 */
export async function buildSwapPath(
  chainId: CHAIN_ID,
  tokenIn: Address,
  tokenOut: Address
): Promise<SwapPath | null> {
  const weth = WETH_ADDRESS[chainId]
  if (!weth) return null

  const tokenInIsValid = isValidPaymentCurrency(tokenIn, weth)
  const tokenOutIsValid = isValidPaymentCurrency(tokenOut, weth)

  // Enforce constraint: one side must be a valid payment currency (ETH or WETH)
  if (!tokenInIsValid && !tokenOutIsValid) return null

  // No-op swap between payment currencies (ETH<->WETH or ETH<->ETH or WETH<->WETH)
  if (tokenInIsValid && tokenOutIsValid) return { hops: [], isOptimal: true }

  // Determine the non-payment-currency side (the coin we're swapping)
  // Note: If tokenIn is ETH/WETH, we're buying the coin (tokenOut)
  //       If tokenOut is ETH/WETH, we're selling the coin (tokenIn)
  const nonPaymentCurrency = (tokenInIsValid ? tokenOut : tokenIn) as Address
  const chainToWeth = await buildChainToWeth(chainId, nonPaymentCurrency, weth, 4)
  if (!chainToWeth) return null

  // Convert chain to hops:
  // - If swapping coin -> ETH/WETH: use chain order
  // - If swapping ETH/WETH -> coin: reverse chain
  const ordered = tokenOutIsValid ? chainToWeth : [...chainToWeth].reverse()

  const hops: SwapPathHop[] = []
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i]
    const b = ordered[i + 1]
    const hop = makeDirectHop(a, b)
    if (!hop) return null // inconsistent pairing info vs expected adjacency
    hops.push(hop)
  }

  // Important: If user selected ETH (not WETH), replace WETH with NATIVE_TOKEN_ADDRESS
  // in the first or last hop to preserve their currency choice
  if (hops.length > 0) {
    const isTokenInEth = addrEq(tokenIn, NATIVE_TOKEN_ADDRESS)
    const isTokenOutEth = addrEq(tokenOut, NATIVE_TOKEN_ADDRESS)

    // Replace WETH with ETH in the appropriate hop
    if (isTokenInEth) {
      // User is buying with ETH - replace WETH in first hop's tokenIn
      const firstHop = hops[0]
      if (addrEq(firstHop.tokenIn, weth)) {
        hops[0] = { ...firstHop, tokenIn: NATIVE_TOKEN_ADDRESS }
      }
    }

    if (isTokenOutEth) {
      // User is selling for ETH - replace WETH in last hop's tokenOut
      const lastHop = hops[hops.length - 1]
      if (addrEq(lastHop.tokenOut, weth)) {
        hops[hops.length - 1] = { ...lastHop, tokenOut: NATIVE_TOKEN_ADDRESS }
      }
    }
  }

  return { hops, isOptimal: true }
}
