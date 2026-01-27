import {
  type Address,
  decodeAbiParameters,
  encodeAbiParameters,
  getAbiItem,
  type Hex,
} from 'viem'

import type { DiscoveryPoolConfig, PoolConfig } from './shared'

export const poolConfigEncodingABI = [
  {
    type: 'function',
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8' },
      { name: 'currency', internalType: 'address', type: 'address' },
      { name: 'tickLower', internalType: 'int24[]', type: 'int24[]' },
      { name: 'tickUpper', internalType: 'int24[]', type: 'int24[]' },
      {
        name: 'numDiscoveryPositions',
        internalType: 'uint16[]',
        type: 'uint16[]',
      },
      {
        name: 'maxDiscoverySupplyShare',
        internalType: 'uint256[]',
        type: 'uint256[]',
      },
    ],
    name: 'encodeMultiCurvePoolConfig',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'pure',
  },
] as const

export const decodePoolConfig = (data: Hex): PoolConfig => {
  const abiItem = getAbiItem({
    abi: poolConfigEncodingABI,
    name: 'encodeMultiCurvePoolConfig',
  })

  const [
    version,
    currency,
    tickLower,
    tickUpper,
    numDiscoveryPositions,
    maxDiscoverySupplyShare,
  ] = decodeAbiParameters(abiItem.inputs, data)

  return {
    version: version,
    currency: currency as Address,
    tickLower: tickLower as number[],
    tickUpper: tickUpper as number[],
    numDiscoveryPositions: numDiscoveryPositions as number[],
    maxDiscoverySupplyShare: maxDiscoverySupplyShare as bigint[],
  }
}

export const encodePoolConfig = (config: DiscoveryPoolConfig): Hex => {
  const abiItem = getAbiItem({
    abi: poolConfigEncodingABI,
    name: 'encodeMultiCurvePoolConfig',
  })

  return encodeAbiParameters(abiItem.inputs, [
    1, // version
    config.currency,
    config.lowerTicks,
    config.upperTicks,
    config.numDiscoveryPositions,
    config.maxDiscoverySupplyShares,
  ])
}
