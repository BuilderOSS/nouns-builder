import type {
  CHAIN_ID,
  DecodedArg,
  DecodedTransactionData,
  DecodedValue,
} from '@buildeross/types'
import axios from 'axios'
import {
  Abi,
  type AbiFunction,
  type Address,
  decodeFunctionData,
  type DecodeFunctionDataReturnType,
  getAbiItem,
  getAddress,
  Hex,
  toFunctionSelector,
} from 'viem'

import { BackendFailedError, InvalidRequestError, NotFoundError } from './errors'
import { getImplementationAddress } from './implementationService'
import { getRedisConnection } from './redisConnection'

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY ?? ''
const ETHERSCAN_API_KEY_PARAM = ETHERSCAN_API_KEY ? `&apikey=${ETHERSCAN_API_KEY}` : ''

const getEtherscanABIRedisKey = (chain: string, address: string) =>
  `etherscan:abi:${chain}:${address}`

export type ContractABIResult = {
  abi: string
  address: string
  fetchedAddress: string
  source: 'fetched' | 'cache'
}

type GetContractABIByAddressOptions = {
  skipImplementationCheck?: boolean
}

export const getContractABIByAddress = async (
  chainId: CHAIN_ID,
  addressInput?: string,
  options?: GetContractABIByAddressOptions
): Promise<ContractABIResult> => {
  if (!addressInput) {
    throw new InvalidRequestError('Invalid address')
  }

  const { skipImplementationCheck = false } = options ?? {}

  let address: Address
  try {
    address = getAddress(addressInput)
  } catch {
    throw new InvalidRequestError('Invalid address')
  }

  let fetchedAddress: Address = address

  if (!skipImplementationCheck) {
    const implementationData = await getImplementationAddress(chainId, address)
    fetchedAddress = implementationData.implementation
  }

  const chainIdStr = chainId.toString()

  const redisConnection = getRedisConnection()

  let cache = await redisConnection?.get(
    getEtherscanABIRedisKey(chainIdStr, fetchedAddress)
  )

  if (cache) {
    return {
      abi: JSON.parse(cache).result,
      address,
      fetchedAddress,
      source: 'cache',
    }
  } else {
    const url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getabi&address=${fetchedAddress}&tag=latest${ETHERSCAN_API_KEY_PARAM}`
    const response = await axios.get(url)

    if (response.status !== 200) {
      throw new BackendFailedError('Remote request failed')
    }
    const abi = response.data

    if (abi.status === '1') {
      await redisConnection?.setex(
        getEtherscanABIRedisKey(chainIdStr, fetchedAddress),
        60 * 60 * 24 * 30, // 30 days
        JSON.stringify(abi)
      )
      return {
        abi: abi.result,
        fetchedAddress,
        address,
        source: 'fetched',
      }
    } else {
      throw new NotFoundError('Not verified')
    }
  }
}

const formatArgValue = (input: any, value: any): DecodedValue => {
  if (value === undefined || value === null) return value

  // tuple
  if (input.type === 'tuple' && input.components) {
    return input.components.reduce((acc: any, component: any, i: number) => {
      const key = component.name || i
      const val = Array.isArray(value) ? value[i] : value[key]
      acc[key] = formatArgValue(component, val)
      return acc
    }, {})
  }

  // array
  if (
    (input.type.endsWith('[]') || /\[\d+\]$/.test(input.type)) &&
    Array.isArray(value)
  ) {
    if (input.components) {
      // array of tuples
      return value.map((v: any) =>
        input.components.reduce((acc: any, component: any, i: number) => {
          const key = component.name || i
          const val = Array.isArray(v) ? v[i] : v[key]
          acc[key] = formatArgValue(component, val)
          return acc
        }, {})
      )
    }
    // array of base types
    return value.map((v: any) => v?.toString?.() ?? v)
  }

  // base
  return value?.toString?.() ?? value
}

export const decodeTransaction = async (
  chainId: CHAIN_ID,
  contract: string,
  calldata: string
): Promise<DecodedTransactionData> => {
  let abi: Abi | undefined = undefined
  try {
    const { abi: abiJsonString } = await getContractABIByAddress(chainId, contract, {
      skipImplementationCheck: true,
    })
    abi = JSON.parse(abiJsonString) as Abi
  } catch (error) {
    console.error(`Error fetching ABI for ${contract} without implementation check`)
  }

  const functionSelector = calldata.slice(0, 10)

  const abiHasSig = abi?.some(
    (item) => item.type === 'function' && toFunctionSelector(item) === functionSelector
  )

  if (!abiHasSig) {
    const { abi: implAbiJsonString } = await getContractABIByAddress(chainId, contract, {
      skipImplementationCheck: false,
    })
    abi = JSON.parse(implAbiJsonString) as Abi
  }

  if (!abi) {
    throw new NotFoundError('ABI not found')
  }

  let decodeResult: DecodeFunctionDataReturnType<Abi>
  try {
    decodeResult = decodeFunctionData({ abi, data: calldata as Hex })
  } catch (error) {
    console.error(error)
    throw new InvalidRequestError('Invalid calldata')
  }

  const functionInfo = getAbiItem({
    abi,
    name: functionSelector,
  })

  if (!functionInfo) {
    throw new NotFoundError('Function not found')
  }

  const argMapping: Record<string, DecodedArg> = (
    functionInfo as AbiFunction
  ).inputs.reduce((acc: Record<string, DecodedArg>, input: any, index: number) => {
    const name = input.name || index.toString()
    acc[name] = {
      name,
      type: input.type,
      value: formatArgValue(input, decodeResult.args?.[index]),
    }
    return acc
  }, {})

  return {
    args: argMapping,
    functionName: decodeResult.functionName,
    functionSig: functionSelector,
    encodedData: calldata,
    argOrder: (functionInfo as AbiFunction).inputs.map(
      (input, i) => input.name || i.toString()
    ),
  }
}
