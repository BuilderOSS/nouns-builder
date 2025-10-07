import React from 'react'
import { Meta } from 'src/components/Meta'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'
import Dashboard from 'src/modules/dashboard/Dashboard'

const DashboardPage = () => {
  return (
    <>
      <Meta title={'Dashboard'} type={'website'} path={'/dashboard'} />
      <Dashboard />
    </>
  )
}

DashboardPage.getLayout = getDefaultLayout

export default DashboardPage
