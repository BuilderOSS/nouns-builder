import { PROTOCOL_REWARDS_MANAGER } from '@buildeross/constants'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { serverConfig } from '@buildeross/utils'
import { zeroAddress } from 'viem'
import { readContract, readContracts } from 'wagmi/actions'

import { auctionAbi, protocolRewardsAbi } from '../abis'

export type GetAuctionRewardsResponse = {
  builderRewardsBPS: number
  referralRewardsBPS: number
  founderRewardsBPS: number
  founderRewardsRecipient: AddressType
  founderRewardsBalance: bigint
}

export const getAuctionRewards = async (
  chainId: CHAIN_ID,
  auctionAddress: AddressType
): Promise<GetAuctionRewardsResponse> => {
  const [founderReward, referralRewardsBPS, builderRewardsBPS] = await readContracts(
    serverConfig,
    {
      allowFailure: false,
      contracts: [
        {
          address: auctionAddress,
          abi: auctionAbi,
          chainId,
          functionName: 'founderReward',
          args: [],
        },
        {
          address: auctionAddress,
          abi: auctionAbi,
          chainId,
          functionName: 'referralRewardsBPS',
          args: [],
        },
        {
          address: auctionAddress,
          abi: auctionAbi,
          chainId,
          functionName: 'builderRewardsBPS',
          args: [],
        },
      ],
    }
  )

  const founderRewardsRecipient = founderReward[0]
  const founderRewardsBPS = founderReward[1]

  const balanceCheckNeeded =
    founderRewardsBPS > 0 && founderRewardsRecipient !== zeroAddress

  const founderRewardsBalance = balanceCheckNeeded
    ? await readContract(serverConfig, {
        address: PROTOCOL_REWARDS_MANAGER,
        abi: protocolRewardsAbi,
        chainId,
        functionName: 'balanceOf',
        args: [founderRewardsRecipient],
      })
    : 0n

  return {
    builderRewardsBPS: builderRewardsBPS,
    referralRewardsBPS: referralRewardsBPS,
    founderRewardsBPS: founderRewardsBPS,
    founderRewardsRecipient: founderRewardsRecipient,
    founderRewardsBalance: founderRewardsBalance as bigint,
  }
}
