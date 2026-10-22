import { ALCHEMY_NETWORKS, getAlchemyServerRpcUrl } from '@buildeross/constants/alchemy'
import {
  auctionAbi,
  governorAbi,
  managerAbi,
  merkleReserveMinterAbi,
  metadataAbi,
  tokenAbi,
  treasuryAbi,
} from '@buildeross/sdk/contract'
import {
  BytesType,
  CHAIN_ID,
  SimulationOutput,
  SimulationResult,
} from '@buildeross/types'
import {
  alchemyServerFetch,
  isAlchemyServerAuthConfigured,
} from '@buildeross/utils/alchemyAuth'
import {
  Abi,
  AbiDecodingZeroDataError,
  Address,
  BaseError,
  ContractFunctionRevertedError,
  ContractFunctionZeroDataError,
  createPublicClient,
  decodeErrorResult,
  formatEther,
  http,
  InsufficientFundsError as ViemInsufficientFundsError,
  IntrinsicGasTooHighError,
  IntrinsicGasTooLowError,
  isAddress,
  parseAbi,
  RpcRequestError,
  type SimulateBlocksReturnType,
} from 'viem'

import { BackendFailedError, InvalidRequestError } from './errors'

export type SimulationRequestBody = {
  tokenAddress: Address
  treasuryAddress: Address
  chainId: CHAIN_ID
  targets: Address[]
  calldatas: BytesType[]
  values: string[]
}

// Custom errors of the Builder protocol contracts and common token standards,
// used to decode revert data of calls made by proposals
const REVERT_ERRORS_ABI: Abi = [
  ...auctionAbi,
  ...governorAbi,
  ...managerAbi,
  ...merkleReserveMinterAbi,
  ...metadataAbi,
  ...tokenAbi,
  ...treasuryAbi,
  ...parseAbi([
    'error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)',
    'error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)',
    'error ERC721NonexistentToken(uint256 tokenId)',
    'error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner)',
    'error ERC721InsufficientApproval(address operator, uint256 tokenId)',
    'error OwnableUnauthorizedAccount(address account)',
  ]),
].filter((item) => item.type === 'error')

const formatDecodedError = (errorName: string, args?: readonly unknown[]) =>
  `${errorName}(${args?.map((arg) => String(arg)).join(', ') ?? ''})`

const getRevertReason = (error: Error | undefined): string => {
  if (!(error instanceof BaseError)) return error?.message || 'Execution reverted'

  if (
    error.walk(
      (e) =>
        e instanceof AbiDecodingZeroDataError ||
        e instanceof ContractFunctionZeroDataError
    )
  ) {
    return 'Execution reverted without a reason'
  }

  const reverted = error.walk((e) => e instanceof ContractFunctionRevertedError)
  if (reverted instanceof ContractFunctionRevertedError) {
    if (reverted.reason) return reverted.reason
    if (reverted.data?.errorName) {
      return formatDecodedError(reverted.data.errorName, reverted.data.args)
    }
    if (reverted.raw) {
      try {
        const decoded = decodeErrorResult({ abi: REVERT_ERRORS_ABI, data: reverted.raw })
        return formatDecodedError(decoded.errorName, decoded.args)
      } catch {
        // unknown custom error
      }
    }
    if (reverted.signature) return `Custom error ${reverted.signature}`
  }

  return error.shortMessage
}

// JSON-RPC codes eth_simulateV1 returns when a single call makes the whole
// request fail (geth internal/ethapi/errors.go). Reverts and VM errors of a call
// come back per call instead; any other code is a request or provider error
const INTRINSIC_GAS_CODE = -38013
const INSUFFICIENT_FUNDS_CODE = -38014
const BLOCK_GAS_LIMIT_CODE = -38015
const MAX_INIT_CODE_SIZE_CODE = -38025

// Bounds the extra simulations used to find the calls that fail the whole request
const MAX_FAILED_CALLS = 5
const MAX_SIMULATION_REQUESTS = 16
const SIMULATION_TIME_BUDGET_MS = 20_000

