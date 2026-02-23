import {
  CLANKER_FACTORY_ADDRESS,
  ZORA_COIN_FACTORY_ADDRESS,
} from '@buildeross/constants/addresses'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { clankerFactoryAbi } from '@buildeross/sdk/contract'
import type { Proposal } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import { coinFactoryConfig } from '@zoralabs/protocol-deployments'
import toLower from 'lodash/toLower'
import { useMemo } from 'react'
import useSWR from 'swr'
import { decodeEventLog, decodeFunctionData, Hex, isHex } from 'viem'

export type CoinStaticData = {
  name: string
  symbol: string
  metadataUri?: string | undefined
  imageUrl?: string | undefined
  description?: string | undefined
  isContentCoin: boolean // true for Zora Content Coin, false for Clanker Creator Coin
}

export type CoinInstanceData = CoinStaticData & {
  address: AddressType | undefined
}

export type CoinDataResult = {
  isCreateTx: boolean
  coins: CoinInstanceData[]
  isLoading: boolean
  isValidating: boolean
}

/**
 * Hook to extract coin creation data from proposal transactions
 * Handles both Content Coins (Zora) and Creator Coins (Clanker)
 */
export const useCoinData = (chainId: CHAIN_ID, proposal: Proposal): CoinDataResult => {
  const zoraCoinFactory = ZORA_COIN_FACTORY_ADDRESS
  const clankerFactory = CLANKER_FACTORY_ADDRESS

  // Find all coin transaction indices in proposal
  const coinTransactionIndices = useMemo(() => {
    if (!proposal.targets) return []

    const indices: { index: number; isContentCoin: boolean }[] = []
    proposal.targets.forEach((target, index) => {
      const targetLower = toLower(target)

      // Check if it's a Zora Content Coin
      if (zoraCoinFactory && targetLower === toLower(zoraCoinFactory)) {
        indices.push({ index, isContentCoin: true })
      }
      // Check if it's a Clanker Creator Coin
      else if (clankerFactory && targetLower === toLower(clankerFactory)) {
        indices.push({ index, isContentCoin: false })
      }
    })

    return indices
  }, [proposal.targets, zoraCoinFactory, clankerFactory])

  // Extract static coin data from calldatas
  // Store with transaction index for unique key generation
  const coinsStaticDataWithIndex = useMemo((): Array<
    CoinStaticData & { transactionIndex: number }
  > => {
    if (coinTransactionIndices.length === 0 || !proposal.calldatas) return []

    const results: Array<CoinStaticData & { transactionIndex: number }> = []

    for (const { index, isContentCoin } of coinTransactionIndices) {
      const calldata = proposal.calldatas?.[index]
      if (!calldata) continue

      try {
        if (isContentCoin) {
          // Decode Zora Content Coin calldata using the 'deploy' function
          const decoded = decodeFunctionData({
            abi: coinFactoryConfig.abi,
            data: calldata as Hex,
          })

          if (decoded.functionName !== 'deploy' || !decoded.args) continue

          // deploy(address payoutRecipient, address[] owners, string uri, string name, string symbol, bytes poolConfig, address platformReferrer, address postDeployHook, bytes postDeployHookData, bytes32 coinSalt)
          const [, , metadataUri, name, symbol] = decoded.args as readonly [
            AddressType,
            AddressType[],
            string,
            string,
            string,
            Hex,
            AddressType,
            AddressType,
            Hex,
            Hex,
          ]

          results.push({
            name,
            symbol,
            metadataUri,
            imageUrl: undefined,
            description: undefined,
            isContentCoin: true,
            transactionIndex: index,
          })
        } else {
          // Decode Clanker Creator Coin calldata using the 'deployToken' function
          try {
            const decoded = decodeFunctionData({
              abi: clankerFactoryAbi,
              data: calldata as Hex,
            })

            if (decoded.functionName !== 'deployToken' || !decoded.args) {
              console.warn('Unexpected Clanker function:', decoded.functionName)
              continue
            }

            // deployToken expects a DeploymentConfig tuple as first arg
            const deploymentConfig = decoded.args[0] as any

            if (deploymentConfig?.tokenConfig) {
              const tokenConfig = deploymentConfig.tokenConfig

              // Parse description from tokenMetadata JSON
              let description: string | null = null
              if (tokenConfig.metadata) {
                try {
                  const parsed = JSON.parse(tokenConfig.metadata)
                  description = parsed.description ?? null
                } catch {
                  // If parsing fails, use raw metadata as description
                  description = tokenConfig.metadata
                }
              }

              results.push({
                name: tokenConfig.name || 'Creator Coin',
                symbol: tokenConfig.symbol || 'CREATOR',
                metadataUri: undefined,
                imageUrl: tokenConfig.image,
                description: description ?? '',
                isContentCoin: false,
                transactionIndex: index,
              })
            }
          } catch (decodeError) {
            console.warn('Could not decode Clanker calldata:', decodeError)
            // Fallback: return minimal data
          }
        }
      } catch (error) {
        console.error('Failed to decode coin calldata:', error)
      }
    }

    return results
  }, [coinTransactionIndices, proposal.calldatas])

  // Fetch coin addresses from execution transaction logs
  // Returns a map of "transactionIndex:name:symbol" -> address for deterministic matching
  const {
    data: coinAddressMap,
    isValidating,
    isLoading,
  } = useSWR(
    proposal.executionTransactionHash &&
      isHex(proposal.executionTransactionHash) &&
      coinTransactionIndices.length > 0
      ? ([
          SWR_KEYS.COIN_ADDRESSES,
          chainId,
          proposal.executionTransactionHash,
          coinTransactionIndices,
        ] as const)
      : null,
    async ([, _chainId, _txHash, _coinIndices]) => {
      const provider = getProvider(_chainId)
      const receipt = await provider.getTransactionReceipt({ hash: _txHash })

      const addressMap = new Map<string, AddressType>()

      // Track which transaction index we're on (matches order of events)
      let currentCoinEventIndex = 0

      // Parse logs for coin creation events
      for (const log of receipt.logs) {
        try {
          // Try to decode as Zora coin creation event (CoinCreatedV4)
          const zoraDecoded = decodeEventLog({
            abi: coinFactoryConfig.abi,
            data: log?.data,
            topics: log?.topics,
          })

          if (zoraDecoded.eventName === 'CoinCreatedV4') {
            const args = zoraDecoded.args as any
            const coinAddress = args.coin
            const name = args.name
            const symbol = args.symbol

            if (
              coinAddress &&
              name &&
              symbol &&
              currentCoinEventIndex < _coinIndices.length
            ) {
              // Create stable key with transaction index
              const transactionIndex = _coinIndices[currentCoinEventIndex].index
              const key = `${transactionIndex}:${name}:${symbol}`
              addressMap.set(key, coinAddress as AddressType)
              currentCoinEventIndex++
              continue
            }
          }
        } catch {
          // Not a Zora coin event, try Clanker
        }

        try {
          // Try to decode as Clanker token creation event (TokenCreated)
          const clankerDecoded = decodeEventLog({
            abi: clankerFactoryAbi,
            data: log?.data,
            topics: log?.topics,
          })

          if (clankerDecoded.eventName === 'TokenCreated') {
            const args = clankerDecoded.args as any
            const tokenAddress = args.tokenAddress
            const name = args.tokenName
            const symbol = args.tokenSymbol

            if (
              tokenAddress &&
              name &&
              symbol &&
              currentCoinEventIndex < _coinIndices.length
            ) {
              // Create stable key with transaction index
              const transactionIndex = _coinIndices[currentCoinEventIndex].index
              const key = `${transactionIndex}:${name}:${symbol}`
              addressMap.set(key, tokenAddress as AddressType)
              currentCoinEventIndex++
              continue
            }
          }
        } catch {
          // Not a Clanker token event, skip
        }
      }

      return addressMap
    }
  )

  // Combine static data with execution data using stable key-based matching
  const coins = useMemo((): CoinInstanceData[] => {
    return coinsStaticDataWithIndex.map((staticData) => {
      // Create the same key format used in the address map: "transactionIndex:name:symbol"
      const key = `${staticData.transactionIndex}:${staticData.name}:${staticData.symbol}`
      const address = coinAddressMap?.get(key)

      // Remove transactionIndex from final result
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { transactionIndex, ...coinData } = staticData

      return {
        ...coinData,
        address,
      }
    })
  }, [coinsStaticDataWithIndex, coinAddressMap])

  return {
    isCreateTx: coins.length > 0,
    coins,
    isLoading: isLoading && !coinAddressMap && !!proposal.executionTransactionHash,
    isValidating,
  }
}
