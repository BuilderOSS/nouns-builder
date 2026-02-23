import { CLANKER_FACTORY_ADDRESS } from '@buildeross/constants/addresses'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { clankerFactoryAbi } from '@buildeross/sdk/contract'
import type { Proposal } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import { coinFactoryAddress, coinFactoryConfig } from '@zoralabs/protocol-deployments'
import get from 'lodash/get'
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
}

/**
 * Get Zora coin factory address for the given chain
 */
const getZoraCoinFactoryAddress = (chainId: CHAIN_ID): string | undefined => {
  return coinFactoryAddress[chainId as keyof typeof coinFactoryAddress]
}

/**
 * Hook to extract coin creation data from proposal transactions
 * Handles both Content Coins (Zora) and Creator Coins (Clanker)
 */
export const useCoinData = (chainId: CHAIN_ID, proposal: Proposal): CoinDataResult => {
  const zoraCoinFactory = getZoraCoinFactoryAddress(chainId)
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
  const coinsStaticData = useMemo((): CoinStaticData[] => {
    if (coinTransactionIndices.length === 0 || !proposal.calldatas) return []

    const results: CoinStaticData[] = []

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
              results.push({
                name: 'Creator Coin',
                symbol: 'CREATOR',
                metadataUri: undefined,
                imageUrl: undefined,
                description: undefined,
                isContentCoin: false,
              })
              continue
            }

            // deployToken expects a DeploymentConfig tuple as first arg
            const deploymentConfig = decoded.args[0] as any

            if (deploymentConfig?.tokenConfig) {
              const tokenConfig = deploymentConfig.tokenConfig

              results.push({
                name: tokenConfig.name || 'Creator Coin',
                symbol: tokenConfig.symbol || 'CREATOR',
                metadataUri: undefined,
                imageUrl: tokenConfig.image,
                description: tokenConfig.metadata,
                isContentCoin: false,
              })
            } else {
              // Fallback: return minimal data
              results.push({
                name: 'Creator Coin',
                symbol: 'CREATOR',
                metadataUri: undefined,
                imageUrl: undefined,
                description: undefined,
                isContentCoin: false,
              })
            }
          } catch (decodeError) {
            console.warn('Could not decode Clanker calldata:', decodeError)
            // Fallback: return minimal data
            results.push({
              name: 'Creator Coin',
              symbol: 'CREATOR',
              metadataUri: undefined,
              imageUrl: undefined,
              description: undefined,
              isContentCoin: false,
            })
          }
        }
      } catch (error) {
        console.error('Failed to decode coin calldata:', error)
      }
    }

    return results
  }, [coinTransactionIndices, proposal.calldatas])

  // Fetch coin addresses from execution transaction logs
  const { data: coinAddresses, isValidating: isLoading } = useSWR(
    proposal.executionTransactionHash &&
      isHex(proposal.executionTransactionHash) &&
      coinTransactionIndices.length > 0
      ? ([SWR_KEYS.COIN_ADDRESSES, chainId, proposal.executionTransactionHash] as const)
      : null,
    async ([, _chainId, _txHash]) => {
      const provider = getProvider(_chainId)
      const receipt = await provider.getTransactionReceipt({ hash: _txHash })

      const addresses: (AddressType | undefined)[] = []

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
            const coinAddress = get(zoraDecoded, 'args.coin')
            if (coinAddress) {
              addresses.push(coinAddress as AddressType)
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
            const tokenAddress = get(clankerDecoded, 'args.tokenAddress')
            if (tokenAddress) {
              addresses.push(tokenAddress as AddressType)
              continue
            }
          }
        } catch {
          // Not a Clanker token event, skip
        }
      }

      return addresses
    }
  )

  // Combine static data with execution data
  const coins = useMemo((): CoinInstanceData[] => {
    return coinsStaticData.map((staticData, index) => ({
      ...staticData,
      address: coinAddresses?.[index],
    }))
  }, [coinsStaticData, coinAddresses])

  return {
    isCreateTx: coinTransactionIndices.length > 0,
    coins,
    isLoading: isLoading && !coinAddresses && !!proposal.executionTransactionHash,
  }
}
