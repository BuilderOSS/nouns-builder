import React, { ReactElement, ReactNode } from 'react'

import { BaseLayout } from '../BaseLayout'
import { LayoutWrapper } from '../LayoutWrapper'

export function ProfileLayout({ children }: { children: ReactNode }) {
  return <BaseLayout contentPadding={{ '@initial': 'x4' }}>{children}</BaseLayout>
}

export function getProfileLayout(page: ReactElement) {
  return (
    <LayoutWrapper>
      <ProfileLayout>{page}</ProfileLayout>
    </LayoutWrapper>
  )
}
