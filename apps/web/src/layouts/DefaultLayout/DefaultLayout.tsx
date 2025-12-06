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
  hideFooterOnMobile = false,
}: {
  children: ReactNode
  chain?: Chain
  addresses?: DaoContractAddresses
  hideFooterOnMobile?: boolean
}) {
  return (
    <BaseLayout
      chain={chain}
      addresses={addresses}
      px={'x4'}
      pt={'x20'}
      footer={<Footer hideOnMobile={hideFooterOnMobile} />}
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
