import { useChainStore, useDaoStore } from '@buildeross/stores'
import { DaoAvatar } from '@buildeross/ui/Avatar'
import { Box, Flex, Icon, Text } from '@buildeross/zord'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import React from 'react'

import {
  connectButtonWrapper,
  headerContainer,
  logoSection,
  mobileMenuButton,
  mobileMenuContent,
  mobileMenuOverlay,
  navLink,
  navLinks,
} from './Header.css'

export const Header: React.FC = () => {
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <Box className={headerContainer}>
      <Flex align="center" justify="space-between" w="100%" px="x4" py="x3">
        {/* Left side - DAO Logo and Home link */}
        <Link href="/" passHref>
          <Flex align="center" gap="x3" className={logoSection}>
            {addresses.token && addresses.auction && (
              <Box style={{ width: '40px', height: '40px' }}>
                <DaoAvatar
                  collectionAddress={addresses.token}
                  size="40"
                  auctionAddress={addresses.auction}
                  chainId={chain.id}
                />
              </Box>
            )}
            <Text fontWeight="display" fontSize={20}>
              DAO
            </Text>
          </Flex>
        </Link>

        {/* Right side - Navigation links and Connect button */}
        <Flex align="center" gap="x6">
          {/* Navigation links - hidden on mobile */}
          <Flex align="center" gap="x6" className={navLinks}>
            <Link href="/about" passHref>
              <Text className={navLink} fontWeight="display">
                About
              </Text>
            </Link>
            <Link href="/proposals" passHref>
              <Text className={navLink} fontWeight="display">
                Proposals
              </Text>
            </Link>
            <Link href="/treasury" passHref>
              <Text className={navLink} fontWeight="display">
                Treasury
              </Text>
            </Link>
          </Flex>

          {/* Connect button - hidden on mobile */}
          <Box className={connectButtonWrapper}>
            <ConnectButton />
          </Box>

          {/* Mobile menu button - only visible on mobile */}
          <Box
            className={mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Icon id={isMobileMenuOpen ? 'cross' : 'burger'} />
          </Box>
        </Flex>
      </Flex>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <>
          <Box className={mobileMenuOverlay} onClick={() => setIsMobileMenuOpen(false)} />
          <Box className={mobileMenuContent}>
            <Flex direction="column" gap="x4" p="x6">
              <Link href="/about" passHref>
                <Text
                  className={navLink}
                  fontWeight="display"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Text>
              </Link>
              <Link href="/proposals" passHref>
                <Text
                  className={navLink}
                  fontWeight="display"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Proposals
                </Text>
              </Link>
              <Link href="/treasury" passHref>
                <Text
                  className={navLink}
                  fontWeight="display"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Treasury
                </Text>
              </Link>
              <Box mt="x4">
                <ConnectButton />
              </Box>
            </Flex>
          </Box>
        </>
      )}
    </Box>
  )
}
