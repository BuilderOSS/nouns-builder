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

import { universalRouterAbi } from './abis/universalRouter'
import {
  Actions,
  ADDRESS_THIS,
  Commands,
  MSG_SENDER,
  OPEN_DELTA,
} from './constants/v4Router'
import { PoolKey, SignatureWithPermit, SwapPath } from './types'
import { createPermit2Signature } from './utils/createPermit2Signature'
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
 * Optional permit2 signature for gasless ERC20 approvals
 */
export function buildSwapCalldata({
  chainId,
  path,
  amountIn,
  minAmountOut,
  permit2Signature,
}: {
  chainId: CHAIN_ID
  path: SwapPath
  amountIn: bigint
  minAmountOut: bigint
  permit2Signature?: SignatureWithPermit
}): { commands: Hex; inputs: Hex[]; value: bigint } {
  if (!path?.hops?.length) throw new Error('Empty swap path')

  const firstHop = path.hops[0]
  const lastHop = path.hops[path.hops.length - 1]

  const isInputEth = isNativeEthAddress(firstHop.tokenIn)
  const isOutputEth = isNativeEthAddress(lastHop.tokenOut)

  const commandList: number[] = []
  const inputList: Hex[] = []
  let value = 0n

  // Step 1: Add PERMIT2_PERMIT if signature provided
  if (permit2Signature) {
    commandList.push(Commands.PERMIT2_PERMIT)
    inputList.push(encodePermit2Single(permit2Signature))
  }

  // Step 2: Add WRAP_ETH if input is ETH
  if (isInputEth) {
    commandList.push(Commands.WRAP_ETH)
    inputList.push(
      encodeAbiParameters(
        [{ type: 'address' }, { type: 'uint256' }],
        [ADDRESS_THIS, amountIn]
      )
    )
    value = amountIn
  }

  // Step 3: Add V4_SWAP
  commandList.push(Commands.V4_SWAP)
  const swapInput =
    path.hops.length === 1
      ? buildSingleHopSwapInput(
          chainId,
          path,
          amountIn,
          minAmountOut,
          isInputEth,
          isOutputEth
        )
      : buildMultiHopSwapInput(
          chainId,
          path,
          amountIn,
          minAmountOut,
          isInputEth,
          isOutputEth
        )
  inputList.push(swapInput)

  // Step 4: Add UNWRAP_WETH if output is ETH
  if (isOutputEth) {
    commandList.push(Commands.UNWRAP_WETH)
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

  return { commands, inputs: inputList, value }
}

/**
 * Encode Permit2 PermitSingle input for Universal Router
 */
function encodePermit2Single(permit2Signature: SignatureWithPermit): Hex {
  return encodeAbiParameters(
    [
      {
        components: [
          {
            components: [
              { name: 'token', type: 'address' },
              { name: 'amount', type: 'uint160' },
              { name: 'expiration', type: 'uint48' },
              { name: 'nonce', type: 'uint48' },
            ],
            name: 'details',
            type: 'tuple',
          },
          { name: 'spender', type: 'address' },
          { name: 'sigDeadline', type: 'uint256' },
        ],
        name: 'permitSingle',
        type: 'tuple',
      },
      { name: 'signature', type: 'bytes' },
    ],
    [
      {
        details: {
          token: permit2Signature.permit.details.token,
          amount: permit2Signature.permit.details.amount,
          expiration: permit2Signature.permit.details.expiration,
          nonce: permit2Signature.permit.details.nonce,
        },
        spender: permit2Signature.permit.spender,
        sigDeadline: permit2Signature.permit.sigDeadline,
      },
      permit2Signature.signature,
    ]
  )
}

/**
 * Build single-hop swap input for V4_SWAP command
 */
function buildSingleHopSwapInput(
  chainId: CHAIN_ID,
  path: SwapPath,
  amountIn: bigint,
  minAmountOut: bigint,
  isInputEth: boolean,
  isOutputEth: boolean
): Hex {
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

  return encodeAbiParameters([{ type: 'bytes' }, { type: 'bytes[]' }], [actions, params])
}

/**
 * Build multi-hop swap input for V4_SWAP command
 */
function buildMultiHopSwapInput(
  chainId: CHAIN_ID,
  path: SwapPath,
  amountIn: bigint,
  minAmountOut: bigint,
  isInputEth: boolean,
  isOutputEth: boolean
): Hex {
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

  return encodeAbiParameters([{ type: 'bytes' }, { type: 'bytes[]' }], [actions, params])
}

/**
 * Execute a swap using Uniswap V4 Universal Router
 *
 * This version uses Permit2 signatures for gasless approvals:
 * 1) ERC20 approve Permit2 (unlimited, one-time)
 * 2) Create PermitSingle signature (off-chain, 5 minute deadline)
 * 3) Execute swap with PERMIT2_PERMIT + V4_SWAP commands
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

  let permit2Signature: SignatureWithPermit | undefined

  // Permit2 signature if ERC20 input
  if (!isNativeETH) {
    // Step 1: ERC20 approve Permit2 if needed (unlimited, one-time)
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

    // Step 2: Create Permit2 signature (off-chain, 5 minute deadline)
    permit2Signature = await createPermit2Signature({
      chainId,
      token: tokenIn,
      spender: universalRouterAddress,
      amount: amountIn,
      walletClient,
      publicClient,
    })
  }

  // Deadline: short horizon, but not block.timestamp itself (per docs)
  const latestBlock = await publicClient.getBlock()
  const deadline = latestBlock.timestamp + 60n

  const { commands, inputs, value } = buildSwapCalldata({
    chainId,
    path,
    amountIn,
    minAmountOut,
    permit2Signature,
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
