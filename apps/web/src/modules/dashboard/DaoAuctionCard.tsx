import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { useCountdown } from '@buildeross/hooks/useCountdown'
import { useIsMounted } from '@buildeross/hooks/useIsMounted'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import { auctionAbi } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { Box, Flex, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { FallbackNextImage } from 'src/components/FallbackNextImage'
import { formatEther } from 'viem'
import { useWatchContractEvent } from 'wagmi'

import { overflowEllipsis } from '../auction/components/Auction.css'
import { AuctionPaused } from './AuctionPaused'
import { BidActionButton } from './BidActionButton'
import { DashboardDaoProps } from './Dashboard'
import {
  auctionCardBrand,
  bidBox,
  daoAvatar,
  daoAvatarBox,
  daoTokenName,
  outerAuctionCard,
  stats,
  statsBox,
} from './dashboard.css'

type DaoAuctionCardProps = DashboardDaoProps & {
  userAddress: AddressType
  handleMutate: () => void
}

export const DaoAuctionCard = (props: DaoAuctionCardProps) => {
  const { currentAuction, chainId, auctionAddress, handleMutate, tokenAddress } = props
  const {
    name: chainName,
    icon: chainIcon,
    slug: chainSlug,
  } = PUBLIC_ALL_CHAINS.find((chain) => chain.id === chainId) ?? {}
  const { push } = useRouter()
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

  const handleSelectAuction = () => push(`/dao/${chainSlug}/${tokenAddress}`)
  const onEnd = () => {
    setIsEnded(true)
  }
  const isOver = !!endTime ? dayjs.unix(Date.now() / 1000) >= dayjs.unix(endTime) : true

  if (!currentAuction) {
    return (
      <AuctionPaused
        {...props}
        currentChainSlug={chainSlug}
        tokenAddress={tokenAddress}
        chainName={chainName}
        chainIcon={chainIcon}
      />
    )
  }

  const bidText = currentAuction.highestBid?.amount
    ? `${formatEther(BigInt(currentAuction.highestBid.amount))} ETH`
    : 'N/A'

  const tokenImage = currentAuction?.token?.image

  return (
    <Flex className={outerAuctionCard}>
      <Flex className={auctionCardBrand} onClick={handleSelectAuction}>
        <Box className={daoAvatarBox}>
          <FallbackNextImage
            className={daoAvatar}
            srcList={getFetchableUrls(tokenImage)}
            unoptimized
            layout="fixed"
            alt=""
          />
        </Box>
        <Box>
          <Flex mb="x1" align="center">
            {chainIcon && (
              <Image
                src={chainIcon}
                layout="fixed"
                objectFit="contain"
                style={{ borderRadius: '12px', maxHeight: '22px' }}
                alt=""
                height={22}
                width={22}
              />
            )}
            <Text fontSize={16} color="text3" ml={'x1'}>
              {chainName}
            </Text>
          </Flex>
          <Text className={daoTokenName}>{currentAuction.token.name}</Text>
        </Box>
      </Flex>
      <Flex className={statsBox}>
        <Box className={stats}>
          <Text fontSize={16} color="text3" mb={'x1'}>
            Current Bid
          </Text>
          <Text fontSize={18} fontWeight="label" className={overflowEllipsis}>
            {bidText}
          </Text>
        </Box>
        <Box className={stats}>
          <Text fontSize={16} color="text3" mb={'x1'}>
            Ends In
          </Text>
          <DashCountdown endTime={endTime} onEnd={onEnd} isOver={isOver} />
        </Box>
      </Flex>
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
    <Text fontSize={18} fontWeight="label">
      {countdownText}
    </Text>
  )
}