type CallError =
  | { kind: 'insufficient-funds' }
  | { kind: 'block-gas-limit' }
  | { kind: 'other'; reason: string }

type SimulationRun =
  | { block: SimulateBlocksReturnType[number]; callError?: undefined }
  | { block?: undefined; callError: CallError }

const isInsufficientFundsError = (error: unknown): boolean => {
  if (
    error instanceof BaseError &&
    error.walk((e) => e instanceof ViemInsufficientFundsError)
  ) {
    return true
  }
  return error instanceof Error && /insufficient funds/i.test(error.message)
}

// Returns the error of the call that failed the whole simulation request, or
// undefined when the request failed for any other reason
const getCallError = (error: unknown): CallError | undefined => {
  const rpcError =
    error instanceof BaseError
      ? (error.walk((e) => e instanceof RpcRequestError) as RpcRequestError | null)
      : null

  if (rpcError?.code === INSUFFICIENT_FUNDS_CODE || isInsufficientFundsError(error)) {
    return { kind: 'insufficient-funds' }
  }
  if (rpcError?.code === BLOCK_GAS_LIMIT_CODE) return { kind: 'block-gas-limit' }
  if (!(error instanceof BaseError)) return undefined
  if (
    rpcError?.code === INTRINSIC_GAS_CODE ||
    rpcError?.code === MAX_INIT_CODE_SIZE_CODE ||
    error.walk(
      (e) => e instanceof IntrinsicGasTooLowError || e instanceof IntrinsicGasTooHighError
    )
  ) {
    return { kind: 'other', reason: rpcError?.details || error.shortMessage }
  }
  return undefined
}

