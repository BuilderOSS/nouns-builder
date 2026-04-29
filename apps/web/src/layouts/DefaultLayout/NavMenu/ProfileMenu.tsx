import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { MOBILE_PROFILE_MENU_LAYER, NAV_BUTTON_LAYER } from '@buildeross/constants/layers'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { useUserDaos } from '@buildeross/hooks/useUserDaos'
import { useWalletDisconnect } from '@buildeross/hooks/useWalletDisconnect'
import { useChainStore } from '@buildeross/stores'
import { Avatar, DaoAvatar } from '@buildeross/ui/Avatar'
import { CopyButton } from '@buildeross/ui/CopyButton'
import { NetworkController } from '@buildeross/ui/NetworkController'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Button, Flex, Icon, PopUp, Text } from '@buildeross/zord'
import NextImage from 'next/image'
import Link from 'next/link'
import React from 'react'
import { HiddenDaoDisclosure } from 'src/components/HiddenDaoDisclosure'
import { useDaoListPreferences } from 'src/hooks/useDaoListPreferences'
import { formatUnits } from 'viem'
import { useAccount, useBalance } from 'wagmi'

import { ConnectButton } from '../ConnectButton'
import {
  activeNavAvatar,
  daoButton,
  disconnectButton,
  hiddenDaoButton,
  mobileMenuSlideIn,
  myDaosWrapper,
  navButton,
  navMenuBurger,
  navPopUpWrapper,
  navPrimaryActionButton,
  profileRow,
} from '../Nav.styles.css'
import { MenuType } from './types'

interface ProfileMenuProps {
  activeDropdown: MenuType | undefined
  onOpenMenu: (open: boolean, menuType: MenuType) => void
  onSetActiveDropdown: (menu: MenuType | undefined) => void
}

type DaoRowItem = {
  chainId: number
  collectionAddress: string
  auctionAddress: string
  name: string
}

type DaoRowProps = {
  dao: DaoRowItem
  index: number
  isHidden: boolean
}

