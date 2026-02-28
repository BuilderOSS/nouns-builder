import { Chain, CHAIN_ID } from '@buildeross/types'
import {
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
  zora,
  zoraSepolia,
} from 'wagmi/chains'

/**
 * Non-empty array of items.
 */
type NonEmptyArray<T> = readonly [T, ...T[]]

/**
 * Non-empty array of Chain (matches your original Chains type intent).
 */
export type Chains = NonEmptyArray<Chain>

const sorter = (a: Chain, b: Chain) => a.icon.localeCompare(b.icon)

/**
 * Sorts a non-empty chain list by name while preserving its non-empty type.
 */
export const sortNonEmptyChains = <T extends Chain>(
  chains: NonEmptyArray<T>
): NonEmptyArray<T> => {
  const sorted = [...chains].sort(sorter)
  const [first, ...rest] = sorted
  return [first, ...rest] as [T, ...T[]]
}

// ----------------------
// MAINNET CHAINS
// ----------------------

const MAINNET_CHAINS_UNSORTED: Chains = [
  {
    ...mainnet,
    id: CHAIN_ID.ETHEREUM,
    slug: 'ethereum',
    icon: '/chains/ethereum.svg',
  },
  {
    ...zora,
    id: CHAIN_ID.ZORA,
    slug: 'zora',
    icon: '/chains/zora.png',
  },
  {
    ...base,
    id: CHAIN_ID.BASE,
    slug: 'base',
    icon: '/chains/base.svg',
  },
  {
    ...optimism,
    id: CHAIN_ID.OPTIMISM,
    slug: 'optimism',
    icon: '/chains/optimism.svg',
  },
] as const satisfies Chains

export const MAINNET_CHAINS: Chains = sortNonEmptyChains(MAINNET_CHAINS_UNSORTED)

// ----------------------
// TESTNET CHAINS
// ----------------------

const TESTNET_CHAINS_UNSORTED: Chains = [
  {
    ...sepolia,
    id: CHAIN_ID.SEPOLIA,
    slug: 'sepolia',
    icon: '/chains/ethereum.svg',
  },
  {
    ...optimismSepolia,
    id: CHAIN_ID.OPTIMISM_SEPOLIA,
    slug: 'op-sepolia',
    icon: '/chains/optimism.svg',
  },
  {
    ...baseSepolia,
    id: CHAIN_ID.BASE_SEPOLIA,
    slug: 'base-sepolia',
    icon: '/chains/base.svg',
  },
  {
    ...zoraSepolia,
    id: CHAIN_ID.ZORA_SEPOLIA,
    slug: 'zora-sepolia',
    icon: '/chains/zora.png',
  },
] as const satisfies Chains

export const TESTNET_CHAINS: Chains = sortNonEmptyChains(TESTNET_CHAINS_UNSORTED)

// ----------------------
// ENV CONFIG
// ----------------------

export const PUBLIC_IS_TESTNET = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'testnet'

// ----------------------
// ALL / DEFAULT CHAINS
// ----------------------

// Still non-empty: concatenation of two non-empty arrays.
const PUBLIC_ALL_CHAINS_UNSORTED = [
  ...MAINNET_CHAINS_UNSORTED,
  ...TESTNET_CHAINS_UNSORTED,
] as const satisfies readonly Chain[]

export const PUBLIC_ALL_CHAINS: Chains = sortNonEmptyChains(
  PUBLIC_ALL_CHAINS_UNSORTED as NonEmptyArray<Chain>
)

const PUBLIC_DEFAULT_CHAINS_UNSORTED = PUBLIC_IS_TESTNET
  ? PUBLIC_ALL_CHAINS_UNSORTED
  : MAINNET_CHAINS_UNSORTED

export const PUBLIC_DEFAULT_CHAINS: Chains = sortNonEmptyChains(
  PUBLIC_DEFAULT_CHAINS_UNSORTED as NonEmptyArray<Chain>
)

// ----------------------
// L1 / L2 CHAIN IDS
// ----------------------

export type NonEmptyChainIds = NonEmptyArray<CHAIN_ID>

export const L1_CHAINS: NonEmptyChainIds = PUBLIC_IS_TESTNET
  ? ([CHAIN_ID.SEPOLIA] as const)
  : ([CHAIN_ID.ETHEREUM] as const)

export const L2_CHAINS: NonEmptyChainIds = PUBLIC_IS_TESTNET
  ? ([CHAIN_ID.ZORA_SEPOLIA, CHAIN_ID.BASE_SEPOLIA, CHAIN_ID.OPTIMISM_SEPOLIA] as const)
  : ([CHAIN_ID.ZORA, CHAIN_ID.BASE, CHAIN_ID.OPTIMISM] as const)
