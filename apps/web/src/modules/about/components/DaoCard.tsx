import { FallbackImage, MarkdownDisplay } from '@buildeross/ui'
import { Box, Flex, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import {
  cardLink,
  daoAvatar,
  daoAvatarSurfaceA,
  daoAvatarSurfaceB,
  daoAvatarSurfaceC,
  daoAvatarSurfaceD,
  daoAvatarImage,
  daoCard,
  daoChainBadge,
  daoChainBadgeImage,
  daoDescription,
  daoIdentity,
  daoName,
  daoSignal,
  daoSignalLabel,
  daoSignalValue,
  daoTop,
} from '../AboutPage.css'
import { AboutDao } from '../types'

type DaoCardProps = {
  dao: AboutDao
}

export const DaoCard: React.FC<DaoCardProps> = ({ dao }) => {
  const avatarSurfaceClass =
    [daoAvatarSurfaceA, daoAvatarSurfaceB, daoAvatarSurfaceC, daoAvatarSurfaceD][
      Number(dao.id.replace(/\D/g, '')) % 4 || 0
    ]

  return (
    <Link aria-label={`View ${dao.name}`} className={daoCard} href={dao.href}>
      <Box className={daoTop}>
        <Flex className={daoIdentity}>
          <Box className={`${daoAvatar} ${avatarSurfaceClass}`}>
            {dao.imageUrl ? (
              <FallbackImage
                alt={`${dao.name} logo`}
                className={daoAvatarImage}
                src={dao.imageUrl}
              />
            ) : (
              dao.initials
            )}
          </Box>
          <Box>
            <Text className={daoName}>{dao.name}</Text>
            <Box className={daoDescription}>
              <MarkdownDisplay disableLinks>{dao.description}</MarkdownDisplay>
            </Box>
          </Box>
        </Flex>
        {dao.chainIcon ? (
          <Box className={daoChainBadge} title={dao.chainName || undefined}>
            <Box
              as="img"
              alt={dao.chainName ? `${dao.chainName} logo` : 'Network logo'}
              className={daoChainBadgeImage}
              src={dao.chainIcon}
            />
          </Box>
        ) : null}
      </Box>

      <Box className={daoSignal}>
        <Text className={daoSignalLabel}>{dao.signalLabel}</Text>
        <Text className={daoSignalValue}>{dao.signalValue}</Text>
      </Box>

      <Text as="span" className={cardLink}>
        View DAO
      </Text>
    </Link>
  )
}
