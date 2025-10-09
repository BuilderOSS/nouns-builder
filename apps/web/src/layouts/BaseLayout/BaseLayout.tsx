import { Chain } from '@buildeross/types'
import { Box } from '@buildeross/zord'
import React, { ReactNode, useMemo } from 'react'
import {
  ChainStoreProvider,
  createChainStore,
  createDaoStore,
  DaoContractAddresses,
  DaoStoreProvider,
} from 'src/stores'

import { Nav as DefaultLayoutNav } from '../DefaultLayout/Nav'

type BoxProps = React.ComponentProps<typeof Box>

type BaseLayoutProps = {
  children: ReactNode
  chain?: Chain
  addresses?: DaoContractAddresses
  footer?: ReactNode
  nav?: ReactNode
} & BoxProps

export function BaseLayout({
  children,
  chain,
  addresses,
  footer,
  nav,
  ...props
}: BaseLayoutProps) {
  const chainStore = useMemo(() => createChainStore(chain), [chain])
  const daoStore = useMemo(() => createDaoStore(addresses), [addresses])

  return (
    <ChainStoreProvider store={chainStore}>
      <DaoStoreProvider store={daoStore}>
        <Box>
          {nav || <DefaultLayoutNav />}
          <Box {...props}>{children}</Box>
          {footer}
        </Box>
      </DaoStoreProvider>
    </ChainStoreProvider>
  )
}
