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
  http,
  InsufficientFundsError as ViemInsufficientFundsError,
  isAddress,
  parseAbi,
} from 'viem'

import { BackendFailedError, InsufficientFundsError, InvalidRequestError } from './errors'

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

const isInsufficientFundsError = (error: unknown): boolean => {
  if (
    error instanceof BaseError &&
    error.walk((e) => e instanceof ViemInsufficientFundsError)
  ) {
    return true
  }
  return error instanceof Error && /insufficient funds/i.test(error.message)
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

  // eth_simulateV1 executes the calls sequentially in one block, so each call
  // sees the state changes of the calls before it (like the proposal execution)
  try {
    const [block] = await client.simulateBlocks({
      blocks: [
        {
          calls: targets.map((target, index) => ({
            account: treasuryAddress,
            to: target,
            data: calldatas[index],
            value: BigInt(values[index]),
          })),
        },
      ],
      validation: false,
    })

    return block.calls.map((call, index) => ({
      index,
      status: call.status === 'success',
      gas_used: Number(call.gasUsed),
      block_number: Number(block.number),
      from: treasuryAddress,
      to: targets[index],
      input: calldatas[index],
      value: values[index].toString(),
      ...(call.status === 'failure' ? { error: getRevertReason(call.error) } : {}),
    }))
  } catch (error) {
    if (isInsufficientFundsError(error)) {
      throw new InsufficientFundsError(
        'Insufficient treasury funds to carry out some or all of these transactions'
      )
    }
    const message = error instanceof Error ? error.message : String(error)
    throw new BackendFailedError(message)
  }
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
