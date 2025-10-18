import type {
  CHAIN_ID,
  DecodedArg,
  DecodedTransactionData,
  DecodedValue,
} from '@buildeross/types'
import axios from 'axios'
import {
  type AbiFunction,
  type Address,
  decodeFunctionData,
  type DecodeFunctionDataReturnType,
  getAbiItem,
  getAddress,
  Hex,
} from 'viem'

import { BackendFailedError, InvalidRequestError, NotFoundError } from './errors'
import { getImplementationAddress } from './implementationService'
import { getRedisConnection } from './redisConnection'

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

const getEtherscanABIRedisKey = (chain: string, address: string) =>
  `etherscan:abi:${chain}:${address}`

export type ContractABIResult = {
  abi: string
  address: string
  fetchedAddress: string
  source: 'fetched' | 'cache'
}

export const getContractABIByAddress = async (
  chainId: CHAIN_ID,
  addressInput?: string
): Promise<ContractABIResult> => {
  if (!addressInput) {
    throw new InvalidRequestError('Invalid address')
  }

  let address: Address
  try {
    address = getAddress(addressInput)
  } catch {
    throw new InvalidRequestError('Invalid address')
  }

  const { implementation: fetchedAddress } = await getImplementationAddress(
    chainId,
    address
  )

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
    const etherscan = await axios.get(
      `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getabi&address=${fetchedAddress}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
    )

    if (etherscan.status !== 200) {
      throw new BackendFailedError('Remote request failed')
    }
    const abi = etherscan.data

    if (abi.status === '1') {
      await redisConnection?.setex(
        getEtherscanABIRedisKey(chainIdStr, fetchedAddress),
        60 * 60 * 24, // 24 hours
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

export const decodeTransaction = async (
  chainId: CHAIN_ID,
  contract: string,
  calldata: string
): Promise<DecodedTransactionData> => {
  const { abi: abiJsonString } = await getContractABIByAddress(chainId, contract)

  const abi = JSON.parse(abiJsonString)

  let decodeResult: DecodeFunctionDataReturnType<typeof abi>
  try {
    decodeResult = decodeFunctionData({ abi, data: calldata as Hex })
  } catch (error) {
    console.error(error)
    throw new InvalidRequestError('Invalid calldata')
  }

  const functionSig = calldata.slice(0, 10)

  const functionInfo = getAbiItem({
    abi,
    name: functionSig,
  })

  const formatArgValue = (input: any, value: any): DecodedValue => {
    if (input.type === 'tuple') {
      return input.components.reduce((acc: any, component: any, i: number) => {
        acc[component.name || i] = formatArgValue(component, value[component.name || i])
        return acc
      }, {})
    }

    if (input.type.endsWith('[]') && Array.isArray(value)) {
      if (input.components) {
        // Array of tuples
        return value.map((v: any) =>
          input.components.reduce((acc: any, component: any, i: number) => {
            acc[component.name || i] = formatArgValue(component, v[component.name || i])
            return acc
          }, {})
        )
      }
      // Array of base types
      return value.map((v: any) => v?.toString?.() ?? v)
    }

    // Base type
    return value?.toString?.() ?? value
  }

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
      value: formatArgValue(input, decodeResult.args[index]),
    }
    return acc
  }, {})

  return {
    args: argMapping,
    functionName: decodeResult.functionName,
    functionSig,
    encodedData: calldata,
  }
}
