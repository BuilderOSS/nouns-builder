import { auctionAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { Button, Flex } from '@buildeross/zord'
import React, { useCallback, useState } from 'react'
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
  owner?: string | undefined
  auctionAddress: AddressType
  compact?: boolean
  chainId: CHAIN_ID
}

export const Settle = ({
  chainId,
  isEnding,
  owner,
  auctionAddress,
  compact = false,
}: SettleProps) => {
  const config = useConfig()

  const { address } = useAccount()
  const isWinner = owner != undefined && address == owner

  const { data: paused } = useReadContract({
    query: {
      enabled: !!auctionAddress,
    },
    address: auctionAddress,
    chainId: chainId,
    abi: auctionAbi,
    functionName: 'paused',
  })

  const { data, error } = useSimulateContract({
    chainId: chainId,
    query: {
      enabled: !!auctionAddress && paused !== undefined,
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
      if (txHash) await waitForTransactionReceipt(config, { hash: txHash, chainId })
      setSettling(false)
    } catch (error) {
      setSettling(false)
    }
  }, [error, data, writeContractAsync, config, chainId, setSettling])

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
        chainId={chainId}
      >
        {isWinner ? 'Claim NFT' : 'Start next Auction'}
      </ContractButton>
    </Flex>
  )
}
