import { WETH_ADDRESS } from '@buildeross/constants/addresses'
import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { Address } from 'viem'

import { withCors } from '../../../utils/api/cors'
import { withRateLimit } from '../../../utils/api/rateLimit'

export interface PopularToken {
  address: Address
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  isNative?: boolean
}

// Popular tokens on Ethereum
const ETHEREUM_TOKENS: PopularToken[] = [
  {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    isNative: true,
  },
  {
    address: WETH_ADDRESS[CHAIN_ID.ETHEREUM],
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' as Address,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
  },
  {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as Address,
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
  },
]

// Popular tokens on Sepolia
const SEPOLIA_TOKENS: PopularToken[] = [
  {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    isNative: true,
  },
  {
    address: WETH_ADDRESS[CHAIN_ID.SEPOLIA],
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
]

// Popular tokens on Optimism
const OPTIMISM_TOKENS: PopularToken[] = [
  {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    isNative: true,
  },
  {
    address: WETH_ADDRESS[CHAIN_ID.OPTIMISM],
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
  {
    address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' as Address,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  {
    address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58' as Address,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
  },
  {
    address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1' as Address,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
  },
  {
    address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095' as Address,
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
  },
]

// Popular tokens on Base
const BASE_TOKENS: PopularToken[] = [
  {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    isNative: true,
  },
  {
    address: WETH_ADDRESS[CHAIN_ID.BASE],
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
  {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' as Address,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
  },
  {
    address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA' as Address,
    symbol: 'USDbC',
    name: 'USD Base Coin',
    decimals: 6,
  },
  {
    address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf' as Address,
    symbol: 'cbBTC',
    name: 'Coinbase Wrapped BTC',
    decimals: 8,
  },
]

// Popular tokens on Base Sepolia
const BASE_SEPOLIA_TOKENS: PopularToken[] = [
  {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    isNative: true,
  },
  {
    address: WETH_ADDRESS[CHAIN_ID.BASE_SEPOLIA],
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
]

const TOKENS_BY_CHAIN: Record<number, PopularToken[]> = {
  [CHAIN_ID.ETHEREUM]: ETHEREUM_TOKENS,
  [CHAIN_ID.SEPOLIA]: SEPOLIA_TOKENS,
  [CHAIN_ID.OPTIMISM]: OPTIMISM_TOKENS,
  [CHAIN_ID.BASE]: BASE_TOKENS,
  [CHAIN_ID.BASE_SEPOLIA]: BASE_SEPOLIA_TOKENS,
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { chainId } = req.query

  if (!chainId) {
    return res.status(400).json({ error: 'Missing chainId parameter' })
  }

  const chainIdString = chainId as string

  // Validate chainId contains only decimal digits before numeric conversion
  if (!/^\d+$/.test(chainIdString)) {
    return res
      .status(400)
      .json({ error: 'Invalid chainId format. Must contain only decimal digits.' })
  }

  const chainIdNum = parseInt(chainIdString, 10)

  // Validate chain ID - check if we have tokens for this chain
  if (!TOKENS_BY_CHAIN[chainIdNum]) {
    return res.status(400).json({
      error:
        'Unsupported chain. Supported chains: Ethereum, Sepolia, Optimism, Optimism Sepolia, Base, Base Sepolia.',
    })
  }

  try {
    const tokens = TOKENS_BY_CHAIN[chainIdNum] || []

    return res.status(200).json({
      success: true,
      data: tokens,
      chainId: chainIdNum,
    })
  } catch (error) {
    console.error('Token list API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export default withCors()(
  withRateLimit({
    keyPrefix: 'uniswap:tokens',
    maxRequests: 60, // 60 requests per minute (less intensive)
  })(handler)
)