const simulateTransaction = async ({
  chainId,
  treasuryAddress,
  targets,
  calldatas,
  values,
}: Omit<SimulationRequestBody, 'tokenAddress'>): Promise<SimulationOutput[]> => {
  if (!ALCHEMY_NETWORKS[chainId]) {
    throw new InvalidRequestError(`Chain ${chainId} is not supported for simulation`)
  }
  const rpcUrl = getAlchemyServerRpcUrl(chainId)
  if (!rpcUrl || !isAlchemyServerAuthConfigured()) {
    throw new BackendFailedError('Alchemy is not configured for simulation')
  }

  const client = createPublicClient({
    transport: http(rpcUrl, { fetchFn: alchemyServerFetch }),
  })

  const calls = targets.map((target, index) => ({
    account: treasuryAddress,
    to: target,
    data: calldatas[index],
    value: BigInt(values[index]),
  }))

  const deadline = Date.now() + SIMULATION_TIME_BUDGET_MS
  let requestCount = 0
  const hasBudget = () => requestCount < MAX_SIMULATION_REQUESTS && Date.now() < deadline

  // eth_simulateV1 executes the calls sequentially in one block, so each call
  // sees the state changes of the calls before it (like the proposal execution)
  const run = async (indices: number[]): Promise<SimulationRun> => {
    requestCount++
    try {
      const [block] = await client.simulateBlocks({
        blocks: [{ calls: indices.map((index) => calls[index]) }],
        validation: false,
      })
      return { block }
    } catch (error) {
      const callError = getCallError(error)
      if (!callError) {
        const message = error instanceof Error ? error.message : String(error)
        throw new BackendFailedError(message)
      }
      return { callError }
    }
  }

  // The request fails at the first call that can't be executed, so when a
  // prefix of the calls fails, every longer prefix fails too. Binary search for
  // the shortest failing prefix; its last call is the failing one
  const findFailingPosition = async (indices: number[]) => {
    let passing = 0
    let failing = indices.length
    while (failing - passing > 1) {
      if (!hasBudget()) return undefined
      const middle = Math.floor((passing + failing) / 2)
      const probe = await run(indices.slice(0, middle))
      if (probe.block) passing = middle
      else failing = middle
    }
    return failing - 1
  }

  let treasuryBalance: Promise<bigint | undefined> | undefined
  const describeCallError = async (callError: CallError, index: number) => {
    if (callError.kind === 'block-gas-limit') {
      return 'Proposal exceeds the block gas limit at this call'
    }
    if (callError.kind === 'other') return callError.reason

    treasuryBalance ??= client
      .getBalance({ address: treasuryAddress })
      .catch(() => undefined)
    const balance = await treasuryBalance
    const sends = `sends ${formatEther(BigInt(values[index]))} ETH`
    return balance === undefined
      ? `Treasury doesn't have enough ETH for this call (${sends})`
      : `Treasury doesn't have enough ETH for this call (${sends}; treasury balance before the proposal: ${formatEther(balance)} ETH)`
  }

  // A call that fails the whole request is reported and left out, and the
  // remaining calls are simulated again without it. Calls after it then run
  // without its state changes, which is what happens to them if it can't run
  let active = targets.map((_, index) => index)
  const failedCalls = new Map<number, string>()
  const skippedCalls = new Map<number, string>()
  const skip = (indices: number[], reason: string) =>
    indices.forEach((index) => skippedCalls.set(index, reason))

  let finalBlock: SimulationRun['block']
  while (active.length > 0) {
    if (!hasBudget()) {
      skip(active, 'The simulation budget ran out before this call')
      break
    }
    const result = await run(active)
    if (result.block) {
      finalBlock = result.block
      break
    }
    if (failedCalls.size >= MAX_FAILED_CALLS) {
      skip(active, 'Too many earlier calls failed')
      break
    }

    const position = await findFailingPosition(active)
    if (position === undefined) {
      skip(active, 'The simulation budget ran out before this call')
      break
    }
    failedCalls.set(
      active[position],
      await describeCallError(result.callError, active[position])
    )

    if (result.callError.kind === 'block-gas-limit') {
      // Gas runs out because of all the calls before this one, so every later
      // call would hit the limit too
      skip(
        active.slice(position + 1),
        'The proposal exceeds the block gas limit at an earlier call'
      )
      active = active.slice(0, position)
    } else {
      active = active.filter((_, activePosition) => activePosition !== position)
    }
  }

  const blockNumber = Number(finalBlock?.number ?? 0n)
  const results = new Map(
    (finalBlock?.calls ?? []).map((call, position) => [active[position], call])
  )

  return targets.map((target, index) => {
    const base = {
      index,
      block_number: blockNumber,
      from: treasuryAddress,
      to: target,
      input: calldatas[index],
      value: values[index].toString(),
    }
    const call = results.get(index)
    if (call) {
      return {
        ...base,
        status: call.status === 'success',
        gas_used: Number(call.gasUsed),
        ...(call.status === 'failure' ? { error: getRevertReason(call.error) } : {}),
      }
    }
    const failure = failedCalls.get(index)
    if (failure !== undefined) {
      return { ...base, status: false, gas_used: 0, error: failure }
    }
    return {
      ...base,
      status: false,
      gas_used: 0,
      notSimulated: true as const,
      error: skippedCalls.get(index),
    }
  })
}

export async function simulate({
  tokenAddress: _tokenAddress, // Used by auth middleware, not needed in simulation
  treasuryAddress,
  chainId,
  targets,
  calldatas,
  values,
}: SimulationRequestBody): Promise<SimulationResult> {
  // Validate inputs
  if (targets?.length !== calldatas?.length || targets?.length !== values?.length) {
    throw new InvalidRequestError('Array length mismatch')
  }
  if (!isAddress(treasuryAddress)) {
    throw new InvalidRequestError('Invalid treasury address')
  }
  const invalidAddresses = targets.filter((target) => !isAddress(target))
  if (invalidAddresses.length > 0) {
    throw new InvalidRequestError(
      `Invalid target addresses: [${invalidAddresses.join(',')}]`
    )
  }

  const simulations = await simulateTransaction({
    chainId,
    treasuryAddress,
    targets,
    calldatas,
    values,
  })

  const simulationSucceeded = simulations.every((s) => s.status)
  const totalGasUsed = simulations.reduce((total, s) => total + (s.gas_used ?? 0), 0)

  return {
    simulations,
    success: simulationSucceeded,
    totalGasUsed: totalGasUsed.toString(),
    error: null,
  }
}
