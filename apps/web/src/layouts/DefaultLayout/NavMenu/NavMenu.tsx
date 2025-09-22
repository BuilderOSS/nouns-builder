import { Box, Flex } from '@buildeross/zord'
import React from 'react'
import { useAccount } from 'wagmi'

import { ConnectButton } from '../ConnectButton'
import { ChainMenu } from './ChainMenu'
import { ProfileMenu } from './ProfileMenu'
import { MenuType } from './types'

export const NavMenu = () => {
  const [activeDropdown, setActiveDropdown] = React.useState<MenuType>()

  const { address } = useAccount()

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
      />
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
