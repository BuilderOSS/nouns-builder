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

import { CHAIN_ID, Chain } from 'src/typings'

type Chains = [Chain, ...Chain[]]

const MAINNET_CHAINS: Chains = [
  { ...mainnet, id: CHAIN_ID.ETHEREUM, slug: 'ethereum', icon: '/chains/ethereum.svg' },
  { ...zora, id: CHAIN_ID.ZORA, slug: 'zora', icon: '/chains/zora.png' },
  { ...base, id: CHAIN_ID.BASE, slug: 'base', icon: '/chains/base.svg' },
  {
    ...optimism,
    id: CHAIN_ID.OPTIMISM,
    slug: 'optimism',
    icon: '/chains/optimism.svg',
  },
]

const TESTNET_CHAINS: Chains = [
  { ...sepolia, id: CHAIN_ID.SEPOLIA, slug: 'sepolia', icon: '/chains/ethereum.svg' },
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
]

export const PUBLIC_IS_TESTNET = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'testnet'

export const PUBLIC_ALL_CHAINS: Chains = [...MAINNET_CHAINS, ...TESTNET_CHAINS]

export const PUBLIC_DEFAULT_CHAINS: Chains = PUBLIC_IS_TESTNET
  ? PUBLIC_ALL_CHAINS
  : MAINNET_CHAINS

export const L1_CHAINS = PUBLIC_IS_TESTNET ? [CHAIN_ID.SEPOLIA] : [CHAIN_ID.ETHEREUM]

export const L2_CHAINS = PUBLIC_IS_TESTNET
  ? [CHAIN_ID.ZORA_SEPOLIA, CHAIN_ID.BASE_SEPOLIA, CHAIN_ID.OPTIMISM_SEPOLIA]
  : [CHAIN_ID.ZORA, CHAIN_ID.BASE, CHAIN_ID.OPTIMISM]
