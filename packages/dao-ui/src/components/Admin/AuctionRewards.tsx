import { PROTOCOL_REWARDS_MANAGER } from '@buildeross/constants'
import { useAuctionRewards } from '@buildeross/hooks'
import { protocolRewardsAbi } from '@buildeross/sdk/contract'
import { useChainStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { ContractLink } from '@buildeross/ui/ContractLink'
import { Tooltip } from '@buildeross/ui/Tooltip'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import React, { useCallback, useState } from 'react'
import { formatEther, Hex } from 'viem'
import { useAccount, useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { Section } from '../AdminForm/Section'

interface AuctionRewardsProps {
  auctionAddress: AddressType
}

interface TooltipProps {
  label: string
  tooltip: string
}

const LabelWithTooltip: React.FC<TooltipProps> = ({ label, tooltip }) => (
  <Flex align="center" gap="x2">
    <Text fontWeight="label">{label}</Text>
    <Tooltip>{tooltip}</Tooltip>
  </Flex>
)

export const AuctionRewards: React.FC<AuctionRewardsProps> = ({ auctionAddress }) => {
  const chain = useChainStore((state) => state.chain)
  const config = useConfig()
  const { address } = useAccount()
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const { data, isLoading, error, mutate } = useAuctionRewards({
    chainId: chain.id,
    auctionAddress,
  })

  const handleWithdrawRewards = useCallback(async () => {
    if (!data?.founderRewardsRecipient || !chain || isWithdrawing) return

    setIsWithdrawing(true)
    try {
      const protocolRewardsContractParams = {
        address: PROTOCOL_REWARDS_MANAGER,
        abi: protocolRewardsAbi,
        chainId: chain.id,
      }

      const simulateData = await simulateContract(config, {
        ...protocolRewardsContractParams,
        functionName: 'withdrawFor',
        args: [data.founderRewardsRecipient, data.founderRewardsBalance],
        account: address,
      })

      const txHash: Hex = await writeContract(config, simulateData.request)

      await waitForTransactionReceipt(config, {
        hash: txHash,
        chainId: chain.id,
      })

      // Refresh the auction rewards data
      await mutate()
    } catch (err) {
      console.error('Error withdrawing rewards:', err)
    } finally {
      setIsWithdrawing(false)
    }
  }, [
    data?.founderRewardsRecipient,
    data?.founderRewardsBalance,
    chain,
    config,
    mutate,
    isWithdrawing,
    address,
  ])

  if (isLoading) {
    return (
      <Section title="Auction Rewards">
        <Text variant="paragraph-sm" color="text3">
          Loading auction rewards...
        </Text>
      </Section>
    )
  }

  if (error || !data) {
    return (
      <Section title="Auction Rewards">
        <Text variant="paragraph-sm" color="text3">
          Unable to load auction rewards settings.
        </Text>
      </Section>
    )
  }

  const formatBPS = (bps: number) => `${(bps / 100).toFixed(2)}%`
  const formatBalance = (balance: bigint) => {
    return `${formatEther(balance)} ETH`
  }

  return (
    <Section title="Auction Rewards">
      <Stack gap="x4">
        <Text variant="paragraph-sm" color="text3">
          Auction reward settings are fixed at DAO creation and cannot be changed. When an
          auction is settled, part of the bid is paid out as ETH rewards to each
          recipient.
        </Text>

        <Stack gap="x4">
          <Flex justify="space-between" align="center">
            <LabelWithTooltip
              label="Builder Rewards"
              tooltip="Rewards paid to Nouns Builder for maintaining the DAO's core infrastructure and tooling."
            />
            <Text color="text2">{formatBPS(data.builderRewardsBPS)}</Text>
          </Flex>

          <Flex justify="space-between" align="center">
            <LabelWithTooltip
              label="Referral Rewards"
              tooltip="Rewards paid to users who refer new bidders to auctions, or to developers integrating referrals into external UIs."
            />
            <Text color="text2">{formatBPS(data.referralRewardsBPS)}</Text>
          </Flex>

          <Box>
            <Flex justify="space-between" align="center" mb="x2">
              <LabelWithTooltip
                label="Founder Rewards"
                tooltip="Rewards paid to the DAO founders for their role in creating the DAO."
              />
              <Text color="text2">{formatBPS(data.founderRewardsBPS)}</Text>
            </Flex>
            {data.founderRewardsBPS > 0 && (
              <Stack gap="x3" pl="x4">
                <Flex justify="space-between" align="center" color="text2">
                  <Text fontSize={14} fontWeight="label" color="text3">
                    Recipient
                  </Text>
                  <ContractLink
                    address={data.founderRewardsRecipient}
                    size="xs"
                    chainId={chain.id}
                  />
                </Flex>

                <Flex justify="space-between" align="center">
                  <Text fontSize={14} fontWeight="label">
                    Balance
                  </Text>
                  <Flex align="center" gap="x3">
                    <Text color="text2" style={{ fontFamily: 'monospace' }}>
                      {formatBalance(data.founderRewardsBalance)}
                    </Text>
                    <ContractButton
                      chainId={chain.id}
                      variant="secondary"
                      size="sm"
                      handleClick={handleWithdrawRewards}
                      loading={isWithdrawing}
                      disabled={data.founderRewardsBalance == 0n || isWithdrawing}
                    >
                      {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                    </ContractButton>
                  </Flex>
                </Flex>
              </Stack>
            )}
          </Box>
        </Stack>
      </Stack>
    </Section>
  )
}
