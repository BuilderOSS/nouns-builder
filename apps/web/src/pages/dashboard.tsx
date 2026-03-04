import React from 'react'
import { Meta } from 'src/components/Meta'
import { DefaultLayout } from 'src/layouts/DefaultLayout'
import { LayoutWrapper } from 'src/layouts/LayoutWrapper'
import { Dashboard } from 'src/modules/dashboard'
import { container } from 'src/styles/dashboard.css'

const DashboardPage = () => {
  return (
    <>
      <Meta title={'Dashboard'} type={'website'} path={'/dashboard'} />
      <Dashboard />
    </>
  )
}

DashboardPage.getLayout = (page: React.ReactElement) => {
  return (
    <LayoutWrapper>
      <DefaultLayout hideFooterOnMobile={true} className={container}>
        {page}
      </DefaultLayout>
    </LayoutWrapper>
  )
}

export default DashboardPage