const DaoRow: React.FC<DaoRowProps> = ({ dao, index, isHidden }) => {
  const chainMeta = PUBLIC_DEFAULT_CHAINS.find((chain) => chain.id === dao.chainId)

  return (
    <Flex
      align="center"
      justify="space-between"
      className={isHidden ? [daoButton, hiddenDaoButton] : daoButton}
      style={{ borderRadius: '8px', width: '100%' }}
      pr="x2"
      gap="x2"
    >
      <Link
        href={`/dao/${chainMeta?.slug}/${dao.collectionAddress}`}
        passHref
        target="_blank"
        rel="noopener noreferrer"
        style={{ width: '100%', textDecoration: 'none' }}
      >
        <Flex
          direction={'row'}
          align={'center'}
          cursor={'pointer'}
          id={isHidden ? `close-modal-hidden-${index}` : `close-modal-${index}`}
          color={'text1'}
          gap={'x4'}
          justify={'space-between'}
        >
          <Flex align="center" gap="x4" style={{ minWidth: 0 }}>
            <DaoAvatar
              collectionAddress={dao.collectionAddress}
              size={'40'}
              auctionAddress={dao.auctionAddress}
              chainId={dao.chainId}
            />
            <Text fontWeight={'display'}>{dao.name}</Text>
          </Flex>
        </Flex>
      </Link>
      <Flex
        align="center"
        gap="x1"
        style={{ minWidth: '24px', justifyContent: 'flex-end' }}
      >
        <Flex width="x4" height="x4" align="center" justify="center">
          {chainMeta?.icon && (
            <NextImage
              src={chainMeta.icon}
              style={{
                borderRadius: '12px',
                maxHeight: '16px',
                objectFit: 'contain',
              }}
              alt=""
              height={16}
              width={16}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  activeDropdown,
  onOpenMenu,
  onSetActiveDropdown,
}) => {
  const { address } = useAccount()
  const { chain: selectedChain } = useChainStore()
  const { displayName, ensAvatar } = useEnsData(address || '')
  const { data: balance } = useBalance({
    address: address!,
    chainId: selectedChain.id,
  })

  const userBalance = balance
    ? `${formatCryptoVal(formatUnits(balance.value, balance.decimals))} ETH`
    : undefined

  const { daos } = useUserDaos({ address })
  const [isHiddenDaosOpen, setIsHiddenDaosOpen] = React.useState(false)
  const { isDaoHidden, sortDaos, groupHiddenDaosLast } = useDaoListPreferences(address)
  const chainSortedDaos = React.useMemo(
    () =>
      [...daos].sort((a, b) => {
        const aIndex = PUBLIC_DEFAULT_CHAINS.findIndex((chain) => chain.id === a.chainId)
        const bIndex = PUBLIC_DEFAULT_CHAINS.findIndex((chain) => chain.id === b.chainId)
        return aIndex - bIndex
      }),
    [daos]
  )

  const orderedDaos = React.useMemo(() => {
    const orderedDaos = sortDaos(
      chainSortedDaos,
      (dao) => dao.collectionAddress,
      (dao) => dao.chainId
    )

    return groupHiddenDaosLast(
      orderedDaos,
      (dao) => dao.collectionAddress,
      (dao) => dao.chainId
    )
  }, [chainSortedDaos, sortDaos, groupHiddenDaosLast])

  const visibleDaos = React.useMemo(
    () => orderedDaos.filter((dao) => !isDaoHidden(dao.chainId, dao.collectionAddress)),
    [orderedDaos, isDaoHidden]
  )

  const hiddenDaos = React.useMemo(
    () => orderedDaos.filter((dao) => isDaoHidden(dao.chainId, dao.collectionAddress)),
    [orderedDaos, isDaoHidden]
  )

  const handleOpenMenu = React.useCallback(
    (open: boolean) => {
      onOpenMenu(open, MenuType.PROFILE_MENU)
    },
    [onOpenMenu]
  )

  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    if (!!window) {
      window.addEventListener('resize', handleResize)
      handleResize()
    }

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

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

  const onDisconnect = useWalletDisconnect()

  const renderConnectedUser = () => (
    <>
      <Flex direction={'column'} align={'stretch'} gap={'x2'}>
        <Flex direction={'row'} align={'center'} justify={'space-between'} w={'100%'}>
          <Link
            href={`/profile/${address}`}
            passHref
            target="_blank"
            rel="noopener noreferrer"
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
      </Flex>
      <Box color="border" borderStyle="solid" borderWidth="thin" />
    </>
  )

  const renderUserContent = (isMobileFullscreen = false) => (
    <>
      {daos.length > 0 && (
        <>
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
            {visibleDaos.map((dao, index) => (
              <DaoRow
                key={`${dao.chainId}:${dao.collectionAddress}`}
                dao={dao}
                index={index}
                isHidden={false}
              />
            ))}
            {hiddenDaos.length > 0 && (
              <HiddenDaoDisclosure
                count={hiddenDaos.length}
                isOpen={isHiddenDaosOpen}
                onToggle={() => setIsHiddenDaosOpen((x) => !x)}
              >
                <Flex direction="column" gap="x2" w="100%">
                  {hiddenDaos.map((dao, index) => (
                    <DaoRow
                      key={`${dao.chainId}:${dao.collectionAddress}`}
                      dao={dao}
                      index={index}
                      isHidden
                    />
                  ))}
                </Flex>
              </HiddenDaoDisclosure>
            )}
          </Flex>
          <Box color="border" borderStyle="solid" borderWidth="thin" />
        </>
      )}
      <Link href="/create" passHref style={{ width: '100%' }}>
        <Button id={'close-modal'} w={'100%'} className={navPrimaryActionButton}>
          Create a DAO
        </Button>
      </Link>
    </>
  )

  const renderNavLinks = () => (
    <>
      <Flex direction={'column'} gap={'x0'}>
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
        <Link href={'/playground'}>
          <Flex align="center" justify={'center'} py={'x2'}>
            <Text cursor={'pointer'} fontWeight={'display'}>
              Playground
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
      <Box color="border" borderStyle="solid" borderWidth="thin" />
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
        gap={'x3'}
        backgroundColor="background1"
        className={[mobileMenuSlideIn, navPopUpWrapper]}
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
        {address ? renderConnectedUser() : <ConnectButton />}
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
          wrapperClassName={navPopUpWrapper}
        >
          <Flex direction={'column'} p={'x4'} gap={'x4'} style={{ width: 320 }}>
            {address ? renderConnectedUser() : <ConnectButton />}
            {address && renderUserContent()}
            {renderNetworkSwitch()}
          </Flex>
        </PopUp>
      </Flex>
    </>
  )
}
