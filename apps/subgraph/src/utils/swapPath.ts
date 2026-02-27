import { BigInt, Bytes, log } from '@graphprotocol/graph-ts'

import { PaymentOption, SwapHop, SwapRoute } from '../../generated/schema'
import { CoinInfo, CoinType, loadCoinInfo } from './coinInfo'
import { WETH_ADDRESS } from './constants'

/**
 * Represents a hop in the swap path during calculation
 */
class PathHop {
  tokenIn: Bytes
  tokenOut: Bytes
  poolId: Bytes
  fee: BigInt | null
  hooks: Bytes | null
  tickSpacing: i32 // Use 0 as sentinel for null

  constructor(
    tokenIn: Bytes,
    tokenOut: Bytes,
    poolId: Bytes,
    fee: BigInt | null,
    hooks: Bytes | null,
    tickSpacing: i32
  ) {
    this.tokenIn = tokenIn
    this.tokenOut = tokenOut
    this.poolId = poolId
    this.fee = fee
    this.hooks = hooks
    this.tickSpacing = tickSpacing
  }
}

/**
 * Create a hop from a coin with pool info
 * Returns null if the coin doesn't have pool info
 */
function hopFromCoinInfo(
  pairingSide: CoinInfo,
  tokenIn: Bytes,
  tokenOut: Bytes
): PathHop | null {
  if (!pairingSide.poolId) {
    log.error('Cannot create hop from coin without poolId: {}', [
      pairingSide.address.toHexString(),
    ])
    return null
  }

  return new PathHop(
    tokenIn,
    tokenOut,
    pairingSide.poolId!,
    pairingSide.fee,
    pairingSide.hooks,
    pairingSide.tickSpacing
  )
}

/**
 * Create a hop between two coins if they are paired
 * Returns null if they are not directly paired
 */
function makeDirectHop(a: CoinInfo, b: CoinInfo): PathHop | null {
  // Check if a is paired with b
  if (
    (a.type == CoinType.ZORA_COIN || a.type == CoinType.CLANKER_TOKEN) &&
    a.pairedToken &&
    a.pairedToken!.equals(b.address)
  ) {
    return hopFromCoinInfo(a, a.address, b.address)
  }

  // Check if b is paired with a
  if (
    (b.type == CoinType.ZORA_COIN || b.type == CoinType.CLANKER_TOKEN) &&
    b.pairedToken &&
    b.pairedToken!.equals(a.address)
  ) {
    return hopFromCoinInfo(b, a.address, b.address)
  }

  return null
}

/**
 * Build a chain from start to WETH by following pairedToken pointers
 * Returns null if no valid path exists
 */
function buildChainToWeth(start: Bytes, maxSteps: i32): CoinInfo[] | null {
  const chain: CoinInfo[] = []
  const visited = new Set<string>()

  let current = start

  for (let i = 0; i < maxSteps; i++) {
    const info = loadCoinInfo(current)
    if (!info) {
      log.warning('Failed to load coin info for address: {}', [current.toHexString()])
      return null
    }

    const key = info.address.toHexString().toLowerCase()
    if (visited.has(key)) {
      log.warning('Cycle detected in pairing chain at: {}', [key])
      return null // cycle detected
    }
    visited.add(key)

    chain.push(info)

    // If we reached WETH, we're done
    if (info.address.equals(WETH_ADDRESS)) {
      return chain
    }

    // Only coins with pairedToken can continue the chain
    if (info.type != CoinType.ZORA_COIN && info.type != CoinType.CLANKER_TOKEN) {
      log.warning('Coin {} has type {} which cannot have pairedToken', [
        info.address.toHexString(),
        info.type,
      ])
      return null
    }

    if (!info.pairedToken) {
      log.warning('Coin {} has no pairedToken', [info.address.toHexString()])
      return null
    }

    current = info.pairedToken!
  }

  log.warning('Max steps exceeded while building chain to WETH', [])
  return null
}

/**
 * Build swap route for a coin
 * This creates the SwapRoute entity with all hops and payment options
 *
 * Returns the created SwapRoute or null if route building fails
 */
