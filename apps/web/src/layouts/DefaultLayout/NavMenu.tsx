import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import SWR_KEYS from '@buildeross/constants/swrKeys'
import { CHAIN_ID, Chain } from '@buildeross/types'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Flex, PopUp, Stack, Text } from '@buildeross/zord'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import useSWR from 'swr'
import { useAccount, useBalance, useDisconnect } from 'wagmi'

import { Avatar } from 'src/components/Avatar'
import { DaoAvatar } from 'src/components/Avatar/DaoAvatar'
import CopyButton from 'src/components/CopyButton/CopyButton'
import { Icon } from 'src/components/Icon'
import { NetworkController } from 'src/components/NetworkController'
import { MyDaosResponse } from 'src/data/subgraph/requests/daoQuery'
import { useBridgeModal } from 'src/hooks/useBridgeModal'
import { useEnsData } from 'src/hooks/useEnsData'
import { useLayoutStore } from 'src/stores'
import { useChainStore } from 'src/stores/useChainStore'

import { ConnectButton } from './ConnectButton'
import { CreateDaoButton } from './CreateDaoButton'
import {
  activeNavAvatar,
  chainPopUpButton,
  disconnectButton,
  myDaosWrapper,
  navButton,
  navMenuBurger,
} from './Nav.styles.css'
import { ViewProfileButton } from './ViewProfileButton'

const chainSorter = (a: Chain, b: Chain) => a.icon.localeCompare(b.icon)

