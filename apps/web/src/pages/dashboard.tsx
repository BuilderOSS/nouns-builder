import React from 'react'

import { Meta } from 'src/components/Meta'
import { DefaultLayout } from 'src/layouts/DefaultLayout'
import { LayoutWrapper } from 'src/layouts/LayoutWrapper'
import Dashboard from 'src/modules/dashboard/Dashboard'

const DashboardPage = () => {
  return (
    <LayoutWrapper>
      <DefaultLayout>
        <Meta title={'Dashboard'} type={'website'} path={'/dashboard'} />
        <Dashboard />
      </DefaultLayout>
    </LayoutWrapper>
  )
}

export default DashboardPage
