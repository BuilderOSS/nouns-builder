import React, { ReactElement, ReactNode } from 'react'

import { BaseLayout } from '../BaseLayout'
import { LayoutWrapper } from '../LayoutWrapper'
import { Nav } from './Nav'

function CreateDaoLayout({ children }: { children: ReactNode }) {
  return (
    <BaseLayout px={'x0'} nav={<Nav />}>
      {children}
    </BaseLayout>
  )
}

export function getCreateDaoLayout(page: ReactElement) {
  return (
    <LayoutWrapper>
      <CreateDaoLayout>{page}</CreateDaoLayout>
    </LayoutWrapper>
  )
}