export const NavMenu = () => {
  const [isOpenMenu, setIsOpenMenu] = React.useState(false)
  const [isOpenChainMenu, setIsOpenChainMenu] = React.useState(false)
  const [isChainInitilized, setIsChainInitilized] = React.useState(false)
  const isMobile = useLayoutStore((x) => x.isMobile)
  const [viewAll, setViewAll] = React.useState(false)
  const [activeDropdown, setActiveDropdown] = React.useState<
    'userMenu' | 'appMenu' | 'chainMenu' | undefined
  >(undefined)

  const router = useRouter()
  const { chain: selectedChain, setChain } = useChainStore()

  const { address } = useAccount()
  const { canUserBridge, openBridgeModal } = useBridgeModal()

  const { displayName, ensAvatar } = useEnsData(address as string)
  const { data: balance } = useBalance({
    address: address as `0x${string}`,
    chainId: selectedChain.id,
  })
  const { disconnect } = useDisconnect()
  const hasNetwork = !!router.query?.network

  const userBalance = balance?.formatted
    ? `${Number(formatCryptoVal(balance?.formatted)).toFixed(2)} ETH`
    : undefined

  const { data: myDaos } = useSWR(
    address ? [selectedChain.slug, SWR_KEYS.DYNAMIC.MY_DAOS(address as string)] : null,
    () => axios.get<MyDaosResponse>(`/api/daos/${address}`).then((x) => x.data),
    {
      revalidateOnFocus: false,
    }
  )

  const initMaxDaos = 3
  const viewableDaos = myDaos && myDaos.slice(0, viewAll ? myDaos.length : initMaxDaos)
  const hasMoreDaos = myDaos && myDaos.length > initMaxDaos ? true : false

  const onChainChange = (chainId: number) => {
    setActiveDropdown(undefined)
    const selected = PUBLIC_DEFAULT_CHAINS.find((x) => x.id === chainId)
    if (selected) setChain(selected)
  }

  const isSelectedChain = (chainId: CHAIN_ID) => selectedChain.id === chainId

  /*
    close dropdown on route change
   */
  React.useEffect(() => {
    const handleRouteChange = () => {
      setActiveDropdown(undefined)
    }

    router.events.on('routeChangeStart', handleRouteChange)

    const hasHydrated = useChainStore.persist.hasHydrated()
    let hydrationUnsubscribe: () => void | undefined

    if (hasHydrated) setIsChainInitilized(true)
    else {
      hydrationUnsubscribe = useChainStore.persist.onFinishHydration(() =>
        setIsChainInitilized(true)
      )
    }

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
      hydrationUnsubscribe?.()
    }
  }, [router])

  React.useEffect(() => {
    if (activeDropdown !== 'chainMenu') setIsOpenChainMenu(false)
  }, [activeDropdown, setIsOpenChainMenu])

  return (
    <Flex align={'center'} direction={'row'} gap={'x4'}>
      {isChainInitilized && (
        <Flex
          onClick={() => {
            !hasNetwork && setIsOpenChainMenu((bool) => !bool)
            setActiveDropdown('chainMenu')
          }}
          data-active={!!activeDropdown && activeDropdown !== 'chainMenu'}
        >
          <PopUp
            padding="x0"
            placement="bottom-end"
            close={!isOpenChainMenu}
            onOpenChange={(open) => {
              setIsOpenChainMenu(open)
              if (!open) {
                setViewAll(false)
                // if closing menu and not opening another
                if (activeDropdown === 'chainMenu') {
                  setActiveDropdown(undefined)
                }
              }
            }}
            trigger={
              <Flex
                borderColor="border"
                borderStyle="solid"
                backgroundColor="background1"
                borderRadius="curved"
                cursor={'pointer'}
                align={'center'}
                justify={'space-between'}
                height={'x10'}
                px="x2"
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
                  <Box h="x6" w="x6" ml="x1">
                    <Icon id="chevronDown" fill="tertiary" pointerEvents="none" />
                  </Box>
                </Flex>
              </Flex>
            }
          >
            <Stack my="x4" mx="x2">
              {PUBLIC_DEFAULT_CHAINS.sort(chainSorter).map((chain, i, chains) => (
                <Flex
                  key={chain.id}
                  className={chainPopUpButton}
                  borderRadius="normal"
                  onClick={() => !hasNetwork && onChainChange(chain.id)}
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
                      color={
                        hasNetwork && !isSelectedChain(chain.id) ? 'text3' : undefined
                      }
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
      )}
      {address && (
        <Flex
          className={navButton}
          onClick={() => setActiveDropdown('userMenu')}
          data-active={!!activeDropdown && activeDropdown !== 'userMenu'}
        >
          <PopUp
            padding="x0"
            trigger={
              <Flex cursor={'pointer'}>
                {activeDropdown === 'userMenu' && <Box className={activeNavAvatar} />}
                <Avatar address={address} src={ensAvatar} size={'40'} />
              </Flex>
            }
            close={activeDropdown !== 'userMenu'}
            onOpenChange={(open) => {
              if (!open) {
                // if closing menu and not opening another
                if (activeDropdown === 'userMenu') {
                  setActiveDropdown(undefined)
                }
              }
            }}
          >
            <Flex direction={'column'} p={'x4'} gap={'x4'} style={{ width: 264 }}>
              <ViewProfileButton />
              <CreateDaoButton />
              {myDaos && myDaos.length > 0 && (
                <Flex direction={'column'} gap={'x4'}>
                  <Flex direction={'row'} justify={'space-between'}>
                    <Text color="tertiary" fontWeight="paragraph">
                      My DAOs
                    </Text>
                    {hasMoreDaos && (
                      <Text
                        fontWeight={'display'}
                        cursor={'pointer'}
                        onClick={() => setViewAll((bool) => !bool)}
                      >
                        {!viewAll ? 'View All' : 'View Less'}
                      </Text>
                    )}
                  </Flex>

                  <Flex direction={'column'} gap={'x4'} className={myDaosWrapper}>
                    {viewableDaos?.map((dao, index) => (
                      <Link
                        key={dao.collectionAddress}
                        href={`/dao/${
                          PUBLIC_DEFAULT_CHAINS.find((x) => x.id === dao.chainId)?.slug
                        }/${dao.collectionAddress}`}
                        passHref
                        legacyBehavior
                      >
                        <a>
                          <Flex
                            key={index}
                            direction={'row'}
                            align={'center'}
                            cursor={'pointer'}
                            id={`close-modal-${index}`}
                          >
                            <DaoAvatar
                              collectionAddress={dao.collectionAddress}
                              size={'40'}
                              auctionAddress={dao.auctionAddress}
                              chainId={dao.chainId}
                            />
                            <Text ml="x2" fontWeight={'display'}>
                              {dao.name}
                            </Text>
                          </Flex>
                        </a>
                      </Link>
                    ))}
                  </Flex>
                </Flex>
              )}
              <Box color="border" borderStyle="solid" borderWidth="thin" />
              <Flex
                direction={'row'}
                align={'center'}
                justify={'space-between'}
                w={'100%'}
              >
                <Flex direction={'row'} align={'center'} cursor={'pointer'}>
                  <Avatar address={address} src={ensAvatar} size={'40'} />
                  <Flex direction={'column'} ml={'x2'}>
                    <Text fontWeight={'display'}>{displayName}</Text>
                    <Text variant={'paragraph-md'} color={'tertiary'}>
                      {userBalance}
                    </Text>
                  </Flex>
                </Flex>
                <CopyButton text={address as string} />
              </Flex>

              <button
                className={disconnectButton}
                onClick={() => disconnect()}
                id={'close-modal'}
              >
                Disconnect
              </button>
            </Flex>
          </PopUp>
        </Flex>
      )}
      {!address && !isMobile && (
        <Box style={{ width: 110 }}>
          <ConnectButton />
        </Box>
      )}
      <Flex
        className={navButton}
        display={{ '@initial': 'flex', '@768': 'none' }}
        onClick={() => {
          setIsOpenMenu((bool) => !bool)
          setActiveDropdown('appMenu')
        }}
        data-active={!!activeDropdown && activeDropdown !== 'appMenu'}
      >
        <PopUp
          padding="x0"
          trigger={
            <Flex align={'center'}>
              <Flex
                w={'x10'}
                h={'x10'}
                align={'center'}
                justify={'center'}
                className={navMenuBurger}
                backgroundColor={isOpenMenu ? 'ghostHover' : 'background1'}
              >
                <Icon id="burger" />
              </Flex>
            </Flex>
          }
          close={activeDropdown !== 'appMenu'}
          onOpenChange={(open) => {
            setIsOpenMenu(open)
            if (!open) {
              setViewAll(false)
              // if closing menu and not opening another
              if (activeDropdown === 'appMenu') {
                setActiveDropdown(undefined)
              }
            }
          }}
        >
          <Flex direction={'column'} p={'x4'} gap={'x2'} style={{ width: 264 }}>
            <ConnectButton />
            <Flex direction={'column'} gap={'x2'}>
              <Link href={'/about'}>
                <Flex display="flex" align="center" justify={'center'} py={'x2'}>
                  <Text cursor={'pointer'} fontWeight={'display'}>
                    About
                  </Text>
                </Flex>
              </Link>
              <Link href={'/dashboard'}>
                <Flex display="flex" align="center" justify={'center'} py={'x2'}>
                  <Text cursor={'pointer'} fontWeight={'display'}>
                    Dashboard
                  </Text>
                </Flex>
              </Link>
              <Link href={'/explore'}>
                <Flex display="flex" align="center" justify={'center'} py={'x2'}>
                  <Text cursor={'pointer'} fontWeight={'display'}>
                    Explore
                  </Text>
                </Flex>
              </Link>
              <a
                href="https://builder-docs.vercel.app/"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Flex display="flex" align="center" justify={'center'} py={'x2'}>
                  <Text cursor={'pointer'} fontWeight={'display'}>
                    Docs
                  </Text>
                </Flex>
              </a>
              <NetworkController.Mainnet>
                {canUserBridge ? (
                  <Box as="span" onClick={openBridgeModal}>
                    <Flex display="flex" align="center" justify={'center'} py={'x2'}>
                      <Text cursor={'pointer'} fontWeight={'display'}>
                        Bridge
                      </Text>
                    </Flex>
                  </Box>
                ) : (
                  <Link href={'/bridge'}>
                    <Flex display="flex" align="center" justify={'center'} py={'x2'}>
                      <Text cursor={'pointer'} fontWeight={'display'}>
                        Bridge
                      </Text>
                    </Flex>
                  </Link>
                )}
              </NetworkController.Mainnet>
              <Box
                color="border"
                borderStyle="solid"
                borderWidth="thin"
                style={{ margin: '-4px 0px' }}
              />
            </Flex>

            {/* Network Switch */}
            <NetworkController.Testnet>
              <Flex
                as={'a'}
                href="https://nouns.build"
                target="_blank"
                rel="canonical"
                id={'close-modal'}
                align={'center'}
                justify={'center'}
              >
                <Flex align={'center'} py={'x2'}>
                  <Text fontWeight={'display'} fontSize={16}>
                    Mainnet
                  </Text>
                  <Icon fill="text4" size="sm" ml="x2" id="external-16" />
                </Flex>
              </Flex>
            </NetworkController.Testnet>

            <NetworkController.Mainnet>
              <Flex
                as={'a'}
                href="https://testnet.nouns.build"
                target="_blank"
                rel="nofollow"
                id={'close-modal'}
                align={'center'}
                justify={'center'}
              >
                <Flex align={'center'} py={'x2'}>
                  <Text fontWeight={'display'} fontSize={16}>
                    Testnet
                  </Text>
                  <Icon fill="text4" size="sm" ml="x2" id="external-16" />
                </Flex>
              </Flex>
            </NetworkController.Mainnet>
          </Flex>
        </PopUp>
      </Flex>
    </Flex>
  )
}
