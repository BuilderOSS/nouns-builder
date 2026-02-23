import { PUBLIC_ZORA_NFT_CREATOR } from '@buildeross/constants/addresses'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { zoraNFTCreatorAbi } from '@buildeross/sdk/contract'
import type { Proposal } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import get from 'lodash/get'
import toLower from 'lodash/toLower'
import { useMemo } from 'react'
import useSWR from 'swr'
import { decodeEventLog, decodeFunctionData, Hex, isHex } from 'viem'

export type DropStaticData = {
  name: string
  symbol: string
  editionSize: bigint
  royaltyBPS: number
  fundsRecipient: AddressType
  defaultAdmin: AddressType
  publicSalePrice: bigint
  maxSalePurchasePerAddress: number
  publicSaleStart: bigint
  publicSaleEnd: bigint
  description: string
  animationUri: string
  imageUri: string
}

export type DropInstanceData = DropStaticData & {
  address: AddressType | undefined
}

export type DropDataResult = {
  isCreateTx: boolean
  drops: DropInstanceData[]
  isLoading: boolean
}

/**
 * Hook to extract Zora drop creation data from proposal transactions
 */
export const useDropData = (chainId: CHAIN_ID, proposal: Proposal): DropDataResult => {
  const zoraCreatorAddress = PUBLIC_ZORA_NFT_CREATOR[chainId]

  // Find all drop transaction indices in proposal
  const dropTransactionIndices = useMemo(() => {
    if (!proposal.targets || !zoraCreatorAddress) return []

    const indices: number[] = []
    proposal.targets.forEach((target, index) => {
      if (toLower(target) === toLower(zoraCreatorAddress)) {
        indices.push(index)
      }
    })

    return indices
  }, [proposal.targets, zoraCreatorAddress])

  // Extract static drop data from calldatas
  const dropsStaticData = useMemo((): DropStaticData[] => {
    if (dropTransactionIndices.length === 0 || !proposal.calldatas) return []

    return dropTransactionIndices
      .map((index) => {
        const calldata = proposal.calldatas?.[index]
        if (!calldata) return null

        try {
          const decoded = decodeFunctionData({
            abi: zoraNFTCreatorAbi,
            data: calldata as Hex,
          })

          if (decoded.functionName !== 'createEdition' || !decoded.args) return null

          // createEdition(string name, string symbol, uint64 editionSize, uint16 royaltyBPS,
          //   address fundsRecipient, address defaultAdmin, SalesConfig salesConfig,
          //   string description, string animationURI, string imageURI)
          const [
            name,
            symbol,
            editionSize,
            royaltyBPS,
            fundsRecipient,
            defaultAdmin,
            salesConfig,
            description,
            animationUri,
            imageUri,
          ] = decoded.args as readonly [
            string,
            string,
            bigint,
            number,
            AddressType,
            AddressType,
            {
              publicSalePrice: bigint
              maxSalePurchasePerAddress: number
              publicSaleStart: bigint
              publicSaleEnd: bigint
              presaleStart: bigint
              presaleEnd: bigint
              presaleMerkleRoot: Hex
            },
            string,
            string,
            string,
          ]

          return {
            name,
            symbol,
            editionSize,
            royaltyBPS,
            fundsRecipient,
            defaultAdmin,
            publicSalePrice: salesConfig.publicSalePrice,
            maxSalePurchasePerAddress: salesConfig.maxSalePurchasePerAddress,
            publicSaleStart: salesConfig.publicSaleStart,
            publicSaleEnd: salesConfig.publicSaleEnd,
            description,
            animationUri,
            imageUri,
          }
        } catch (error) {
          console.error('Failed to decode drop calldata:', error)
          return null
        }
      })
      .filter((data): data is DropStaticData => data !== null)
  }, [dropTransactionIndices, proposal.calldatas])

  // Fetch drop addresses from execution transaction logs
  const { data: dropAddresses, isValidating: isLoading } = useSWR(
    proposal.executionTransactionHash &&
      isHex(proposal.executionTransactionHash) &&
      dropTransactionIndices.length > 0
      ? ([SWR_KEYS.DROP_ADDRESSES, chainId, proposal.executionTransactionHash] as const)
      : null,
    async ([, _chainId, _txHash]) => {
      const provider = getProvider(_chainId)
      const receipt = await provider.getTransactionReceipt({ hash: _txHash })

      const addresses: (AddressType | undefined)[] = []

      // Parse logs for drop creation events
      // Zora NFT Creator emits 'CreatedDrop'
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: zoraNFTCreatorAbi,
            data: log?.data,
            topics: log?.topics,
          })

          // Look for edition creation events
          // The event might be 'CreatedDrop'
          if (decoded.eventName === 'CreatedDrop') {
            const dropAddress =
              get(decoded, 'args.editionContractAddress') ||
              get(decoded, 'args.editionAddress') ||
              get(decoded, 'args.edition') ||
              get(decoded, 'args.drop')
            if (dropAddress) {
              addresses.push(dropAddress as AddressType)
            }
          }
        } catch {
          // Not a drop creation event, skip
        }
      }

      return addresses
    }
  )

  // Combine static data with execution data
  const drops = useMemo((): DropInstanceData[] => {
    return dropsStaticData.map((staticData, index) => ({
      ...staticData,
      address: dropAddresses?.[index],
    }))
  }, [dropsStaticData, dropAddresses])

  return {
    isCreateTx: drops.length > 0,
    drops,
    isLoading: isLoading && !dropAddresses && !!proposal.executionTransactionHash,
  }
}
