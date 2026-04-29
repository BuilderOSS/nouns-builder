import { useNftMetadata } from '@buildeross/hooks/useNftMetadata'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { CHAIN_ID, DecodedTransactionData } from '@buildeross/types'
import {
  decodeEscrowData,
  decodeEscrowDataLegacy,
  getEscrowBundlerLegacy,
} from '@buildeross/utils/escrow'
import {
  getSablierContracts,
  parseStreamDataConfigDurations,
  parseStreamDataConfigDurationsLD,
  parseStreamDataConfigTimestamps,
  parseStreamDataConfigTimestampsLD,
  type StreamConfig,
} from '@buildeross/utils/sablier'
import React from 'react'

const getParserFromFunctionName = (
  functionName: string
): ((_data: any) => StreamConfig) | null => {
  if (functionName === 'createWithDurationsLL') return parseStreamDataConfigDurations
  if (functionName === 'createWithTimestampsLL') return parseStreamDataConfigTimestamps
  if (functionName === 'createWithDurationsLD') return parseStreamDataConfigDurationsLD
  if (functionName === 'createWithTimestampsLD') return parseStreamDataConfigTimestampsLD
  return null
}

export const useDecodedTransactionContext = ({
  chainId,
  transaction,
  target,
  value,
  enabled = true,
}: {
  chainId: CHAIN_ID
  transaction: DecodedTransactionData
  target: `0x${string}`
  value: string
  enabled?: boolean
}) => {
  const sortedArgs = React.useMemo(() => {
    if (!enabled) return []
    const keys = Object.keys(transaction.args)
    const inOrder = (transaction.argOrder as string[]).filter((key) => keys.includes(key))
    const rest = keys.filter((key) => !inOrder.includes(key)).sort()
    return [...inOrder, ...rest]
  }, [enabled, transaction.args, transaction.argOrder])

  const escrowData = React.useMemo(() => {
    if (!enabled) return null
    const arg = transaction.args['_escrowData']
    const raw = arg?.value
    if (!raw || typeof raw !== 'string' || !raw.startsWith('0x')) return null

    let legacy: `0x${string}` | undefined
    try {
      legacy = getEscrowBundlerLegacy(chainId)
    } catch (_error) {
      legacy = undefined
    }

    const decoder =
      legacy && target.toLowerCase() === legacy.toLowerCase()
        ? decodeEscrowDataLegacy
        : decodeEscrowData

    try {
      return decoder(raw as `0x${string}`)
    } catch (error) {
      console.warn('Failed to decode escrow data', error)
      return null
    }
  }, [enabled, transaction.args, target, chainId])

  const streamData = React.useMemo(() => {
    if (!enabled) return undefined
    const sablierContracts = getSablierContracts(chainId)
    const isSablierTarget =
      (sablierContracts.batchLockup &&
        target.toLowerCase() === sablierContracts.batchLockup.toLowerCase()) ||
      (sablierContracts.lockup &&
        target.toLowerCase() === sablierContracts.lockup.toLowerCase())

    if (!isSablierTarget) return undefined

    if (
      transaction.functionName !== 'createWithDurationsLL' &&
      transaction.functionName !== 'createWithTimestampsLL' &&
      transaction.functionName !== 'createWithDurationsLD' &&
      transaction.functionName !== 'createWithTimestampsLD'
    ) {
      return undefined
    }

    try {
      const lockupArg = transaction.args['lockup'] || transaction.args['_lockup']
      const tokenArg = transaction.args['token'] || transaction.args['_token']
      const batchArg = transaction.args['batch'] || transaction.args['_batch']

      if (!lockupArg || !tokenArg || !batchArg) return undefined

      const isDurationsMode =
        transaction.functionName === 'createWithDurationsLL' ||
        transaction.functionName === 'createWithDurationsLD'

      const parser = getParserFromFunctionName(transaction.functionName)
      if (!parser) return undefined

      const streams = (Array.isArray(batchArg.value) ? batchArg.value : []).map(parser)

      return {
        lockupAddress: lockupArg.value as `0x${string}`,
        tokenAddress: tokenArg.value as `0x${string}`,
        streams,
        isDurationsMode,
      }
    } catch (error) {
      console.warn('Failed to extract stream data', error)
      return undefined
    }
  }, [enabled, transaction.args, transaction.functionName, target, chainId])

  const tokenAddress: `0x${string}` | undefined = React.useMemo(() => {
    if (!enabled) return undefined
    if (
      transaction.functionName === 'transfer' ||
      transaction.functionName === 'approve' ||
      transaction.functionName === 'increaseAllowance' ||
      transaction.functionName === 'decreaseAllowance'
    ) {
      return target
    }

    if (streamData?.tokenAddress) return streamData.tokenAddress
    if (escrowData?.tokenAddress) return escrowData.tokenAddress
    return undefined
  }, [enabled, transaction.functionName, target, escrowData, streamData])

  const nftInfo = React.useMemo(() => {
    if (!enabled) return null
    if (transaction.functionName !== 'safeTransferFrom') return null

    for (const argKey of sortedArgs) {
      const arg = transaction.args[argKey]
      if (
        arg.name === 'tokenId' ||
        arg.name === 'id' ||
        arg.name === '_tokenId' ||
        arg.name === '_id'
      ) {
        return { contract: target, tokenId: arg.value as string }
      }
    }

    return null
  }, [enabled, transaction.args, transaction.functionName, target, sortedArgs])

  const { tokenMetadata, isLoading: isTokenLoading } = useTokenMetadataSingle(
    chainId,
    enabled ? tokenAddress : undefined
  )

  const { metadata: nftMetadata, isLoading: isNftLoading } = useNftMetadata(
    chainId,
    enabled ? (nftInfo?.contract as `0x${string}` | undefined) : undefined,
    enabled ? nftInfo?.tokenId : undefined
  )

  const isLoadingMetadata = Boolean(
    (!!tokenAddress && isTokenLoading) || (!!nftInfo && isNftLoading)
  )

  const isSendWithValue =
    enabled &&
    transaction.functionName === 'send' &&
    sortedArgs.length === 1 &&
    sortedArgs[0] === 'value' &&
    value === transaction.args['value'].value

  return {
    sortedArgs,
    escrowData,
    streamData,
    tokenMetadata,
    nftMetadata,
    isLoadingMetadata,
    isSendWithValue,
  }
}
