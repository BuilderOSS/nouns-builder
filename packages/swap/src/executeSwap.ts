import {
  PERMIT2_ADDRESS,
  UNISWAP_UNIVERSAL_ROUTER_ADDRESS,
} from '@buildeross/constants/addresses'
import { CHAIN_ID } from '@buildeross/types'
import {
  Address,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  erc20Abi,
  Hex,
  maxUint256,
  PublicClient,
  WalletClient,
} from 'viem'

import { permit2Abi } from './abis/permit2'
import { universalRouterAbi } from './abis/universalRouter'
import {
  Actions,
  ADDRESS_THIS,
  Commands,
  MSG_SENDER,
  OPEN_DELTA,
} from './constants/v4Router'
import { PoolKey } from './getQuoteFromUniswap'
import { SwapPath } from './types'
import {
  isNativeEthAddress,
  normalizeCurrency,
  normalizeForPoolKey,
  sortCurrenciesForPoolKey,
} from './utils/normalizeAddresses'

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
 * ETH wrapping/unwrapping handled by Universal Router WRAP_ETH/UNWRAP_WETH commands
 */
export function buildSwapCalldata({
  chainId,
  path,
  amountIn,
  minAmountOut,
}: {
  chainId: CHAIN_ID
  path: SwapPath
  amountIn: bigint
  minAmountOut: bigint
}): { commands: Hex; inputs: Hex[]; value: bigint } {
  if (!path?.hops?.length) throw new Error('Empty swap path')

  const firstHop = path.hops[0]
  const lastHop = path.hops[path.hops.length - 1]

  const isInputEth = isNativeEthAddress(firstHop.tokenIn)
  const isOutputEth = isNativeEthAddress(lastHop.tokenOut)

  // Build the core swap
  const swapResult =
    path.hops.length === 1
      ? buildSingleHopSwap(chainId, path, amountIn, minAmountOut, isInputEth, isOutputEth)
      : buildMultiHopSwap(chainId, path, amountIn, minAmountOut, isInputEth, isOutputEth)

  // If no ETH involved, return as-is
  if (!isInputEth && !isOutputEth) {
    return swapResult
  }

  // Add WRAP_ETH and/or UNWRAP_WETH commands as needed
  return addWrapUnwrapCommands({
    swapResult,
    isInputEth,
    isOutputEth,
    amountIn,
    minAmountOut,
  })
}

/**
 * Add WRAP_ETH and/or UNWRAP_WETH commands around the swap
 */
function addWrapUnwrapCommands({
  swapResult,
  isInputEth,
  isOutputEth,
  amountIn,
  minAmountOut,
}: {
  swapResult: { commands: Hex; inputs: Hex[]; value: bigint }
  isInputEth: boolean
  isOutputEth: boolean
  amountIn: bigint
  minAmountOut: bigint
}): { commands: Hex; inputs: Hex[]; value: bigint } {
  const commandList: number[] = []
  const inputList: Hex[] = []

  // Step 1: WRAP_ETH if input is ETH
  if (isInputEth) {
    commandList.push(Commands.WRAP_ETH)
    // WRAP_ETH takes (recipient, amountMin)
    // recipient: address(2) = ROUTER (the universal router itself)
    inputList.push(
      encodeAbiParameters(
        [{ type: 'address' }, { type: 'uint256' }],
        [ADDRESS_THIS, amountIn]
      )
    )
  }

  // Step 2: V4_SWAP (the swap commands/inputs from buildSingleHopSwap or buildMultiHopSwap)
  // Extract command byte from swapResult.commands (it's a single byte packed)
  const swapCommand = Number(`0x${swapResult.commands.slice(2)}`)
  commandList.push(swapCommand)
  inputList.push(...swapResult.inputs)

  // Step 3: UNWRAP_WETH if output is ETH
  if (isOutputEth) {
    commandList.push(Commands.UNWRAP_WETH)
    // UNWRAP_WETH takes (recipient, amountMin)
    // recipient: address(1) = MSG_SENDER (the user)
    // amountMin: minimum WETH to unwrap (TAKE keeps WETH in router with receiverIsUser=false)
    inputList.push(
      encodeAbiParameters(
        [{ type: 'address' }, { type: 'uint256' }],
        [MSG_SENDER, minAmountOut]
      )
    )
  }

  // Encode all commands as a packed byte array
  const commands = encodePacked(
    Array(commandList.length).fill('uint8') as ['uint8', ...Array<'uint8'>],
    commandList as [number, ...Array<number>]
  )

  // Value: send ETH only if input is ETH
  const value = isInputEth ? amountIn : 0n

  return { commands, inputs: inputList, value }
}

/**
 * Build single-hop swap calldata (matches Uniswap v4 quickstart)
 */
