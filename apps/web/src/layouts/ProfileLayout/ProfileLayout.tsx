import React, { ReactElement, ReactNode } from 'react'

import { BaseLayout } from '../BaseLayout'
import { LayoutWrapper } from '../LayoutWrapper'

export function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <BaseLayout px={'x4'} pt={{ '@initial': 'x20', '@480': 'x16' }}>
      {children}
    </BaseLayout>
  )
}

export function getProfileLayout(page: ReactElement) {
  return (
    <LayoutWrapper>
      <ProfileLayout>{page}</ProfileLayout>
    </LayoutWrapper>
  )
}
