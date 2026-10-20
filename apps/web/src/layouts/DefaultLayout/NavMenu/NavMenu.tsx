import { useAuthStore } from '@buildeross/stores'
import { Box, Flex } from '@buildeross/zord'
import React from 'react'
import { GlobalSearch } from 'src/modules/search/GlobalSearch'

import { ConnectButton } from '../ConnectButton'
import { ChainMenu } from './ChainMenu'
import { ProfileMenu } from './ProfileMenu'
import { ThemeToggle } from './ThemeToggle'
import { MenuType } from './types'

interface NavMenuProps {
  hideChainMenu?: boolean
}

export const NavMenu = ({ hideChainMenu = false }: NavMenuProps) => {
  const [activeDropdown, setActiveDropdown] = React.useState<MenuType>()

  const { address } = useAuthStore()

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
    <Flex align={'center'} direction={'row'} gap={{ '@initial': 'x2', '@768': 'x4' }}>
      <GlobalSearch />
      <ThemeToggle />
      {!hideChainMenu && (
        <ChainMenu
          activeDropdown={activeDropdown}
          onOpenMenu={onOpenMenu}
          onSetActiveDropdown={setActiveDropdown}
        />
      )}
      <ProfileMenu
        activeDropdown={activeDropdown}
        onOpenMenu={onOpenMenu}
        onSetActiveDropdown={setActiveDropdown}
      />
      {!address && (
        <Box style={{ width: 110 }} display={{ '@initial': 'none', '@768': 'block' }}>
          <ConnectButton />
        </Box>
      )}
    </Flex>
  )
}
