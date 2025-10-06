import React, { ReactElement, ReactNode } from 'react'

import { BaseLayout } from '../BaseLayout'
import { LayoutWrapper } from '../LayoutWrapper'
import { Footer } from './Footer'

export function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <BaseLayout contentPadding={{ '@initial': 'x4', '@768': 'x0' }} footer={<Footer />}>
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
