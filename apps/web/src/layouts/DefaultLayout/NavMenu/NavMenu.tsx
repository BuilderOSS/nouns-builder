import { Box, Flex } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React from 'react'
import { useLayoutStore } from 'src/stores'
import { useChainStore } from 'src/stores/useChainStore'
import { useAccount } from 'wagmi'

import { ConnectButton } from '../ConnectButton'
import { ChainMenu } from './ChainMenu'
import { ProfileMenu } from './ProfileMenu'
import { MenuType } from './types'

export const NavMenu = () => {
  const [isChainInitilized, setIsChainInitilized] = React.useState(false)
  const isMobile = useLayoutStore((x) => x.isMobile)
  const [activeDropdown, setActiveDropdown] = React.useState<MenuType>()

  const router = useRouter()
  const { address } = useAccount()

  React.useEffect(() => {
    const handleRouteChange = () => {
      setActiveDropdown(undefined)
    }

    router.events.on('routeChangeStart', handleRouteChange)

    const hasHydrated = useChainStore.persist.hasHydrated()
    let hydrationUnsubscribe: (() => void) | undefined

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

  const onOpenMenu = React.useCallback(
    (open: boolean, menuType: MenuType) => {
      if (!open) {
        if (activeDropdown === menuType) {
          setActiveDropdown(undefined)
        }
      } else {
        setActiveDropdown(menuType)
      }
    },
    [activeDropdown]
  )

  return (
    <Flex align={'center'} direction={'row'} gap={'x4'}>
      <ChainMenu
        activeDropdown={activeDropdown}
        onOpenMenu={onOpenMenu}
        onSetActiveDropdown={setActiveDropdown}
        isChainInitilized={isChainInitilized}
      />
      <ProfileMenu
        activeDropdown={activeDropdown}
        onOpenMenu={onOpenMenu}
        onSetActiveDropdown={setActiveDropdown}
      />
      {!address && !isMobile && (
        <Box style={{ width: 110 }}>
          <ConnectButton />
        </Box>
      )}
    </Flex>
  )
}
