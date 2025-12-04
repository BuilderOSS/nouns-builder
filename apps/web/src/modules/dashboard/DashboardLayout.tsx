import type { CHAIN_ID } from '@buildeross/types'
import { Box, Flex, Text } from '@buildeross/zord'
import React, { ReactNode, useState } from 'react'
import { useAccount } from 'wagmi'

import { MobileBottomNav, type MobileTab } from '../../components/MobileBottomNav'
import * as styles from './DashboardLayout.css'
import { MobileCreateMenu } from './MobileCreateMenu'
import { MobileProfileView } from './MobileProfileView'

export const DashboardLayout = ({
  mainContent,
  sidebarContent,
  chainIds,
}: {
  mainContent: ReactNode
  sidebarContent: ReactNode
  chainIds?: CHAIN_ID[]
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>('feed')
  const { address } = useAccount()

  // Determine what to show on mobile based on active tab
  const mobileContent = () => {
    switch (activeTab) {
      case 'feed':
        return mainContent
      case 'create':
        return <MobileCreateMenu userAddress={address} chainIds={chainIds} />
      case 'profile':
        return <MobileProfileView sidebarContent={sidebarContent} />
      default:
        return mainContent
    }
  }

  return (
    <Flex minH={'100vh'} py={'x6'} w={'100%'} justify="center">
      <Box w="100%" style={{ maxWidth: 1440 }}>
        {/* Header - only show on desktop */}
        <Flex
          justify="space-between"
          align="center"
          mb={'x8'}
          px={{ '@initial': 'x0', '@1024': 'x8' }}
          className={styles.desktopOnly}
        >
          <Text fontSize={35} fontWeight={'display'}>
            Dashboard
          </Text>
        </Flex>

        {/* Desktop: Two-column layout */}
        <Flex
          gap="x8"
          direction={{ '@initial': 'column', '@1024': 'row' }}
          px={{ '@initial': 'x0', '@1024': 'x8' }}
          className={styles.desktopLayout}
        >
          {/* Main content */}
          <Box flex="1" minW="x0">
            {mainContent}
          </Box>

          {/* Sidebar - desktop only */}
          <Box position="relative" className={styles.sidebar}>
            {sidebarContent}
          </Box>
        </Flex>

        {/* Mobile: Tab-based content */}
        <Box className={styles.mobileLayout}>{mobileContent()}</Box>

        {/* Mobile bottom navigation */}
        <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </Box>
    </Flex>
  )
}
