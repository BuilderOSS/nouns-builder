import { FallbackImage } from '@buildeross/ui'
import { Box, Flex, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import {
  cardLink,
  daoAvatar,
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
  return (
    <Box className={daoCard}>
      <Box className={daoTop}>
        <Flex className={daoIdentity}>
          <Box
            className={daoAvatar}
            style={{ background: dao.surface, color: dao.textAccent }}
          >
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
            <Text className={daoDescription}>{dao.description}</Text>
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

      <Link className={cardLink} href={dao.href}>
        View DAO
      </Link>
    </Box>
  )
}
