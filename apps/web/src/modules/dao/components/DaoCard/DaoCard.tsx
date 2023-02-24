import { useCountdown } from 'src/hooks/useCountdown'
import { Box, Flex, Paragraph } from '@zoralabs/zord'
import Image from 'next/legacy/image'
import Link from 'next/link'
import React, { Fragment, useEffect, useState } from 'react'
import { auction, daoImage, name, title } from './DaoCard.css'
import { formatCryptoVal } from 'src/utils/numbers'
import { BigNumberish } from 'ethers'
import dayjs from 'dayjs'
import { Detail } from './Detail'
import { getFetchableUrl } from 'ipfs-service'
import { useIsMounted } from 'src/hooks/useIsMounted'

interface DaoCardProps {
  collectionAddress: string
  tokenName?: string
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
  tokenName,
  tokenImage,
  collectionName,
  bid,
  endTime,
}: DaoCardProps) => {
  const isMounted = useIsMounted()
  const [imgErr, setImgErr] = React.useState<boolean>(false)
  const [isEnded, setIsEnded] = useState(false)

  const onEnd = () => {
    setIsEnded(true)
  }

  if (!isMounted) return null

  const isOver = !!endTime ? dayjs.unix(Date.now() / 1000) >= dayjs.unix(endTime) : true

  return (
    <Link href={`/dao/${collectionAddress}`}>
      <Box borderRadius="curved" height={'100%'} overflow="hidden">
        <Box
          backgroundColor="background2"
          width={'100%'}
          height={'auto'}
          aspectRatio={1 / 1}
          position="relative"
          className={daoImage}
        >
          {!!tokenImage ? (
            <Image
              priority
              layout="fill"
              src={!imgErr ? getFetchableUrl(tokenImage) || '' : '/ImageError.svg'}
              onError={() => setImgErr(true)}
              sizes="100vw"
              alt={`${collectionName} image`}
            />
          ) : (
            <Image priority layout="fill" src={'/ImageError.svg'} alt={`Error image`} />
          )}
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
