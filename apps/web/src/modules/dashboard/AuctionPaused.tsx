import { AddressType, Chain } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { atoms, Box, Flex, Icon, icons, Text } from '@buildeross/zord'
import Image from 'next/image'
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
  chain: Chain
  tokenAddress: AddressType
}

export const AuctionPaused = ({ name, tokenAddress, chain }: PausedType) => {
  const Paused = icons.pause
  const { getDaoLink } = useLinks()

  return (
    <Flex className={outerAuctionCard}>
      <Link className={auctionCardBrand} link={getDaoLink(chain.id, tokenAddress)}>
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
            {chain.icon && (
              <Image
                src={chain.icon}
                style={{
                  borderRadius: '12px',
                  maxHeight: '22px',
                  maxWidth: '22px',
                  objectFit: 'contain',
                }}
                alt=""
                height={22}
                width={22}
              />
            )}
            <Text fontSize={16} color="text3" ml={'x1'}>
              {chain.name}
            </Text>
          </Flex>
          <Text className={daoTokenName}>{name}</Text>
        </Box>
      </Link>
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
        <Link link={getDaoLink(chain.id, tokenAddress, "activity")}>
          <Box
            display={'inline-flex'}
            color="text3"
            mt={{ '@initial': 'x3', '@768': 'x1' }}
            fontSize={18}
            className={atoms({ textDecoration: 'underline' })}
          >
            View activity
          </Box>
        </Link>
      </Flex>
    </Flex>
  )
}
