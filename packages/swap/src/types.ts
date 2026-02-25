import { Address, Hex } from 'viem'

/**
 * ERC20 token for trading
 */
export type TradeERC20 = {
  type: 'erc20'
  address: Address
}

/**
 * Native ETH for trading
 */
export type TradeETH = {
  type: 'eth'
}

/**
 * Currency that can be traded (ETH or ERC20)
 */
export type TradeCurrency = TradeERC20 | TradeETH

/**
 * Permit2 details for gasless approvals
 */
export type PermitDetails = {
  token: Address
  amount: bigint
  expiration: number
  nonce: number
}

/**
 * Permit2 signature structure
 */
export type Permit = {
  details: PermitDetails
  spender: Address
  sigDeadline: bigint
}

/**
 * Permit with string amounts for API serialization
 */
export type PermitDetailsStringAmounts = {
  token: Address
  amount: string
  expiration: number
  nonce: number
}

/**
 * Permit with string amounts for API
 */
export type PermitStringAmounts = {
  details: PermitDetailsStringAmounts
  spender: Address
  sigDeadline: string
}

/**
 * Signature with permit for Permit2
 */
export type SignatureWithPermit<TPermit = Permit> = {
  signature: Hex
  permit: TPermit
}

/**
 * Parameters for executing a swap
 */
export type TradeParameters = {
  /** Token/ETH to sell */
  sell: TradeCurrency
  /** Token/ETH to buy */
  buy: TradeCurrency
  /** Amount of sell token (in wei) */
  amountIn: bigint
  /** Slippage tolerance (0-1, e.g. 0.01 = 1%) */
  slippage?: number
  /** Address sending the transaction (can be smart wallet or EOA) */
  sender: Address
  /** Address that will sign (needs to be EOA, defaults to sender if not provided) */
  signer?: Address
  /** Address to receive the output tokens (defaults to sender if not provided) */
  recipient?: Address
  /** Pre-signed permits for Permit2 (optional) */
  signatures?: SignatureWithPermit<PermitStringAmounts>[]
  /** How long the permit should be active (in seconds, default 3600) */
  permitActiveSeconds?: number
}

/**
 * Swap path hop (single pool in the route)
 */
export type SwapPathHop = {
  /** Input token address */
  tokenIn: Address
  /** Output token address */
  tokenOut: Address
  /** Pool ID or key hash */
  poolId: string
  /** Pool fee tier (if applicable) */
  fee?: bigint
  /** Uniswap V4 hooks address */
  hooks?: Address
  /** Tick spacing for the pool */
  tickSpacing?: number
}

/**
 * Complete swap path from input to output
 */
export type SwapPath = {
  /** Array of hops in the swap route */
  hops: SwapPathHop[]
  /** Total estimated gas cost */
  estimatedGas?: bigint
  /** Whether this is the optimal path */
  isOptimal: boolean
}

/**
 * Quote for a swap
 */
export type SwapQuote = {
  /** Expected amount out (in wei) */
  amountOut: bigint
  /** Minimum amount out after slippage (in wei) */
  minAmountOut: bigint
  /** Gas estimate for the transaction */
  gasEstimate?: bigint
  /** Swap path used */
  path: SwapPath
  /** Price impact percentage (0-1) */
  priceImpact?: number
}

/**
 * API response for quote request
 */
export type PostQuoteResponse = {
  /** Transaction call data */
  call: {
    target: Address
    data: Hex
    value: string
  }
  /** Expected amount out */
  amountOut: string
  /** Minimum amount out */
  minAmountOut: string
  /** Permits needed (if any) */
  permits?: Array<{
    signature?: Hex
    permit: PermitStringAmounts
  }>
}

/**
 * Coin type for routing
 */
export type CoinType = 'zora-coin' | 'clanker-token' | 'weth' | 'eth'

/**
 * Base coin info shared by all coin types
 */
type BaseCoinInfo = {
  address: Address
  symbol: string
  name: string
}

/**
 * ETH coin info
 */
type EthCoinInfo = BaseCoinInfo & {
  type: 'eth'
}

/**
 * WETH coin info
 */
type WethCoinInfo = BaseCoinInfo & {
  type: 'weth'
}

/**
 * Zora coin info with required pool fields
 */
type ZoraCoinInfo = BaseCoinInfo & {
  type: 'zora-coin'
  /** The clanker token it's paired with */
  pairedToken: Address
  /** Pool key hash for Uniswap V4 */
  poolKeyHash: string
  /** Pool hooks address */
  hooks: Address
  /** Pool fee */
  fee: bigint
  /** Tick spacing */
  tickSpacing: number
}

/**
 * Clanker token info with required pool fields
 */
type ClankerTokenInfo = BaseCoinInfo & {
  type: 'clanker-token'
  /** The token it's paired with */
  pairedToken: Address
  /** Pool ID for Uniswap V4 */
  poolId: string
  /** Pool hooks address */
  hooks: Address
  /** Pool fee (always dynamic fee flag for clanker) */
  fee: bigint
  /** Tick spacing */
  tickSpacing: number
}

/**
 * Coin info for building swap paths
 * Discriminated union based on coin type
 */
export type CoinInfo = EthCoinInfo | WethCoinInfo | ZoraCoinInfo | ClankerTokenInfo

/**
 * Pool key for Uniswap V4
 */
export type PoolKey = {
  currency0: Address
  currency1: Address
  fee: number
  tickSpacing: number
  hooks: Address
}

/**
 * Result from getPoolMaxSwapAmount
 */
export type PoolMaxSwapAmountResult = {
  /** Maximum amount that can be swapped in */
  maxAmountIn: bigint
  /** Current sqrt price in Q64.96 format */
  sqrtPriceX96: bigint
  /** Current tick */
  tick: number
  /** Available liquidity */
  liquidity: bigint
}
