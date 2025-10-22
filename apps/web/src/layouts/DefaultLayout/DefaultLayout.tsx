import type { DaoContractAddresses } from '@buildeross/types'
import { Chain } from '@buildeross/types'
import React, { ReactNode } from 'react'

import { BaseLayout } from '../BaseLayout'
import { LayoutWrapper } from '../LayoutWrapper'
import { Footer } from './Footer'

export function DefaultLayout({
  children,
  chain,
  addresses,
}: {
  children: ReactNode
  chain?: Chain
  addresses?: DaoContractAddresses
}) {
  return (
    <BaseLayout
      chain={chain}
      addresses={addresses}
      px={'x4'}
      pt={{ '@initial': 'x20', '@480': 'x16' }}
      footer={<Footer />}
    >
      {children}
    </BaseLayout>
  )
}

export function getDefaultLayout(page: React.ReactElement) {
  return (
    <LayoutWrapper>
      <DefaultLayout>{page}</DefaultLayout>
    </LayoutWrapper>
  )
}
