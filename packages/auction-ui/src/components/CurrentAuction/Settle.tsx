import { auctionAbi } from '@buildeross/sdk/contract'
import { executeAppTransaction } from '@buildeross/sdk/transaction'
import { useAuthStore } from '@buildeross/stores'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { Button, Flex } from '@buildeross/zord'
import { useCallback, useState } from 'react'
import { useConfig } from 'wagmi'
import { simulateContract } from 'wagmi/actions'

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
  const { address } = useAuthStore()

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

      const result = await executeAppTransaction({
        config,
        request: data.request,
        chainId,
      })

      // Don't reset state for Safe proposals - user needs to execute via Safe UI
      if (result.kind === 'safe-proposed') {
        setSettling(false)
        return
      }

      // Transaction mined successfully
    } catch (error) {
      console.error('Error settling auction', error)
      throw error
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
        <Button
          disabled
          className={auctionActionButtonVariants['settling']}
          size={compact ? 'sm' : 'lg'}
          px={compact ? 'x2' : undefined}
        >
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
          size={compact ? 'sm' : 'lg'}
          px={compact ? 'x2' : undefined}
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
        size={compact ? 'sm' : 'lg'}
        px={compact ? 'x2' : undefined}
        chainId={chainId}
      >
        {buttonText}
      </ContractButton>
    </Flex>
  )
}
