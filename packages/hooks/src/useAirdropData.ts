import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { erc20Abi } from '@buildeross/sdk/contract'
import type { Proposal } from '@buildeross/sdk/subgraph'
import type { CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import {
  factoryMerkleInstantAbi,
  factoryMerkleLLAbi,
} from '@buildeross/utils/sablier/constants'
import { getSablierAirdropFactories } from '@buildeross/utils/sablier/contracts'
import { useMemo } from 'react'
import useSWR from 'swr'
import { Address, decodeEventLog, decodeFunctionData, Hex } from 'viem'

export type AirdropCampaignType = 'instant' | 'll'

export interface AirdropFundingTransferData {
  token: Address
  to: Address
  amount: bigint
  transactionIndex: number
}

export interface AirdropInstanceData {
  transactionIndex: number
  type: AirdropCampaignType
  campaignName: string
  campaignStartTime: number
  expiration: number
  initialAdmin: Address
  ipfsCID: string
  merkleRoot: Hex
  token: Address
  aggregateAmount: bigint
  recipientCount: bigint
  fundingTransfer: AirdropFundingTransferData | null
  // LL-only fields
  cancelable?: boolean
  cliffDuration?: number
  cliffUnlockPercentage?: bigint
  lockup?: Address
  shape?: string
  startUnlockPercentage?: bigint
  totalDuration?: number
  transferable?: boolean
  vestingStartTime?: number
  // Populated when execution tx is available
  campaignAddress?: Address
}

export type AirdropDataResult = {
  isCreateTx: boolean
  airdrops: AirdropInstanceData[]
  isLoadingCampaignAddresses: boolean
}

const toLower = (value?: string | null): string => (value || '').toLowerCase()

export const useAirdropData = (
  chainId: CHAIN_ID,
  proposal: Proposal
): AirdropDataResult => {
  const factories = useMemo(() => getSablierAirdropFactories(chainId), [chainId])

  const airdrops = useMemo(() => {
    if (!proposal.targets || !proposal.calldatas) return []

    return proposal.targets
      .map((target, index) => {
        const calldata = proposal.calldatas?.[index]
        if (!calldata) return null

        const isInstantFactory =
          !!factories.factoryMerkleInstant &&
          toLower(target) === toLower(factories.factoryMerkleInstant)
        const isLLFactory =
          !!factories.factoryMerkleLL &&
          toLower(target) === toLower(factories.factoryMerkleLL)

        if (!isInstantFactory && !isLLFactory) {
          return null
        }

        try {
          if (isInstantFactory) {
            const decoded = decodeFunctionData({
              abi: factoryMerkleInstantAbi,
              data: calldata as Hex,
            })

            if (decoded.functionName !== 'createMerkleInstant' || !decoded.args) {
              return null
            }

            const [params, aggregateAmount, recipientCount] = decoded.args as [
              {
                campaignName: string
                campaignStartTime: bigint
                expiration: bigint
                initialAdmin: Address
                ipfsCID: string
                merkleRoot: Hex
                token: Address
              },
              bigint,
              bigint,
            ]

            let fundingTransfer: AirdropFundingTransferData | null = null
            const nextCalldata = proposal.calldatas?.[index + 1]
            const nextTarget = proposal.targets?.[index + 1]

            if (
              nextCalldata &&
              nextTarget &&
              toLower(nextTarget) === toLower(params.token)
            ) {
              const transferDecoded = decodeFunctionData({
                abi: erc20Abi,
                data: nextCalldata as Hex,
              })

              if (transferDecoded.functionName === 'transfer' && transferDecoded.args) {
                const [to, amount] = transferDecoded.args as [Address, bigint]
                fundingTransfer = {
                  token: params.token,
                  to,
                  amount,
                  transactionIndex: index + 1,
                }
              }
            }

            return {
              transactionIndex: index,
              type: 'instant' as const,
              campaignName: params.campaignName,
              campaignStartTime: Number(params.campaignStartTime),
              expiration: Number(params.expiration),
              initialAdmin: params.initialAdmin,
              ipfsCID: params.ipfsCID,
              merkleRoot: params.merkleRoot,
              token: params.token,
              aggregateAmount,
              recipientCount,
              fundingTransfer,
            }
          }

          const decoded = decodeFunctionData({
            abi: factoryMerkleLLAbi,
            data: calldata as Hex,
          })

          if (decoded.functionName !== 'createMerkleLL' || !decoded.args) {
            return null
          }

          const [params, aggregateAmount, recipientCount] = decoded.args as [
            {
              campaignName: string
              campaignStartTime: bigint
              cancelable: boolean
              cliffDuration: bigint
              cliffUnlockPercentage: bigint
              expiration: bigint
              initialAdmin: Address
              ipfsCID: string
              lockup: Address
              merkleRoot: Hex
              shape: string
              startUnlockPercentage: bigint
              token: Address
              totalDuration: bigint
              transferable: boolean
              vestingStartTime: bigint
            },
            bigint,
            bigint,
          ]

          let fundingTransfer: AirdropFundingTransferData | null = null
          const nextCalldata = proposal.calldatas?.[index + 1]
          const nextTarget = proposal.targets?.[index + 1]

          if (
            nextCalldata &&
            nextTarget &&
            toLower(nextTarget) === toLower(params.token)
          ) {
            const transferDecoded = decodeFunctionData({
              abi: erc20Abi,
              data: nextCalldata as Hex,
            })

            if (transferDecoded.functionName === 'transfer' && transferDecoded.args) {
              const [to, amount] = transferDecoded.args as [Address, bigint]
              fundingTransfer = {
                token: params.token,
                to,
                amount,
                transactionIndex: index + 1,
              }
            }
          }

          return {
            transactionIndex: index,
            type: 'll' as const,
            campaignName: params.campaignName,
            campaignStartTime: Number(params.campaignStartTime),
            expiration: Number(params.expiration),
            initialAdmin: params.initialAdmin,
            ipfsCID: params.ipfsCID,
            merkleRoot: params.merkleRoot,
            token: params.token,
            aggregateAmount,
            recipientCount,
            fundingTransfer,
            cancelable: params.cancelable,
            cliffDuration: Number(params.cliffDuration),
            cliffUnlockPercentage: params.cliffUnlockPercentage,
            lockup: params.lockup,
            shape: params.shape,
            startUnlockPercentage: params.startUnlockPercentage,
            totalDuration: Number(params.totalDuration),
            transferable: params.transferable,
            vestingStartTime: Number(params.vestingStartTime),
          }
        } catch {
          return null
        }
      })
      .filter(Boolean) as AirdropInstanceData[]
  }, [proposal.targets, proposal.calldatas, factories])

  const { data: campaignAddresses, isValidating: isLoadingCampaignAddresses } = useSWR(
    proposal.executionTransactionHash && airdrops.length > 0
      ? ([
          SWR_KEYS.SABLIER_AIRDROP_CAMPAIGNS,
          chainId,
          proposal.executionTransactionHash,
        ] as const)
      : null,
    async ([, _chainId, _txHash]) => {
      const provider = getProvider(_chainId)
      const receipt = await provider.getTransactionReceipt({ hash: _txHash as Hex })

      const addresses: Address[] = []

      for (const log of receipt.logs) {
        try {
          const parsedInstant = decodeEventLog({
            abi: factoryMerkleInstantAbi,
            data: log.data,
            topics: log.topics,
          })

          if (parsedInstant.eventName === 'CreateMerkleInstant') {
            const merkleInstant = (parsedInstant.args as any)?.merkleInstant
            if (merkleInstant) {
              addresses.push(merkleInstant as Address)
              continue
            }
          }
        } catch {
          // no-op
        }

        try {
          const parsedLL = decodeEventLog({
            abi: factoryMerkleLLAbi,
            data: log.data,
            topics: log.topics,
          })

          if (parsedLL.eventName === 'CreateMerkleLL') {
            const merkleLL = (parsedLL.args as any)?.merkleLL
            if (merkleLL) {
              addresses.push(merkleLL as Address)
            }
          }
        } catch {
          // no-op
        }
      }

      return addresses
    },
    { revalidateOnFocus: false }
  )

  const airdropsWithAddresses = useMemo(
    () =>
      airdrops.map((airdrop, index) => ({
        ...airdrop,
        campaignAddress: campaignAddresses?.[index],
      })),
    [airdrops, campaignAddresses]
  )

  return {
    isCreateTx: airdrops.length > 0,
    airdrops: airdropsWithAddresses,
    isLoadingCampaignAddresses,
  }
}
