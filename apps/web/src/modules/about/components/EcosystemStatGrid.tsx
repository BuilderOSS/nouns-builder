import { Box, Text } from '@buildeross/zord'
import React from 'react'

import {
  statAccent,
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
  return (
    <Box className={statGrid}>
      {stats.map((stat) => (
        <Box className={statCard} key={stat.id}>
          <Box className={statAccent} style={{ background: stat.accent }}>
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
