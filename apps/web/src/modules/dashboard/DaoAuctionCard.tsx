import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { useCountdown } from '@buildeross/hooks/useCountdown'
import { useIsMounted } from '@buildeross/hooks/useIsMounted'
import { auctionAbi } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { Box, Flex, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import Image from 'next/image'
import React, { useState } from 'react'
import { formatEther } from 'viem'
import { useWatchContractEvent } from 'wagmi'

import { AuctionPaused } from './AuctionPaused'
import { BidActionButton } from './BidActionButton'
import { DashboardDaoProps } from './Dashboard'
import {
  bidBox,
  daoAvatar,
  daoAvatarBox,
  daoTokenName,
  outerAuctionCard,
} from './dashboard.css'

type DaoAuctionCardProps = DashboardDaoProps & {
  userAddress: AddressType
  handleMutate: () => void
}

export const DaoAuctionCard = (props: DaoAuctionCardProps) => {
  const { currentAuction, chainId, auctionAddress, handleMutate, tokenAddress } = props

  const { getAuctionLink } = useLinks()
  const chain = PUBLIC_ALL_CHAINS.find((chain) => chain.id === chainId)
  const { endTime } = currentAuction ?? {}

  const [isEnded, setIsEnded] = useState(false)
  const timeoutRefs = React.useRef<NodeJS.Timeout[]>([])

  React.useEffect(() => {
    const refs = timeoutRefs.current
    return () => refs.forEach(clearTimeout)
  }, [])

  const onLogs = React.useCallback(async () => {
    const timeoutId = setTimeout(() => {
      handleMutate()
    }, 3000)
    timeoutRefs.current.push(timeoutId)
  }, [handleMutate])

  useWatchContractEvent({
    address: auctionAddress,
    abi: auctionAbi,
    eventName: 'AuctionCreated',
    chainId,
    onLogs,
  })

  useWatchContractEvent({
    address: auctionAddress,
    abi: auctionAbi,
    eventName: 'AuctionBid',
    chainId,
    onLogs,
  })

  const onEnd = () => {
    setIsEnded(true)
  }
  const isOver = !!endTime ? dayjs.unix(Date.now() / 1000) >= dayjs.unix(endTime) : true

  if (!chain) {
    console.error(`Chain with ID ${chainId} not found in PUBLIC_ALL_CHAINS`)
    return null
  }

  if (!currentAuction) {
    return <AuctionPaused {...props} tokenAddress={tokenAddress} chain={chain} />
  }

  const bidText = currentAuction.highestBid?.amount
    ? `${formatEther(BigInt(currentAuction.highestBid.amount))} ETH`
    : ''

  const tokenImage = currentAuction?.token?.image

  return (
    <Flex className={outerAuctionCard} direction="column" align="stretch">
      <Link
        link={getAuctionLink(chainId, tokenAddress, currentAuction?.token?.tokenId)}
        style={{ width: '100%' }}
      >
        <Flex align="center" gap="x2" mb="x3" w="100%">
          <Box className={daoAvatarBox}>
            {tokenImage && (
              <FallbackImage className={daoAvatar} src={tokenImage} alt="" />
            )}
          </Box>
          <Flex align="center" justify="space-between" flex="1" style={{ minWidth: 0 }}>
            <Box style={{ minWidth: 0 }}>
              <Text className={daoTokenName}>{currentAuction.token.name}</Text>
              {bidText && (
                <Flex gap="x2" mt="x1" align="center">
                  <Text fontSize={14} color="text3">
                    {bidText}
                  </Text>
                  {endTime && !isOver && (
                    <>
                      <Text fontSize={14} color="text3">
                        •
                      </Text>
                      <DashCountdown endTime={endTime} onEnd={onEnd} isOver={isOver} />
                    </>
                  )}
                </Flex>
              )}
            </Box>
            <Flex align="center" gap="x1">
              {chain.icon && (
                <Image
                  src={chain.icon}
                  style={{
                    borderRadius: '50%',
                    maxHeight: '16px',
                    maxWidth: '16px',
                    objectFit: 'contain',
                  }}
                  alt={chain.name}
                  height={16}
                  width={16}
                />
              )}
              <Text fontSize={12} color="text3">
                {chain.name}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Link>
      <Flex className={bidBox}>
        <BidActionButton {...props} isOver={isOver} isEnded={isEnded} />
      </Flex>
    </Flex>
  )
}

const DashCountdown = ({
  endTime,
  onEnd,
  isOver,
}: {
  endTime: string | null
  onEnd: () => void
  isOver: boolean
}) => {
  const { countdownString } = useCountdown(Number(endTime), onEnd)
  const isMounted = useIsMounted()
  const countdownText = !endTime || isOver ? 'N/A' : countdownString
  if (!isMounted) return null
  return (
    <Text fontSize={14} color="text3">
      {countdownText}
    </Text>
  )
}
