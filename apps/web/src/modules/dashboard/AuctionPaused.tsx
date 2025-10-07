import { atoms, Box, Flex, Icon, icons, Text } from '@buildeross/zord'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

import { DashboardDaoProps } from './Dashboard'
import {
  auctionCardBrand,
  bidBox,
  daoAvatarBox,
  daoTokenName,
  outerAuctionCard,
  stats,
  statsBox,
} from './dashboard.css'

type PausedType = DashboardDaoProps & {
  chainName?: string
  chainIcon?: string
  currentChainSlug?: string
  tokenAddress: string
}

export const AuctionPaused = ({
  currentChainSlug,
  tokenAddress,
  chainName,
  name,
  chainIcon,
}: PausedType) => {
  const { push } = useRouter()
  const Paused = icons.pause

  const handleSelectAuction = () => {
    push(`/dao/${currentChainSlug}/${tokenAddress}`)
  }
  return (
    <Flex className={outerAuctionCard}>
      <Flex className={auctionCardBrand} onClick={handleSelectAuction}>
        <Flex
          width="x16"
          height="x16"
          position="relative"
          overflow="hidden"
          align="center"
          justify="center"
          borderRadius="curved"
          backgroundColor="background2"
          className={daoAvatarBox}
        >
          <Paused
            height={'24px'}
            width={'24px'}
            style={{ position: 'absolute' }}
            fill="grey"
          />
        </Flex>
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
          <Text className={daoTokenName}>{name}</Text>
        </Box>
      </Flex>
      <Flex className={statsBox}>
        <Box className={stats}>
          <Text fontSize={16} color="text3" mb={'x1'}>
            Current Bid
          </Text>
          <Text fontSize={18} fontWeight="label">
            N/A
          </Text>
        </Box>
        <Box className={stats}>
          <Text fontSize={16} color="text3" mb={'x1'}>
            Ends In
          </Text>
          <Text fontSize={18} fontWeight="label">
            N/A
          </Text>
        </Box>
      </Flex>
      <Flex
        className={bidBox}
        align={{ '@initial': 'flex-start', '@768': 'center' }}
        direction={'column'}
      >
        <Flex align={'center'} mt={{ '@initial': 'x3', '@768': 'x0' }}>
          <Icon id={'warning'} fill={'text3'} />
          <Text color="text3" fontSize={18} ml="x1">
            Auctions are paused.
          </Text>
        </Flex>
        <Link href={`/dao/${currentChainSlug}/${tokenAddress}?tab=activity`}>
          <Box
            display={'inline-flex'}
            color="text3"
            mt={{ '@initial': 'x3', '@768': 'x1' }}
            fontSize={18}
            className={atoms({ textDecoration: 'underline' })}
          >
            See activity
          </Box>
        </Link>
      </Flex>
    </Flex>
  )
}
