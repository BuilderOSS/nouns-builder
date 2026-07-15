import { CHAIN_ID } from '@buildeross/types'

/**
 * Global, per-CHAIN registry of well-known treasury tokens.
 *
 * This is intentionally keyed by chain (a handful of entries), NOT by DAO —
 * so it scales to every DAO on the platform with zero per-DAO configuration.
 * Each DAO's own clanker token is discovered dynamically from the subgraph and
 * appended at runtime (see TreasuryComposition), so this list only needs the
 * chain-level blue-chips (stables, wrapped ETH, notable community tokens).
 */
export type TokenKind = 'stable' | 'weth' | 'other'

export interface TreasuryToken {
  symbol: string
  address: `0x${string}`
  decimals: number
  kind: TokenKind
}

export const COMMON_TREASURY_TOKENS: Partial<Record<CHAIN_ID, TreasuryToken[]>> = {
  [CHAIN_ID.BASE]: [
    {
      symbol: 'USDC',
      address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      decimals: 6,
      kind: 'stable',
    },
    {
      symbol: 'USDT',
      address: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2',
      decimals: 6,
      kind: 'stable',
    },
    {
      symbol: 'DAI',
      address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
      decimals: 18,
      kind: 'stable',
    },
    {
      symbol: 'WETH',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      kind: 'weth',
    },
    {
      symbol: 'HIGHER',
      address: '0x0578d8a44db98b23bf096a382e016e29a5ce0ffe',
      decimals: 18,
      kind: 'other',
    },
  ],
  [CHAIN_ID.ETHEREUM]: [
    {
      symbol: 'USDC',
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
      kind: 'stable',
    },
    {
      symbol: 'USDT',
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      decimals: 6,
      kind: 'stable',
    },
    {
      symbol: 'DAI',
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      decimals: 18,
      kind: 'stable',
    },
    {
      symbol: 'WETH',
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      decimals: 18,
      kind: 'weth',
    },
  ],
  [CHAIN_ID.OPTIMISM]: [
    {
      symbol: 'USDC',
      address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      decimals: 6,
      kind: 'stable',
    },
    {
      symbol: 'USDT',
      address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
      decimals: 6,
      kind: 'stable',
    },
    {
      symbol: 'DAI',
      address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
      decimals: 18,
      kind: 'stable',
    },
    {
      symbol: 'WETH',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      kind: 'weth',
    },
  ],
  [CHAIN_ID.ZORA]: [
    {
      symbol: 'USDC',
      address: '0xcccccccc7021b32ebb4e8c08314bd62f7c653ec4',
      decimals: 6,
      kind: 'stable',
    },
    {
      symbol: 'WETH',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      kind: 'weth',
    },
  ],
}
