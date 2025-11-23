import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { useWalletDisconnect } from '@buildeross/hooks/useWalletDisconnect'
import { useChainStore } from '@buildeross/stores'
import { CHAIN_ID } from '@buildeross/types'
import { Box, Flex, Icon, PopUp, Stack, Text } from '@buildeross/zord'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'

import { chainPopUpButton, navButton, wrongNetworkButton } from '../Nav.styles.css'
import { MenuType } from './types'

interface ChainMenuProps {
  activeDropdown: MenuType | undefined
  onOpenMenu: (open: boolean, menuType: MenuType) => void
  onSetActiveDropdown: (menu: MenuType | undefined) => void
}

export const ChainMenu: React.FC<ChainMenuProps> = ({
  activeDropdown,
  onOpenMenu,
  onSetActiveDropdown,
}) => {
  const [isChainInitialized, setIsChainInitialized] = React.useState(false)
  const router = useRouter()
  const { address, chain: wagmiChain, connector } = useAccount()
  const { switchChain } = useSwitchChain()
  const onDisconnect = useWalletDisconnect()

  const { chain: selectedChain, setChain, hasHydrated } = useChainStore()

  const hasNetwork = useMemo(() => !!router.query?.network, [router.query])

  const onSwitchChain = useCallback(
    (chainId: number) => {
      if (!connector?.getChainId) return onDisconnect()
      switchChain(
        { chainId },
        {
          onError(error) {
            console.error(`Failed to switch chain:`, error)
          },
        }
      )
    },
    [switchChain, onDisconnect, connector]
  )

  const onChainChange = useCallback(
    (chainId: number) => {
      if (hasNetwork) {
        return
      }
      onSetActiveDropdown(undefined)
      const selected = PUBLIC_DEFAULT_CHAINS.find((x) => x.id === chainId)
      if (selected) setChain(selected)
      if (address) {
        onSwitchChain(chainId)
      }
    },
    [onSetActiveDropdown, setChain, hasNetwork, onSwitchChain, address]
  )

  const isSelectedChain = useCallback(
    (chainId: CHAIN_ID) => selectedChain.id === chainId,
    [selectedChain.id]
  )

  const isWrongNetwork = useMemo(
    () => hasNetwork && !!address && wagmiChain?.id !== selectedChain.id,
    [address, wagmiChain?.id, selectedChain.id, hasNetwork]
  )

  // Handle route change start events
  useEffect(() => {
    const handleRouteChangeStart = () => {
      onSetActiveDropdown(undefined)
      setIsChainInitialized(false)
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
    }
  }, [router, onSetActiveDropdown])

  // Handle route change completion and initial hydration
  useEffect(() => {
    if (!hasHydrated) return

    const handleRouteChangeComplete = () => {
      if (selectedChain) {
        switchChain(
          { chainId: selectedChain.id },
          {
            onError(error) {
              console.error(`Failed to automatically switch chain:`, error)
            },
          }
        )
      }
      setIsChainInitialized(true)
    }

    handleRouteChangeComplete()
    router.events.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [router, hasHydrated, selectedChain, switchChain])

  if (!hasHydrated || !isChainInitialized) {
    return null
  }

  return (
    <Flex
      className={navButton}
      onClick={() => {
        onSetActiveDropdown(MenuType.CHAIN_MENU)
      }}
      data-active={!!activeDropdown && activeDropdown !== MenuType.CHAIN_MENU}
    >
      <PopUp
        padding="x0"
        placement="bottom-end"
        close={activeDropdown !== MenuType.CHAIN_MENU}
        onOpenChange={(open) => onOpenMenu(open, MenuType.CHAIN_MENU)}
        trigger={
          <Flex
            borderColor="border"
            borderStyle="solid"
            borderWidth="normal"
            backgroundColor="background1"
            borderRadius="curved"
            cursor={'pointer'}
            align={'center'}
            justify={'space-between'}
            height={'x10'}
            px="x2"
            className={chainPopUpButton}
            style={isWrongNetwork ? { borderColor: '#F03232' } : undefined}
          >
            <Flex align={'center'}>
              <Box h="x6" w="x6">
                <Image
                  priority={true}
                  quality={100}
                  style={{ height: 24, width: 24 }}
                  src={selectedChain.icon}
                  alt={selectedChain.name}
                />
              </Box>
              <Flex display={{ '@initial': 'none', '@768': 'flex' }}>
                <Text fontWeight={'heading'} ml="x2">
                  {selectedChain.name}
                </Text>
              </Flex>
              <Box h="x6" w="x6" ml="x2">
                <Icon id={'chevronDown'} fill={'tertiary'} pointerEvents="none" />
              </Box>
            </Flex>
          </Flex>
        }
      >
        <Stack my="x4" mx="x2">
          {isWrongNetwork && selectedChain && (
            <Flex
              className={wrongNetworkButton}
              fontWeight={'label'}
              borderRadius="normal"
              onClick={() => onSwitchChain(selectedChain.id)}
              cursor={'pointer'}
              height={'x10'}
              px="x4"
              mb="x2"
              align={'center'}
              justify={'center'}
            >
              {`Switch to ${selectedChain.name}`}
            </Flex>
          )}
          {PUBLIC_DEFAULT_CHAINS.map((chain, i, chains) => (
            <Flex
              key={chain.id}
              className={chainPopUpButton}
              borderRadius="normal"
              onClick={() => onChainChange(chain.id)}
              cursor={
                hasNetwork
                  ? isSelectedChain(chain.id)
                    ? undefined
                    : 'not-allowed'
                  : 'pointer'
              }
              height={'x10'}
              px="x4"
              mb={i !== chains.length - 1 ? 'x2' : undefined}
              align={'center'}
              justify={'space-between'}
            >
              <Flex align={'center'}>
                <Box h="x6" w="x6" mr="x2">
                  <Image
                    style={{ height: 24, width: 24 }}
                    src={chain.icon}
                    alt={chain.name}
                  />
                </Box>
                <Text
                  fontWeight={'heading'}
                  color={hasNetwork && !isSelectedChain(chain.id) ? 'text3' : undefined}
                >
                  {chain.name}
                </Text>
              </Flex>
              <Icon
                id="check"
                fill="tertiary"
                ml="x10"
                style={{
                  visibility: selectedChain.id === chain.id ? 'visible' : 'hidden',
                }}
              />
            </Flex>
          ))}
        </Stack>
      </PopUp>
    </Flex>
  )
}
