import { AddressType, Chain } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { atoms, Box, Flex, Icon, icons, Text } from '@buildeross/zord'
import Image from 'next/image'
import React from 'react'

import { DashboardDaoProps } from './Dashboard'
import { bidBox, daoAvatarBox, daoTokenName, outerAuctionCard } from './dashboard.css'

type PausedType = DashboardDaoProps & {
  chain: Chain
  tokenAddress: AddressType
}

export const AuctionPaused = ({ name, tokenAddress, chain }: PausedType) => {
  const Paused = icons.pause
  const { getDaoLink } = useLinks()

  return (
    <Flex className={outerAuctionCard} direction="column" align="stretch">
      <Link link={getDaoLink(chain.id, tokenAddress)} style={{ width: '100%' }}>
        <Flex align="center" gap="x3" mb="x3">
          <Flex
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
          <Flex align="center" justify="space-between" flex="1" style={{ minWidth: 0 }}>
            <Box style={{ minWidth: 0 }}>
              <Text className={daoTokenName}>{name}</Text>
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
      <Flex className={bidBox} direction="column" gap="x2">
        <Flex align="center">
          <Icon id="warning" fill="text3" />
          <Text color="text3" fontSize={14} ml="x1">
            Auctions are paused.
          </Text>
        </Flex>
        <Link link={getDaoLink(chain.id, tokenAddress, 'activity')}>
          <Box
            display="inline-flex"
            color="text3"
            fontSize={14}
            className={atoms({ textDecoration: 'underline' })}
          >
            View activity
          </Box>
        </Link>
      </Flex>
    </Flex>
  )
}
