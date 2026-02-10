import {
  PERMIT2_ADDRESS,
  UNISWAP_UNIVERSAL_ROUTER_ADDRESS,
} from '@buildeross/constants/addresses'
import { CHAIN_ID } from '@buildeross/types'
import {
  Address,
  encodeAbiParameters,
  encodePacked,
  erc20Abi,
  Hex,
  maxUint256,
  PublicClient,
  WalletClient,
} from 'viem'

import { permit2Abi } from './abis/permit2'
import { universalRouterAbi } from './abis/universalRouter'
import { Actions, Commands } from './constants/v4Router'
import { PoolKey } from './getQuoteFromUniswap'
import { SwapPath } from './types'

/**
 * ExactInputSingleParams for V4Router
 */
interface ExactInputSingleParams {
  poolKey: PoolKey
  zeroForOne: boolean
  amountIn: bigint
  amountOutMinimum: bigint
  hookData: Hex
}

/**
 * PathKey for multi-hop swaps (IV4Router.PathKey)
 */
interface PathKey {
  intermediateCurrency: Address
  fee: number // uint24
  tickSpacing: number // int24
  hooks: Address
  hookData: Hex
}

/**
 * ExactInputParams for multi-hop V4Router swaps
 */
interface ExactInputParams {
  currencyIn: Address
  path: PathKey[]
  amountIn: bigint
  amountOutMinimum: bigint
}

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000' as const
const ETH_EEEE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as const

function isNativeEthAddress(addr: Address) {
  const a = addr.toLowerCase()
  return a === ADDRESS_ZERO || a === ETH_EEEE
}

/**
 * Uniswap v4 docs represent native ETH as address(0) (Currency.wrap(address(0))).
 * If callers pass 0xEeee..., normalize to 0x0 for encoding.
 */
function normalizeCurrency(addr: Address): Address {
  return isNativeEthAddress(addr) ? (ADDRESS_ZERO as Address) : addr
}

/**
 * Ensure currency ordering uses normalized lowercase compare (NOT JS bigint parse / not raw string compare).
 */
function sortCurrencies(a: Address, b: Address): [Address, Address] {
  const aa = normalizeCurrency(a).toLowerCase()
  const bb = normalizeCurrency(b).toLowerCase()
  return aa < bb
    ? [normalizeCurrency(a), normalizeCurrency(b)]
    : [normalizeCurrency(b), normalizeCurrency(a)]
}

function toUint24(n: bigint | number): number {
  const x = typeof n === 'bigint' ? Number(n) : n
  // basic guard; avoids accidental overflow
  if (!Number.isFinite(x) || x < 0 || x > 0xffffff) {
    throw new Error(`fee out of uint24 range: ${n.toString()}`)
  }
  return x
}

/**
 * Build swap calldata for Universal Router
 * Supports both single-hop and multi-hop swaps
 */
export function buildSwapCalldata({
  path,
  amountIn,
  minAmountOut,
}: {
  path: SwapPath
  amountIn: bigint
  minAmountOut: bigint
}): { commands: Hex; inputs: Hex[]; value: bigint } {
  if (!path?.hops?.length) throw new Error('Empty swap path')

  return path.hops.length === 1
    ? buildSingleHopSwap(path, amountIn, minAmountOut)
    : buildMultiHopSwap(path, amountIn, minAmountOut)
}

/**
 * Build single-hop swap calldata (matches Uniswap v4 quickstart)
 */
