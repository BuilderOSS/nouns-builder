import { Box, Text } from '@buildeross/zord'
import React from 'react'

import {
  activeTabButton,
  daoGrid,
  sectionInlineCopy,
  sectionInlineRow,
  sectionTitle,
  sectionTitleOnly,
  tabButton,
  tabs,
} from '../AboutPage.css'
import { AboutDaoTabKey, AboutDaoTabsResponse, AboutStat } from '../types'
import { DaoCard } from './DaoCard'
import { EcosystemStatGrid } from './EcosystemStatGrid'

type FeaturedDaoSectionProps = {
  tabsData?: AboutDaoTabsResponse
  stats?: AboutStat[]
  isLoading: boolean
}

const tabOrder: { id: AboutDaoTabKey; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'trending', label: 'Trending' },
  { id: 'new', label: 'New' },
  { id: 'active', label: 'Active' },
]

export const FeaturedDaoSection: React.FC<FeaturedDaoSectionProps> = ({
  tabsData,
  stats,
  isLoading: _isLoading,
}) => {
  const [tab, setTab] = React.useState<AboutDaoTabKey>('featured')

  const displayedDaos = React.useMemo(() => {
    return tabsData?.[tab] ?? []
  }, [tab, tabsData])

  return (
    <Box>
      <Text as="h2" className={`${sectionTitle} ${sectionTitleOnly}`}>
        A thriving ecosystem
      </Text>

      <Box className={sectionInlineRow}>
        <Text className={sectionInlineCopy}>
          Nouns Builder is already powering a growing network of decentralized
          communities.
        </Text>

        <Box className={tabs}>
          {tabOrder.map((item) => {
            const isActive = item.id === tab
            return (
              <button
                className={`${tabButton} ${isActive ? activeTabButton : ''}`}
                key={item.id}
                onClick={() => setTab(item.id)}
                type="button"
              >
                {item.label}
              </button>
            )
          })}
        </Box>
      </Box>

      <Box className={daoGrid}>
        {displayedDaos.map((dao) => (
          <DaoCard dao={dao} key={dao.id} />
        ))}
      </Box>

      <Box mt="x8">
        <EcosystemStatGrid stats={stats ?? []} />
      </Box>
    </Box>
  )
}
