import { auctionAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { Button, Flex } from '@buildeross/zord'
import { useCallback, useState } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { auctionActionButtonVariants } from '../Auction.css'

interface SettleProps {
  isEnding: boolean
  owner?: string | undefined
  auctionAddress: AddressType
  auctionPaused: boolean
  compact?: boolean
  chainId: CHAIN_ID
}

export const Settle = ({
  chainId,
  isEnding,
  owner,
  auctionAddress,
  auctionPaused: paused,
  compact = false,
}: SettleProps) => {
  const config = useConfig()
  const { address } = useAccount()

  const isWinner = owner != undefined && address?.toLowerCase() == owner?.toLowerCase()

  const [settling, setSettling] = useState(false)

  const handleSettle = useCallback(async () => {
    try {
      setSettling(true)
      const data = await simulateContract(config, {
        address: auctionAddress,
        abi: auctionAbi,
        functionName: paused ? 'settleAuction' : 'settleCurrentAndCreateNewAuction',
        chainId,
      })

      const txHash = await writeContract(config, data.request)
      await waitForTransactionReceipt(config, { hash: txHash, chainId })
    } catch (error) {
      console.error('Error settling auction', error)
    } finally {
      setSettling(false)
    }
  }, [auctionAddress, config, chainId, paused])

  const buttonText = (() => {
    if (isWinner) return 'Claim NFT'
    if (paused) return 'Settle Auction'
    return 'Start next Auction'
  })()

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
        {buttonText}
      </ContractButton>
    </Flex>
  )
}
