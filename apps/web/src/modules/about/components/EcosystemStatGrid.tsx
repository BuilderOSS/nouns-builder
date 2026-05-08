import { Box, Text } from '@buildeross/zord'
import React from 'react'

import {
  statAccent,
  statAccentAuction,
  statAccentDao,
  statAccentMembers,
  statAccentProposal,
  statAccentTokens,
  statAccentTreasury,
  statCard,
  statDetail,
  statGrid,
  statLabel,
  statValue,
} from '../AboutPage.css'
import { AboutStat } from '../types'

type EcosystemStatGridProps = {
  stats: AboutStat[]
}

export const EcosystemStatGrid: React.FC<EcosystemStatGridProps> = ({ stats }) => {
  const getAccentClass = (id: string) => {
    switch (id) {
      case 'daos':
        return statAccentDao
      case 'treasury':
        return statAccentTreasury
      case 'auctions':
        return statAccentAuction
      case 'proposals':
        return statAccentProposal
      case 'members':
        return statAccentMembers
      case 'tokens':
        return statAccentTokens
      default:
        return statAccentDao
    }
  }

  return (
    <Box className={statGrid}>
      {stats.map((stat) => (
        <Box className={statCard} key={stat.id}>
          <Box className={`${statAccent} ${getAccentClass(stat.id)}`}>
            {stat.icon}
          </Box>
          <Text className={statLabel}>{stat.label}</Text>
          <Text className={statValue}>{stat.value}</Text>
          <Text className={statDetail}>{stat.detail}</Text>
        </Box>
      ))}
    </Box>
  )
}
