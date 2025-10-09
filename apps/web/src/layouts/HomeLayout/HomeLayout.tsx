import React, { ReactElement, ReactNode } from 'react'

import { BaseLayout } from '../BaseLayout'
import { LayoutWrapper } from '../LayoutWrapper'
import { Footer } from './Footer'

export function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <BaseLayout px={'x4'} pt={{ '@initial': 'x20', '@480': 'x0' }} footer={<Footer />}>
      {children}
    </BaseLayout>
  )
}

export function getHomeLayout(page: ReactElement) {
  return (
    <LayoutWrapper>
      <HomeLayout>{page}</HomeLayout>
    </LayoutWrapper>
  )
}
