import type { AddressType } from '@buildeross/types'
import { Avatar } from '@buildeross/ui'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import { profileCard, profileInfo, statsRow } from './UserProfileCard.css'

export interface UserProfileCardProps {
  address: AddressType
  ensName?: string
  ensAvatar?: string
  daoCount: number
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  address,
  ensName,
  ensAvatar,
  daoCount,
}) => {
  const displayName = ensName || `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <Box as={Link} className={profileCard} href={`/profile/${address}`}>
      <Flex gap="x3" align="center">
        <Avatar address={address} src={ensAvatar} size="48" />
        <Stack className={profileInfo} gap="x1">
          <Text fontSize="18" fontWeight="label">
            {displayName}
          </Text>
          {daoCount >= 0 && (
            <Text fontSize="14" color="text3" className={statsRow}>
              Member of {daoCount} DAO{daoCount !== 1 ? 's' : ''}
            </Text>
          )}
        </Stack>
      </Flex>
    </Box>
  )
}
