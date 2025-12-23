import type { DaoContractAddresses } from '@buildeross/types'
import { Chain } from '@buildeross/types'
import { Box } from '@buildeross/zord'
import React, { ReactNode } from 'react'

import { BaseLayout } from '../BaseLayout'
import { LayoutWrapper } from '../LayoutWrapper'
import { Footer } from './Footer'

type BoxProps = React.ComponentProps<typeof Box>

type DefaultLayoutProps = {
  children: ReactNode
  chain?: Chain
  addresses?: DaoContractAddresses
  hideFooterOnMobile?: boolean
} & BoxProps

export function DefaultLayout({
  children,
  chain,
  addresses,
  hideFooterOnMobile = false,
  ...props
}: DefaultLayoutProps) {
  return (
    <BaseLayout
      chain={chain}
      addresses={addresses}
      px={'x4'}
      pt={'x20'}
      footer={<Footer hideOnMobile={hideFooterOnMobile} />}
      {...props}
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
