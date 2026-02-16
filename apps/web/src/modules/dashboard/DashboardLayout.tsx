import { useScrollDirection } from '@buildeross/hooks/useScrollDirection'
import type { AddressType } from '@buildeross/types'
import { Box, Flex } from '@buildeross/zord'
import React, { ReactNode, useEffect, useMemo, useState } from 'react'

import * as styles from './DashboardLayout.css'
import { MobileBottomNav, type MobileTab } from './MobileBottomNav'
import { MobileCreateMenu } from './MobileCreateMenu'
import { MobileProfileView } from './MobileProfileView'

export const DashboardLayout = ({
  mainContent,
  sidebarContent,
  address,
  ensAvatar,
}: {
  mainContent: ReactNode
  sidebarContent: ReactNode
  address?: AddressType
  ensAvatar?: string
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>('feed')
  const scrollDirection = useScrollDirection()

  // Calculate sidebar top offset based on header visibility
  // Header is 80px tall and hidden when scrollDirection is 'down'
  const sidebarTopOffset = scrollDirection === 'down' ? 24 : 104 // 24px + 80px header

  // Reset to feed view when user disconnects
  useEffect(() => {
    if (!address) {
      setActiveTab('feed')
    }
  }, [address])

  // Determine what to show on mobile based on active tab
  const mobileContent = useMemo(() => {
    // Always show feed if not connected
    if (!address) {
      return mainContent
    }

    switch (activeTab) {
      case 'feed':
        return mainContent
      case 'create':
        return <MobileCreateMenu userAddress={address} />
      case 'profile':
        return <MobileProfileView sidebarContent={sidebarContent} />
      default:
        return mainContent
    }
  }, [activeTab, address, mainContent, sidebarContent])

  return (
    <Flex py={{ '@initial': 'x0', '@1024': 'x6' }} w={'100%'} justify="center">
      <Box w="100%" style={{ maxWidth: 1440 }}>
        {/* Header - only show on desktop
        <Flex
          justify="space-between"
          align="center"
          mb={'x8'}
          px={{ '@initial': 'x0', '@1024': 'x8' }}
          className={styles.desktopLayout}
        >
          <Text fontSize={35} fontWeight={'display'}>
            Dashboard
          </Text>
        </Flex> */}

        {/* Desktop: Two-column layout */}
        <Flex
          gap="x12"
          direction={{ '@initial': 'column', '@1024': 'row' }}
          px={{ '@initial': 'x0', '@1024': 'x8' }}
          className={styles.desktopLayout}
        >
          {/* Main content */}
          <Box flex="1" minW="x0">
            {mainContent}
          </Box>

          {/* Sidebar - desktop only */}
          <Box
            position="relative"
            className={styles.sidebar}
            style={{ top: `${sidebarTopOffset}px` }}
            data-header-visible={scrollDirection !== 'down'}
          >
            {sidebarContent}
          </Box>
        </Flex>

        {/* Mobile: Tab-based content */}
        <Box className={styles.mobileLayout}>{mobileContent}</Box>

        {/* Mobile bottom navigation - only show when connected */}
        {address && (
          <MobileBottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            address={address}
            ensAvatar={ensAvatar}
          />
        )}
      </Box>
    </Flex>
  )
}
