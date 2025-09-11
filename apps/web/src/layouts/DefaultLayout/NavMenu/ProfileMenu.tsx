import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { MOBILE_PROFILE_MENU_LAYER, NAV_BUTTON_LAYER } from '@buildeross/constants/layers'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { MyDaosResponse } from '@buildeross/sdk/subgraph'
import { Avatar, CopyButton, DaoAvatar, NetworkController } from '@buildeross/ui'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Button, Flex, Icon, PopUp, Text } from '@buildeross/zord'
import axios from 'axios'
import Link from 'next/link'
import React from 'react'
import { useLayoutStore } from 'src/stores'
import { useChainStore } from 'src/stores/useChainStore'
import useSWR from 'swr'
import { useBalance, useDisconnect } from 'wagmi'

import { ConnectButton } from '../ConnectButton'
import {
  activeNavAvatar,
  daoButton,
  disconnectButton,
  mobileMenuSlideIn,
  myDaosWrapper,
  navButton,
  navMenuBurger,
  profileRow,
} from '../Nav.styles.css'
import { MenuType } from './types'

interface ProfileMenuProps {
  address?: `0x${string}`
  activeDropdown: MenuType | undefined
  onOpenMenu: (open: boolean, menuType: MenuType) => void
  onSetActiveDropdown: (menu: MenuType | undefined) => void
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  address,
  activeDropdown,
  onOpenMenu,
  onSetActiveDropdown,
}) => {
  const isMobile = useLayoutStore((x) => x.isMobile)
  const { chain: selectedChain } = useChainStore()
  const { displayName, ensAvatar } = useEnsData(address || '')
  const { data: balance } = useBalance({
    address: address!,
    chainId: selectedChain.id,
  })
  const { disconnectAsync } = useDisconnect()

  const userBalance = balance?.formatted
    ? `${formatCryptoVal(balance?.formatted)} ETH`
    : undefined

  const { data: userDaos } = useSWR(
    address ? [selectedChain.slug, SWR_KEYS.DYNAMIC.MY_DAOS(address)] : null,
    () => axios.get<MyDaosResponse>(`/api/daos/${address}`).then((x) => x.data),
    {
      revalidateOnFocus: false,
    }
  )

  const viewableDaos = userDaos || []

  const handleOpenMenu = React.useCallback(
    (open: boolean) => {
      onOpenMenu(open, MenuType.PROFILE_MENU)
    },
    [onOpenMenu]
  )

  React.useEffect(() => {
    if (isMobile && activeDropdown === MenuType.PROFILE_MENU) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, activeDropdown])

  const onDisconnect = React.useCallback(() => {
    disconnectAsync().catch((e) => {
      console.error(`Failed to disconnect: ${e}`)
    })
  }, [disconnectAsync])

  const renderUserContent = (isMobileFullscreen = false) => (
    <>
      <Link href="/create" passHref style={{ width: '100%' }}>
        <Button id={'close-modal'} w={'100%'}>
          Create a DAO
        </Button>
      </Link>
      {viewableDaos.length > 0 && (
        <>
          <Box color="border" borderStyle="solid" borderWidth="thin" />
          <Flex
            direction={'column'}
            align={'center'}
            gap={'x2'}
            className={isMobileFullscreen ? undefined : myDaosWrapper}
            style={
              isMobileFullscreen
                ? {
                    maxHeight: '50vh',
                    width: '100%',
                    overflow: 'auto',
                    WebkitOverflowScrolling: 'touch',
                  }
                : {
                    width: '100%',
                  }
            }
          >
            {viewableDaos.map((dao, index) => (
              <Link
                key={dao.collectionAddress}
                href={`/dao/${
                  PUBLIC_DEFAULT_CHAINS.find((x) => x.id === dao.chainId)?.slug
                }/${dao.collectionAddress}`}
                passHref
                style={{ width: '100%' }}
              >
                <Flex
                  key={index}
                  direction={'row'}
                  align={'center'}
                  cursor={'pointer'}
                  id={`close-modal-${index}`}
                  color={'text1'}
                  gap={'x4'}
                  className={daoButton}
                  style={{
                    borderRadius: '8px',
                    width: '100%',
                  }}
                >
                  <DaoAvatar
                    collectionAddress={dao.collectionAddress}
                    size={'40'}
                    auctionAddress={dao.auctionAddress}
                    chainId={dao.chainId}
                  />
                  <Text fontWeight={'display'}>{dao.name}</Text>
                </Flex>
              </Link>
            ))}
          </Flex>
        </>
      )}
      <Box color="border" borderStyle="solid" borderWidth="thin" />
      <Flex direction={'row'} align={'center'} justify={'space-between'} w={'100%'}>
        <Link
          href={`/profile/${address}`}
          passHref
          style={{ textDecoration: 'none', flex: 1 }}
        >
          <Flex
            direction={'row'}
            align={'center'}
            className={profileRow}
            aria-label="Open profile"
          >
            <Avatar address={address!} src={ensAvatar} size={'40'} />
            <Flex direction={'column'} ml={'x2'}>
              <Text fontWeight={'display'}>{displayName}</Text>
              <Text variant={'paragraph-md'} color={'tertiary'}>
                {userBalance}
              </Text>
            </Flex>
          </Flex>
        </Link>
        <CopyButton text={address!} />
      </Flex>

      <Button
        className={disconnectButton}
        variant={'outline'}
        color="negative"
        onClick={onDisconnect}
        id={'close-modal'}
      >
        Disconnect
      </Button>
    </>
  )

  const renderNavLinks = () => (
    <>
      <Flex direction={'column'} gap={'x2'}>
        <Link href={'/dashboard'}>
          <Flex align="center" justify={'center'} py={'x2'}>
            <Text cursor={'pointer'} fontWeight={'display'}>
              Dashboard
            </Text>
          </Flex>
        </Link>
        <Link href={'/explore'}>
          <Flex align="center" justify={'center'} py={'x2'}>
            <Text cursor={'pointer'} fontWeight={'display'}>
              Explore
            </Text>
          </Flex>
        </Link>
        <Link href={'/about'}>
          <Flex align="center" justify={'center'} py={'x2'}>
            <Text cursor={'pointer'} fontWeight={'display'}>
              About
            </Text>
          </Flex>
        </Link>
        <a href="https://docs.nouns.build/" target="_blank" rel="noreferrer noopener">
          <Flex align="center" justify={'center'} py={'x2'}>
            <Text cursor={'pointer'} fontWeight={'display'}>
              Docs
            </Text>
            <Icon fill="text4" size="sm" ml="x2" id="external-16" />
          </Flex>
        </a>
        <NetworkController.Mainnet>
          <Link href={'/bridge'}>
            <Flex align="center" justify={'center'} py={'x2'}>
              <Text cursor={'pointer'} fontWeight={'display'}>
                Bridge
              </Text>
            </Flex>
          </Link>
        </NetworkController.Mainnet>

        <NetworkController.Testnet>
          <Flex
            as={'a'}
            href="https://nouns.build"
            target="_blank"
            rel="noopener noreferrer canonical"
            id={'close-modal'}
            align={'center'}
            justify={'center'}
            py={'x2'}
          >
            <Text fontWeight={'display'} fontSize={16}>
              Mainnet
            </Text>
            <Icon fill="text4" size="sm" ml="x2" id="external-16" />
          </Flex>
        </NetworkController.Testnet>

        <NetworkController.Mainnet>
          <Flex
            as={'a'}
            href="https://testnet.nouns.build"
            target="_blank"
            rel="noopener noreferrer nofollow"
            id={'close-modal'}
            align={'center'}
            justify={'center'}
            py={'x2'}
          >
            <Text fontWeight={'display'} fontSize={16}>
              Testnet
            </Text>
            <Icon fill="text4" size="sm" ml="x2" id="external-16" />
          </Flex>
        </NetworkController.Mainnet>
      </Flex>
    </>
  )

  const renderNetworkSwitch = () => (
    <>
      <Box color="border" borderStyle="solid" borderWidth="thin" />
      <NetworkController.Testnet>
        <Flex
          as={'a'}
          href="https://nouns.build"
          target="_blank"
          rel="noopener noreferrer canonical"
          id={'close-modal'}
          align={'center'}
          justify={'center'}
          py={'x3'}
          style={{ marginTop: '-10px', marginBottom: '-10px' }}
        >
          <Text fontWeight={'display'} fontSize={16}>
            Mainnet
          </Text>
          <Icon fill="text4" size="sm" ml="x2" id="external-16" />
        </Flex>
      </NetworkController.Testnet>

      <NetworkController.Mainnet>
        <Flex
          as={'a'}
          href="https://testnet.nouns.build"
          target="_blank"
          rel="noopener noreferrer nofollow"
          id={'close-modal'}
          align={'center'}
          justify={'center'}
          py={'x3'}
          style={{ marginTop: '-10px', marginBottom: '-10px' }}
        >
          <Text fontWeight={'display'} fontSize={16}>
            Testnet
          </Text>
          <Icon fill="text4" size="sm" ml="x2" id="external-16" />
        </Flex>
      </NetworkController.Mainnet>
    </>
  )

  const triggerElement = address ? (
    <Flex cursor={'pointer'}>
      {activeDropdown === MenuType.PROFILE_MENU && !isMobile && (
        <Box className={activeNavAvatar} />
      )}
      {isMobile && activeDropdown === MenuType.PROFILE_MENU ? (
        <Flex
          w={'x10'}
          h={'x10'}
          align={'center'}
          justify={'center'}
          borderWidth="thin"
          borderStyle="solid"
          style={{
            position: 'relative',
            zIndex: NAV_BUTTON_LAYER + 1,
            borderRadius: '50%',
            borderColor: 'rgba(0, 0, 0, 0.5)',
          }}
          className={daoButton}
        >
          <Icon id="cross" />
        </Flex>
      ) : (
        <Avatar address={address} src={ensAvatar} size={'40'} />
      )}
    </Flex>
  ) : (
    <Flex align={'center'}>
      <Flex
        w={'x10'}
        h={'x10'}
        align={'center'}
        justify={'center'}
        className={navMenuBurger}
        backgroundColor={
          activeDropdown === MenuType.PROFILE_MENU ? 'ghostHover' : 'background1'
        }
      >
        {isMobile && activeDropdown === MenuType.PROFILE_MENU ? (
          <Icon id="cross" />
        ) : (
          <Icon id="burger" />
        )}
      </Flex>
    </Flex>
  )

  const renderMobileFullscreen = () => (
    <>
      {/* Overlay for click outside to close */}
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: MOBILE_PROFILE_MENU_LAYER - 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        onClick={() => onSetActiveDropdown(undefined)}
      />
      {/* Menu content */}
      <Flex
        direction={'column'}
        py={'x4'}
        px={'x8'}
        gap={'x4'}
        backgroundColor="background1"
        className={mobileMenuSlideIn}
        style={{
          width: '100vw',
          maxHeight: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: MOBILE_PROFILE_MENU_LAYER,
          paddingTop: '80px',
          shadow: 'medium',
        }}
      >
        {!address && <ConnectButton />}
        {renderNavLinks()}
        {address && renderUserContent(true)}
      </Flex>
    </>
  )

  if (isMobile) {
    return (
      <>
        {activeDropdown === MenuType.PROFILE_MENU && renderMobileFullscreen()}
        <Flex
          className={navButton}
          display={!address ? { '@initial': 'flex', '@768': 'none' } : undefined}
          onClick={() => {
            if (activeDropdown === MenuType.PROFILE_MENU) {
              onSetActiveDropdown(undefined)
            } else {
              onSetActiveDropdown(MenuType.PROFILE_MENU)
            }
          }}
          data-active={!!activeDropdown && activeDropdown !== MenuType.PROFILE_MENU}
        >
          {triggerElement}
        </Flex>
      </>
    )
  }

  return (
    <>
      <Flex
        className={navButton}
        display={!address ? { '@initial': 'flex', '@768': 'none' } : undefined}
        onClick={() => onSetActiveDropdown(MenuType.PROFILE_MENU)}
        data-active={!!activeDropdown && activeDropdown !== MenuType.PROFILE_MENU}
      >
        <PopUp
          padding="x0"
          trigger={triggerElement}
          close={activeDropdown !== MenuType.PROFILE_MENU}
          onOpenChange={handleOpenMenu}
        >
          <Flex direction={'column'} p={'x4'} gap={'x4'} style={{ width: 320 }}>
            {!address && <ConnectButton />}
            {address && renderUserContent()}
            {renderNetworkSwitch()}
          </Flex>
        </PopUp>
      </Flex>
    </>
  )
}
