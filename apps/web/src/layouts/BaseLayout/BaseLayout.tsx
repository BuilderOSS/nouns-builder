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

interface BaseLayoutProps {
  children: ReactNode
  chain?: Chain
  addresses?: DaoContractAddresses
  contentPadding?: Record<string, string>
  footer?: ReactNode
  nav?: ReactNode
}

export function BaseLayout({
  children,
  chain,
  addresses,
  contentPadding = { '@initial': 'x20', '@480': 'x16' },
  footer,
  nav,
}: BaseLayoutProps) {
  const chainStore = useMemo(() => createChainStore(chain), [chain])
  const daoStore = useMemo(() => createDaoStore(addresses), [addresses])

  return (
    <ChainStoreProvider store={chainStore}>
      <DaoStoreProvider store={daoStore}>
        <Box>
          {nav || <DefaultLayoutNav />}
          <Box px={contentPadding}>{children}</Box>
          {footer}
        </Box>
      </DaoStoreProvider>
    </ChainStoreProvider>
  )
}