function buildSingleHopSwap(
  chainId: CHAIN_ID,
  path: SwapPath,
  amountIn: bigint,
  minAmountOut: bigint,
  isInputEth: boolean,
  isOutputEth: boolean
): { commands: Hex; inputs: Hex[]; value: bigint } {
  const hop = path.hops[0]

  if (!hop.fee || hop.tickSpacing == null || !hop.hooks) {
    throw new Error('Missing required pool parameters (fee/tickSpacing/hooks)')
  }

  // For PoolKey: use WETH addresses (pools use WETH)
  const poolKeyTokenIn = normalizeForPoolKey(hop.tokenIn, chainId)
  // const poolKeyTokenOut = normalizeForPoolKey(hop.tokenOut, chainId)
  const [currency0, currency1] = sortCurrenciesForPoolKey(
    hop.tokenIn,
    hop.tokenOut,
    chainId
  )

  const poolKey: PoolKey = {
    currency0,
    currency1,
    fee: toUint24(hop.fee),
    tickSpacing: hop.tickSpacing,
    hooks: hop.hooks,
  }

  // Determine zeroForOne based on poolKey tokens (WETH)
  const zeroForOne = poolKeyTokenIn.toLowerCase() === poolKey.currency0.toLowerCase()

  const settleCurrency = zeroForOne ? poolKey.currency0 : poolKey.currency1
  const takeCurrency = zeroForOne ? poolKey.currency1 : poolKey.currency0

  // Encode actions
  const actions = encodePacked(
    ['uint8', 'uint8', 'uint8'],
    [Actions.SWAP_EXACT_IN_SINGLE, Actions.SETTLE, Actions.TAKE]
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

  // 2) SETTLE(currency, amount, payerIsUser)
  // payerIsUser: false when using wrapped ETH from router or true when using WETH input
  params.push(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'uint256' }, { type: 'bool' }],
      [settleCurrency, amountIn, isInputEth ? false : true]
    )
  )

  // 3) TAKE
  // TAKE(currency, recipient, amount)
  // recipient: address(2) = ROUTER to keep WETH for unwrapping or MSG_SENDER for WETH output
  const recipient = isOutputEth ? ADDRESS_THIS : MSG_SENDER
  params.push(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'address' }, { type: 'uint256' }],
      [takeCurrency, recipient, OPEN_DELTA]
    )
  )

  const inputs = [
    encodeAbiParameters([{ type: 'bytes' }, { type: 'bytes[]' }], [actions, params]),
  ]

  const commands = encodePacked(['uint8'], [Commands.V4_SWAP])

  // No value here - wrapping is handled by Universal Router WRAP_ETH command
  const value = 0n

  return { commands, inputs, value }
}

/**
 * Build multi-hop swap calldata (Exact In)
 */
function buildMultiHopSwap(
  chainId: CHAIN_ID,
  path: SwapPath,
  amountIn: bigint,
  minAmountOut: bigint,
  isInputEth: boolean,
  isOutputEth: boolean
): { commands: Hex; inputs: Hex[]; value: bigint } {
  const firstHop = path.hops[0]
  const lastHop = path.hops[path.hops.length - 1]

  // For PathKey currencies: use WETH (pools use WETH, not address(0))
  const currencyIn = normalizeForPoolKey(firstHop.tokenIn, chainId)
  const currencyOut = normalizeForPoolKey(lastHop.tokenOut, chainId)

  // Build PathKey[]: one entry per hop, each describing the *next* currency and pool params.
  const pathKeys: PathKey[] = path.hops.map((hop, i) => {
    if (!hop.fee || hop.tickSpacing == null || !hop.hooks) {
      throw new Error(
        `Missing required pool parameters for hop ${i} (fee/tickSpacing/hooks)`
      )
    }

    return {
      intermediateCurrency: normalizeForPoolKey(hop.tokenOut, chainId),
      fee: toUint24(hop.fee),
      tickSpacing: hop.tickSpacing,
      hooks: hop.hooks,
      hookData: '0x',
    }
  })

  const actions = encodePacked(
    ['uint8', 'uint8', 'uint8'],
    [Actions.SWAP_EXACT_IN, Actions.SETTLE, Actions.TAKE]
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

  // 2) SETTLE
  const payerIsUser = isInputEth ? false : true
  params.push(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'uint256' }, { type: 'bool' }],
      [currencyIn, amountIn, payerIsUser]
    )
  )

  // 3) TAKE
  const recipient = isOutputEth ? ADDRESS_THIS : MSG_SENDER
  params.push(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'address' }, { type: 'uint256' }],
      [currencyOut, recipient, OPEN_DELTA]
    )
  )

  const inputs = [
    encodeAbiParameters([{ type: 'bytes' }, { type: 'bytes[]' }], [actions, params]),
  ]

  const commands = encodePacked(['uint8'], [Commands.V4_SWAP])

  // No value here - wrapping is handled by Universal Router WRAP_ETH command
  const value = 0n
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
    chainId,
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

  const encodedData = encodeFunctionData({
    abi: universalRouterAbi,
    functionName: 'execute',
    args: [commands, inputs, deadline],
  })

  const gas = await publicClient.estimateGas({
    account: walletClient.account,
    to: universalRouterAddress,
    data: encodedData,
    value,
  })

  const hash = await walletClient.writeContract({
    address: universalRouterAddress,
    abi: universalRouterAbi,
    functionName: 'execute',
    args: [commands, inputs, deadline],
    account: walletClient.account,
    value,
    chain: walletClient.chain,
    gas: (gas * 3n) / 2n, // add extra gas for safety
    // gas: 1_500_000n,
  })

  return { hash }
}
