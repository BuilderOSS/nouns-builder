import { tokenAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { DaoAvatar } from '@buildeross/ui/Avatar'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { Box, Flex, Icon, Text } from '@buildeross/zord'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

import { useSettingsAccess } from '@/hooks/useSettingsAccess'
import {
  connectButtonWrapper,
  headerContainer,
  logoSection,
  mobileMenuButton,
  mobileMenuContent,
  mobileMenuOverlay,
  navLink,
  navLinkActive,
  navLinks,
} from './Header.css'

export const Header: React.FC = () => {
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const { hasAccess: hasSettingsAccess } = useSettingsAccess()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const router = useRouter()

  const { data: contractData } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        abi: tokenAbi,
        address: addresses.token as Address,
        chainId: chain.id,
        functionName: 'name',
      },
    ] as const,
  })

  const [daoName] = unpackOptionalArray(contractData, 1)

  const isActiveRoute = (path: string) => {
    if (path === '/' && router.pathname === '/') return true
    if (path !== '/' && router.pathname.startsWith(path)) return true
    return false
  }

  const getLinkClassName = (path: string) => {
    return isActiveRoute(path) ? `${navLink} ${navLinkActive}` : navLink
  }

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
              {daoName || 'DAO'}
            </Text>
          </Flex>
        </Link>

        {/* Right side - Navigation links and Connect button */}
        <Flex align="center" gap="x6">
          {/* Navigation links - hidden on mobile */}
          <Flex align="center" gap="x6" className={navLinks}>
            <Link href="/about" passHref>
              <Text className={getLinkClassName('/about')} fontWeight="display">
                About
              </Text>
            </Link>
            <Link href="/proposals" passHref>
              <Text className={getLinkClassName('/proposals')} fontWeight="display">
                Proposals
              </Text>
            </Link>
            <Link href="/treasury" passHref>
              <Text className={getLinkClassName('/treasury')} fontWeight="display">
                Treasury
              </Text>
            </Link>
            <Link href="/contracts" passHref>
              <Text className={getLinkClassName('/contracts')} fontWeight="display">
                Contracts
              </Text>
            </Link>
            {hasSettingsAccess && (
              <Link href="/settings" passHref>
                <Text className={getLinkClassName('/settings')} fontWeight="display">
                  Settings
                </Text>
              </Link>
            )}
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
                  className={getLinkClassName('/about')}
                  fontWeight="display"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Text>
              </Link>
              <Link href="/proposals" passHref>
                <Text
                  className={getLinkClassName('/proposals')}
                  fontWeight="display"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Proposals
                </Text>
              </Link>
              <Link href="/treasury" passHref>
                <Text
                  className={getLinkClassName('/treasury')}
                  fontWeight="display"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Treasury
                </Text>
              </Link>
              <Link href="/contracts" passHref>
                <Text
                  className={getLinkClassName('/contracts')}
                  fontWeight="display"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contracts
                </Text>
              </Link>
              {hasSettingsAccess && (
                <Link href="/settings" passHref>
                  <Text
                    className={getLinkClassName('/settings')}
                    fontWeight="display"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </Text>
                </Link>
              )}
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
