import { auctionAbi } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { Button, Flex } from '@buildeross/zord'
import React, { useCallback, useState } from 'react'
import { ContractButton } from 'src/components/ContractButton'
import { useChainStore, useDaoStore } from 'src/stores'
import {
  useAccount,
  useConfig,
  useReadContract,
  useSimulateContract,
  useWriteContract,
} from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'

import { auctionActionButtonVariants } from '../Auction.css'

interface SettleProps {
  isEnding: boolean
  collectionAddress?: string
  owner?: string | undefined
  externalAuctionAddress?: AddressType
  compact?: boolean
}

export const Settle = ({
  isEnding,
  owner,
  externalAuctionAddress,
  compact = false,
}: SettleProps) => {
  const chain = useChainStore((x) => x.chain)
  const addresses = useDaoStore((state) => state.addresses) || {}
  const config = useConfig()

  const { address } = useAccount()
  const isWinner = owner != undefined && address == owner

  const auctionAddress = externalAuctionAddress || addresses.auction

  const { data: paused } = useReadContract({
    query: {
      enabled: !!auctionAddress,
    },
    address: auctionAddress,
    chainId: chain.id,
    abi: auctionAbi,
    functionName: 'paused',
  })

  const { data, error } = useSimulateContract({
    query: {
      enabled: !!auctionAddress,
    },
    address: auctionAddress,
    abi: auctionAbi,
    functionName: paused ? 'settleAuction' : 'settleCurrentAndCreateNewAuction',
  })

  const { writeContractAsync } = useWriteContract()

  const [settling, setSettling] = useState(false)

  const handleSettle = useCallback(async () => {
    if (!!error || !data) return

    setSettling(true)
    try {
      const txHash = await writeContractAsync?.(data.request)
      if (txHash)
        await waitForTransactionReceipt(config, { hash: txHash, chainId: chain.id })
      setSettling(false)
    } catch (error) {
      setSettling(false)
    }
  }, [error, data, writeContractAsync, config, chain.id, setSettling])

  if (isEnding && !settling) {
    return (
      <Flex direction="column" align="center" width={'100%'}>
        <Button disabled className={auctionActionButtonVariants['settling']} size="lg">
          Auction ending
        </Button>
      </Flex>
    )
  }

  if (settling) {
    return (
      <Flex direction="column" align="center" width={'100%'}>
        <Button
          disabled
          className={
            compact
              ? auctionActionButtonVariants['dashSettle']
              : auctionActionButtonVariants['settling']
          }
          variant={compact ? 'outline' : 'primary'}
          size="lg"
        >
          Settling
        </Button>
      </Flex>
    )
  }

  return (
    <Flex direction="column" align="center" width={'100%'}>
      <ContractButton
        disabled={!!error || !data}
        handleClick={handleSettle}
        className={
          compact
            ? auctionActionButtonVariants['dashSettle']
            : auctionActionButtonVariants['settle']
        }
        variant={compact ? 'outline' : 'primary'}
        size="lg"
      >
        {isWinner ? 'Claim NFT' : 'Start next auction'}
      </ContractButton>
    </Flex>
  )
}
