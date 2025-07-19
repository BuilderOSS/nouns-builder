import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { useCountdown } from '@buildeross/hooks/useCountdown'
import { useIsMounted } from '@buildeross/hooks/useIsMounted'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import { CHAIN_ID } from '@buildeross/types'
import { BigNumberish } from '@buildeross/utils/numbers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Flex, Paragraph } from '@buildeross/zord'
import dayjs from 'dayjs'
import Link from 'next/link'
import React, { useState } from 'react'

import { FallbackNextImage } from 'src/components/FallbackImage'

import { auction, daoImage, name, title } from './DaoCard.css'
import { Detail } from './Detail'

interface DaoCardProps {
  collectionAddress: string
  chainId: CHAIN_ID
  tokenName?: string
  tokenId?: string
  tokenImage?: string
  collectionName?: string
  bid?: BigNumberish
  endTime?: number
}

const Countdown = ({ end, onEnd }: { end: any; onEnd: () => void }) => {
  const { countdownString } = useCountdown(end, onEnd)
  return <Detail title={'Ends in'} content={countdownString} />
}

export const DaoCard = ({
  collectionAddress,
  chainId,
  tokenName,
  tokenImage,
  tokenId,
  collectionName,
  bid,
  endTime,
}: DaoCardProps) => {
  const isMounted = useIsMounted()
  const [isEnded, setIsEnded] = useState(false)

  const onEnd = () => {
    setIsEnded(true)
  }

  if (!isMounted) return null

  const isOver = !!endTime ? dayjs.unix(Date.now() / 1000) >= dayjs.unix(endTime) : true
  const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.id === chainId)

  return (
    <Link href={`/dao/${chain?.slug}/${collectionAddress}/${tokenId}`} prefetch={false}>
      <Box borderRadius="curved" height={'100%'} overflow="hidden">
        <Box
          backgroundColor="background2"
          width={'100%'}
          height={'auto'}
          aspectRatio={1 / 1}
          position="relative"
          className={daoImage}
        >
          <FallbackNextImage
            priority
            unoptimized
            fill
            srcList={getFetchableUrls(tokenImage)}
            sizes="100vw"
            alt={`${collectionName} image`}
          />
        </Box>

        <Box pt="x4" position={'relative'} overflow={'hidden'} className={title}>
          {!!tokenName && (
            <Flex width="100%" minW={'x0'}>
              <Box data-testid="token-name" px="x4" minW={'x0'}>
                <Box
                  mb={'x1'}
                  style={{ fontSize: 22 }}
                  fontWeight={'display'}
                  className={name}
                >
                  {tokenName}
                </Box>
              </Box>
            </Flex>
          )}

          {!!collectionName && (
            <Paragraph
              data-testid="collection-name"
              color={'text3'}
              mb={'x4'}
              px={'x4'}
              className={name}
            >
              {collectionName}
            </Paragraph>
          )}
        </Box>

        <Flex direction={'row'} width={'100%'} className={auction}>
          {isEnded || isOver ? (
            <Detail
              title={'Winning bid'}
              content={bid ? `${formatCryptoVal(bid)} ETH` : 'n/a'}
            />
          ) : (
            <>
              <Detail
                title={'Highest bid'}
                content={bid ? `${formatCryptoVal(bid)} ETH` : '0.00 ETH'}
              />
              <Countdown end={endTime} onEnd={onEnd} />
            </>
          )}
        </Flex>
      </Box>
    </Link>
  )
}