function buildSingleHopSwap(
  path: SwapPath,
  amountIn: bigint,
  minAmountOut: bigint
): { commands: Hex; inputs: Hex[]; value: bigint } {
  const hop = path.hops[0]

  if (!hop.fee || hop.tickSpacing == null || !hop.hooks) {
    throw new Error('Missing required pool parameters (fee/tickSpacing/hooks)')
  }

  const tokenIn = normalizeCurrency(hop.tokenIn)
  const tokenOut = normalizeCurrency(hop.tokenOut)

  const [currency0, currency1] = sortCurrencies(tokenIn, tokenOut)

  const poolKey: PoolKey = {
    currency0,
    currency1,
    fee: toUint24(hop.fee),
    tickSpacing: hop.tickSpacing,
    hooks: hop.hooks,
  }

  const zeroForOne = tokenIn.toLowerCase() === poolKey.currency0.toLowerCase()

  // Encode actions (docs)
  const actions = encodePacked(
    ['uint8', 'uint8', 'uint8'],
    [Actions.SWAP_EXACT_IN_SINGLE, Actions.SETTLE_ALL, Actions.TAKE_ALL]
  )

  const params: Hex[] = []

  // 1) SWAP_EXACT_IN_SINGLE
  const swapParams: ExactInputSingleParams = {
    poolKey,
    zeroForOne,
    amountIn,
    amountOutMinimum: minAmountOut,
    hookData: '0x',
  }

  params.push(
    encodeAbiParameters(
      [
        {
          components: [
            {
              components: [
                { name: 'currency0', type: 'address' },
                { name: 'currency1', type: 'address' },
                { name: 'fee', type: 'uint24' },
                { name: 'tickSpacing', type: 'int24' },
                { name: 'hooks', type: 'address' },
              ],
              name: 'poolKey',
              type: 'tuple',
            },
            { name: 'zeroForOne', type: 'bool' },
            { name: 'amountIn', type: 'uint128' },
            { name: 'amountOutMinimum', type: 'uint128' },
            { name: 'hookData', type: 'bytes' },
          ],
          type: 'tuple',
        },
      ],
      [swapParams]
    )
  )

  // 2) SETTLE_ALL(currencyIn, amountIn) — currency depends on direction
  const settleCurrency = zeroForOne ? poolKey.currency0 : poolKey.currency1
  params.push(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'uint256' }],
      [settleCurrency, amountIn]
    )
  )

  // 3) TAKE_ALL(currencyOut, minAmountOut) — matches docs
  const takeCurrency = zeroForOne ? poolKey.currency1 : poolKey.currency0
  params.push(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'uint256' }],
      [takeCurrency, minAmountOut]
    )
  )

  const inputs = [
    encodeAbiParameters([{ type: 'bytes' }, { type: 'bytes[]' }], [actions, params]),
  ]

  const commands = encodePacked(['uint8'], [Commands.V4_SWAP])

  // Send ETH value only if tokenIn is native ETH (address(0) or 0xEeee...)
  const value = isNativeEthAddress(hop.tokenIn) ? amountIn : 0n

  return { commands, inputs, value }
}

/**
 * Build multi-hop swap calldata (Exact In)
 */
function buildMultiHopSwap(
  path: SwapPath,
  amountIn: bigint,
  minAmountOut: bigint
): { commands: Hex; inputs: Hex[]; value: bigint } {
  const firstHop = path.hops[0]
  const lastHop = path.hops[path.hops.length - 1]

  const currencyIn = normalizeCurrency(firstHop.tokenIn)
  const currencyOut = normalizeCurrency(lastHop.tokenOut)

  // Build PathKey[]: one entry per hop, each describing the *next* currency and pool params.
  const pathKeys: PathKey[] = path.hops.map((hop, i) => {
    if (!hop.fee || hop.tickSpacing == null || !hop.hooks) {
      throw new Error(
        `Missing required pool parameters for hop ${i} (fee/tickSpacing/hooks)`
      )
    }

    return {
      intermediateCurrency: normalizeCurrency(hop.tokenOut),
      fee: toUint24(hop.fee),
      tickSpacing: hop.tickSpacing,
      hooks: hop.hooks,
      hookData: '0x',
    }
  })

  const actions = encodePacked(
    ['uint8', 'uint8', 'uint8'],
    [Actions.SWAP_EXACT_IN, Actions.SETTLE_ALL, Actions.TAKE_ALL]
  )

  const params: Hex[] = []

  // 1) SWAP_EXACT_IN
  const swapParams: ExactInputParams = {
    currencyIn,
    path: pathKeys,
    amountIn,
    amountOutMinimum: minAmountOut,
  }

  params.push(
    encodeAbiParameters(
      [
        {
          components: [
            { name: 'currencyIn', type: 'address' },
            {
              components: [
                { name: 'intermediateCurrency', type: 'address' },
                { name: 'fee', type: 'uint24' },
                { name: 'tickSpacing', type: 'int24' },
                { name: 'hooks', type: 'address' },
                { name: 'hookData', type: 'bytes' },
              ],
              name: 'path',
              type: 'tuple[]',
            },
            { name: 'amountIn', type: 'uint128' },
            { name: 'amountOutMinimum', type: 'uint128' },
          ],
          type: 'tuple',
        },
      ],
      [swapParams]
    )
  )

  // 2) SETTLE_ALL(currencyIn, amountIn)
  params.push(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'uint256' }],
      [currencyIn, amountIn]
    )
  )

  // 3) TAKE_ALL(currencyOut, minAmountOut) — IMPORTANT: matches docs & single-hop
  params.push(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'uint256' }],
      [currencyOut, minAmountOut]
    )
  )

  const inputs = [
    encodeAbiParameters([{ type: 'bytes' }, { type: 'bytes[]' }], [actions, params]),
  ]

  const commands = encodePacked(['uint8'], [Commands.V4_SWAP])

  const value = isNativeEthAddress(firstHop.tokenIn) ? amountIn : 0n
  return { commands, inputs, value }
}