export function buildSwapRoute(coinAddress: Bytes, timestamp: BigInt): SwapRoute | null {
  // Build chain from coin to WETH
  const chainToWeth = buildChainToWeth(coinAddress, 4)
  if (!chainToWeth) {
    log.error('Failed to build chain to WETH for coin: {}', [coinAddress.toHexString()])
    return null
  }

  // Create SwapRoute entity
  const routeId = coinAddress.toHexString()
  let route = new SwapRoute(routeId)
  route.coinAddress = coinAddress
  route.createdAt = timestamp
  route.updatedAt = timestamp

  // Convert chain to hops (coin -> WETH direction)
  const hops: PathHop[] = []
  for (let i = 0; i < chainToWeth.length - 1; i++) {
    const a = chainToWeth[i]
    const b = chainToWeth[i + 1]
    const hop = makeDirectHop(a, b)
    if (!hop) {
      log.error('Failed to create hop between {} and {}', [
        a.address.toHexString(),
        b.address.toHexString(),
      ])
      return null
    }
    hops.push(hop)
  }

  // Save route first so we can link hops to it
  route.save()

  // Create SwapHop entities
  for (let i = 0; i < hops.length; i++) {
    const hop = hops[i]
    const hopId = routeId + '-' + i.toString()
    let swapHop = new SwapHop(hopId)
    swapHop.route = routeId
    swapHop.tokenIn = hop.tokenIn
    swapHop.tokenOut = hop.tokenOut
    swapHop.poolId = hop.poolId
    swapHop.fee = hop.fee
    swapHop.hooks = hop.hooks
    swapHop.tickSpacing = hop.tickSpacing
    swapHop.hopIndex = i
    swapHop.save()
  }

  // Extract payment options from the chain
  // Payment options are: WETH + all intermediate tokens (excluding the coin itself)
  const paymentTokens = new Set<string>()

  // Always add WETH
  paymentTokens.add(WETH_ADDRESS.toHexString().toLowerCase())

  // Add intermediate tokens from the chain (skip first and last)
  for (let i = 1; i < chainToWeth.length - 1; i++) {
    const token = chainToWeth[i]
    paymentTokens.add(token.address.toHexString().toLowerCase())
  }

  // Create PaymentOption entities
  const paymentTokenArray = paymentTokens.values()
  for (let i = 0; i < paymentTokenArray.length; i++) {
    const tokenAddr = paymentTokenArray[i]
    const tokenBytes = Bytes.fromHexString(tokenAddr)

    // Find this token in the chain to determine hop indices
    let startHopIndex = -1
    let endHopIndex = -1

    // Special case: WETH is the last token in the chain (when selling coin -> WETH)
    if (tokenAddr == WETH_ADDRESS.toHexString().toLowerCase()) {
      // For WETH, use the full path
      startHopIndex = 0
      endHopIndex = hops.length - 1
    } else {
      // Find where this token appears in the chain
      for (let j = 0; j < chainToWeth.length; j++) {
        if (chainToWeth[j].address.toHexString().toLowerCase() == tokenAddr) {
          // Store hop indices for coin → intermediate-token direction
          // startHopIndex = 0 represents the hop starting from the coin
          // endHopIndex = j - 1 represents the hop ending at the intermediate token
          // The frontend must reverse these indices when selling (intermediate-token → coin)
          startHopIndex = 0
          endHopIndex = j > 0 ? j - 1 : 0
          break
        }
      }
    }

    if (startHopIndex == -1) {
      log.warning('Payment token {} not found in chain', [tokenAddr])
      continue
    }

    // Determine token type
    let tokenType = CoinType.WETH
    const info = loadCoinInfo(tokenBytes)
    if (info) {
      tokenType = info.type
    }

    // Create payment option
    const optionId = routeId + '-' + tokenAddr
    let option = new PaymentOption(optionId)
    option.route = routeId
    option.tokenAddress = tokenBytes
    option.tokenType = tokenType
    option.startHopIndex = startHopIndex
    option.endHopIndex = endHopIndex
    option.isDirectSwap = endHopIndex - startHopIndex == 0 // Single hop = direct swap
    option.save()
  }

  return route
}
