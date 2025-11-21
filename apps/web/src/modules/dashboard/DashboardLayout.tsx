import { Box, Button, Flex, Text } from '@buildeross/zord'
import React, { ReactNode, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import * as styles from './DashboardLayout.css'

export const DashboardLayout = ({
  mainContent,
  sidebarContent,
}: {
  mainContent: ReactNode
  sidebarContent: ReactNode
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { address } = useAccount()

  useEffect(() => {
    if (!address) {
      setIsSidebarOpen(false)
    }
  }, [address])

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      // Save original overflow value
      const originalOverflow = document.body.style.overflow
      // Lock scroll
      document.body.style.overflow = 'hidden'

      // Restore on cleanup
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isSidebarOpen])

  return (
    <Flex minH={'100vh'} py={'x6'} w={'100%'} justify="center">
      <Box w="100%" style={{ maxWidth: 1440 }}>
        {/* Header with title and mobile toggle */}
        <Flex
          justify="space-between"
          align="center"
          mb={'x12'}
          px={{ '@initial': 'x4', '@1024': 'x12' }}
        >
          <Text fontSize={35} fontWeight={'display'}>
            Dashboard
          </Text>
          {/* Mobile toggle button */}
          {address && (
            <Box className={styles.sidebarToggle}>
              <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                {isSidebarOpen ? 'Hide' : 'Show'} DAOs
              </Button>
            </Box>
          )}
        </Flex>

        {/* Main content area with two-column layout on desktop */}
        <Flex gap="x8" direction={{ '@initial': 'column', '@1024': 'row' }}>
          {/* Main content */}
          <Box flex="1" minW="x0">
            {mainContent}
          </Box>

          {/* Sidebar */}
          <Box
            position="relative"
            className={styles.sidebar}
            display={{
              '@initial': isSidebarOpen ? 'block' : 'none',
              '@1024': 'block',
            }}
          >
            {address && isSidebarOpen && (
              <Box className={styles.reversedSidebarToggle}>
                <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                  {isSidebarOpen ? 'Hide' : 'Show'} DAOs
                </Button>
              </Box>
            )}
            {sidebarContent}
          </Box>
        </Flex>
      </Box>
    </Flex>
  )
}