/**
 * Execute a swap using Uniswap V4 Universal Router
 *
 * This version follows the Uniswap v4 quickstart Permit2 flow:
 * 1) ERC20 approve Permit2 (unlimited)
 * 2) Permit2 approve Universal Router (amount + expiration) — on-chain
 *
 * (No PermitSingle signature in this drop-in; it’s simpler and matches docs.)
 */
export async function executeSwap({
  chainId,
  path,
  amountIn,
  minAmountOut,
  walletClient,
  publicClient,
  validateTransaction = true,
}: {
  chainId: CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA
  path: SwapPath
  amountIn: bigint
  minAmountOut: bigint
  walletClient: WalletClient
  publicClient: PublicClient
  validateTransaction?: boolean
}): Promise<{ hash: Hex; amountOut?: bigint }> {
  const universalRouterAddress = UNISWAP_UNIVERSAL_ROUTER_ADDRESS[chainId]
  if (!universalRouterAddress)
    throw new Error(`Universal Router not deployed on chain ${chainId}`)
  if (!walletClient.account) throw new Error('Wallet client account not found')
  if (!path?.hops?.length) throw new Error('Empty swap path')

  const firstHop = path.hops[0]
  const tokenIn = normalizeCurrency(firstHop.tokenIn)
  const isNativeETH = isNativeEthAddress(firstHop.tokenIn)

  // Permit2 approvals if ERC20 input
  if (!isNativeETH) {
    // Step 1: ERC20 approve Permit2 if needed (unlimited)
    const erc20Allowance = await publicClient.readContract({
      address: tokenIn,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [walletClient.account.address, PERMIT2_ADDRESS],
    })

    if (erc20Allowance < amountIn) {
      const approveTx = await walletClient.writeContract({
        address: tokenIn,
        abi: erc20Abi,
        functionName: 'approve',
        args: [PERMIT2_ADDRESS, maxUint256],
        account: walletClient.account,
        chain: walletClient.chain,
      })
      await publicClient.waitForTransactionReceipt({ hash: approveTx })
    }

    // Step 2: Permit2 approve Universal Router if needed
    // allowance(owner, token, spender) -> (amount, expiration, nonce)
    const [p2Amount, p2Expiration] = await publicClient.readContract({
      address: PERMIT2_ADDRESS,
      abi: permit2Abi,
      functionName: 'allowance',
      args: [walletClient.account.address, tokenIn, universalRouterAddress],
    })

    const currentBlock = await publicClient.getBlock()
    const now = Number(currentBlock.timestamp)

    // Choose an expiration window (30 days)
    const desiredExpiration = now + 30 * 24 * 60 * 60

    const needsPermit2Approve =
      (p2Amount as bigint) < amountIn || Number(p2Expiration) < now + 60 // expiring soon

    if (needsPermit2Approve) {
      // Approve router for max uint160 (common) or just amountIn; max is convenient
      const maxUint160 = BigInt('0xffffffffffffffffffffffffffffffffffffffff') // 2^160-1

      const p2Tx = await walletClient.writeContract({
        address: PERMIT2_ADDRESS,
        abi: permit2Abi,
        functionName: 'approve',
        args: [tokenIn, universalRouterAddress, maxUint160, desiredExpiration],
        account: walletClient.account,
        chain: walletClient.chain,
      })
      await publicClient.waitForTransactionReceipt({ hash: p2Tx })
    }
  }

  // Deadline: short horizon, but not block.timestamp itself (per docs)
  const latestBlock = await publicClient.getBlock()
  const deadline = latestBlock.timestamp + 60n

  const { commands, inputs, value } = buildSwapCalldata({
    path,
    amountIn,
    minAmountOut,
  })

  // Optional simulate
  if (validateTransaction) {
    await publicClient.simulateContract({
      address: universalRouterAddress,
      abi: universalRouterAbi,
      functionName: 'execute',
      args: [commands, inputs, deadline],
      account: walletClient.account,
      value,
    })
  }

  const hash = await walletClient.writeContract({
    address: universalRouterAddress,
    abi: universalRouterAbi,
    functionName: 'execute',
    args: [commands, inputs, deadline],
    account: walletClient.account,
    value,
    chain: walletClient.chain,
  })

  return { hash }
}
