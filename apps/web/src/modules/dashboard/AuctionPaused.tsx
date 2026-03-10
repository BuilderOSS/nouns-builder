import { AddressType, Chain } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { atoms, Box, Button, Flex, Icon, icons, Text } from '@buildeross/zord'
import Image from 'next/image'
import React from 'react'

import { DashboardDaoProps } from './Dashboard'
import { bidBox, daoAvatarBox, daoTokenName, outerAuctionCard } from './dashboard.css'

type PausedType = DashboardDaoProps & {
  chain: Chain
  tokenAddress: AddressType
  isHidden: boolean
  isPinned: boolean
  pinLimitReached: boolean
  onTogglePin: () => void
  onToggleHidden: () => void
}

export const AuctionPaused = ({
  name,
  tokenAddress,
  chain,
  isHidden,
  isPinned,
  pinLimitReached,
  onTogglePin,
  onToggleHidden,
}: PausedType) => {
  const Paused = icons.pause
  const { getDaoLink } = useLinks()

  return (
    <Flex
      className={outerAuctionCard}
      direction="column"
      align="stretch"
      style={{ position: 'relative' }}
    >
      <Flex
        align="center"
        gap="x1"
        style={{ position: 'absolute', right: '12px', top: '12px' }}
      >
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

      <Link link={getDaoLink(chain.id, tokenAddress)} style={{ width: '100%' }}>
        <Flex align="center" gap="x2" mb="x3" w="100%" justify="space-between">
          <Flex align="center" gap="x2">
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
            <Flex align="center" flex="1" style={{ minWidth: 0 }}>
              <Text className={daoTokenName}>{name}</Text>
            </Flex>
          </Flex>
        </Flex>
      </Link>

      <Flex justify="flex-end" align="center" gap="x1" mb="x1">
        <Button
          variant="ghost"
          size="xs"
          p="x0"
          onClick={onTogglePin}
          disabled={!isPinned && pinLimitReached}
          title={isPinned ? 'Unpin from top' : pinLimitReached ? 'Pin limit reached (3)' : 'Pin to top'}
          aria-label={`${isPinned ? 'Unpin' : 'Pin'} ${name} ${isPinned ? 'from' : 'to'} top`}
        >
          <Icon id="pin" size="sm" fill={isPinned ? 'primary' : 'text3'} />
        </Button>
        <Button
          variant="ghost"
          size="xs"
          p="x0"
          onClick={onToggleHidden}
          title={isHidden ? 'Unpin from shortlist' : 'Pin to shortlist'}
          aria-label={`${isHidden ? 'Unpin' : 'Pin'} ${name} ${isHidden ? 'from' : 'to'} shortlist`}
        >
          <Icon id={isHidden ? 'plus' : 'dash'} size="sm" />
        </Button>
      </Flex>

      <Flex
        className={bidBox}
        gap="x2"
        direction="row"
        justify="space-between"
        align="center"
      >
        <Flex align="center">
          <Icon id="warning" fill="text3" size="sm" />
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


