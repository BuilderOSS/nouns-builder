import { NATIVE_TOKEN_ADDRESS, WETH_ADDRESS } from '@buildeross/constants/addresses'
import { CHAIN_ID } from '@buildeross/types'
import { Address } from 'viem'

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000' as const

/**
 * Check if address is native ETH (0xEeee...eeee)
 */
export function isNativeEthAddress(addr: Address): boolean {
  return addr.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
}

/**
 * Normalize currency for Uniswap V4 transaction value:
 * - NATIVE_TOKEN_ADDRESS (0xEeee...eeee) → address(0) for value transfer
 * - Everything else stays the same
 */
export function normalizeCurrency(addr: Address): Address {
  return isNativeEthAddress(addr) ? (ADDRESS_ZERO as Address) : addr
}

/**
 * Normalize currency for PoolKey:
 * - NATIVE_TOKEN_ADDRESS (0xEeee...eeee) → WETH (pools use WETH, not address(0))
 * - Everything else stays the same
 */
export function normalizeForPoolKey(addr: Address, chainId: CHAIN_ID): Address {
  if (isNativeEthAddress(addr)) {
    const weth = WETH_ADDRESS[chainId]
    if (!weth) throw new Error(`WETH address not found for chain ${chainId}`)
    return weth
  }
  return addr
}

/**
 * Ensure currency ordering uses normalized lowercase compare (NOT JS bigint parse / not raw string compare).
 */
export function sortCurrencies(a: Address, b: Address): [Address, Address] {
  const aa = normalizeCurrency(a).toLowerCase()
  const bb = normalizeCurrency(b).toLowerCase()
  return aa < bb
    ? [normalizeCurrency(a), normalizeCurrency(b)]
    : [normalizeCurrency(b), normalizeCurrency(a)]
}

/**
 * Sort currencies for PoolKey (using WETH instead of address(0))
 */
export function sortCurrenciesForPoolKey(
  a: Address,
  b: Address,
  chainId: CHAIN_ID
): [Address, Address] {
  const aa = normalizeForPoolKey(a, chainId).toLowerCase()
  const bb = normalizeForPoolKey(b, chainId).toLowerCase()
  return aa < bb
    ? [normalizeForPoolKey(a, chainId), normalizeForPoolKey(b, chainId)]
    : [normalizeForPoolKey(b, chainId), normalizeForPoolKey(a, chainId)]
}
