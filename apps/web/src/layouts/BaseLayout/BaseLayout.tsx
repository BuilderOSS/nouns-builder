import {
  ChainStoreProvider,
  createChainStore,
  createDaoStore,
  DaoStoreProvider,
} from '@buildeross/stores'
import type { Chain, DaoContractAddresses } from '@buildeross/types'
import { ConnectModalProvider } from '@buildeross/ui/ConnectModalProvider'
import { Box } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import React, { ReactNode, useMemo } from 'react'

import { Nav as DefaultLayoutNav } from '../DefaultLayout/Nav'

type BoxProps = React.ComponentProps<typeof Box>

type BaseLayoutProps = {
  children: ReactNode
  chain?: Chain
  addresses?: DaoContractAddresses
  footer?: ReactNode
  nav?: ReactNode
  hideChainMenu?: boolean
} & BoxProps

export function BaseLayout({
  children,
  chain,
  addresses,
  footer,
  nav,
  hideChainMenu = false,
  ...props
}: BaseLayoutProps) {
  const { style, ...rest } = props
  const chainStore = useMemo(() => createChainStore(chain), [chain])
  const daoStore = useMemo(() => createDaoStore(addresses), [addresses])
  const { openConnectModal } = useConnectModal()

  return (
    <ConnectModalProvider value={{ openConnectModal }}>
      <ChainStoreProvider store={chainStore}>
        <DaoStoreProvider store={daoStore}>
          <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {nav || <DefaultLayoutNav hideChainMenu={hideChainMenu} />}
            <Box style={{ ...style, flex: 1 }} {...rest}>
              {children}
            </Box>
            {footer}
          </Box>
        </DaoStoreProvider>
      </ChainStoreProvider>
    </ConnectModalProvider>
  )
}
