import React from 'react'
import { Meta } from 'src/components/Meta'
import { DefaultLayout } from 'src/layouts/DefaultLayout'
import { LayoutWrapper } from 'src/layouts/LayoutWrapper'
import { PlaygroundPage } from 'src/modules/playground/PlaygroundPage'

const Playground = () => {
  return (
    <>
      <Meta
        title={'Playground'}
        description={'Preview and experiment with DAO NFT artwork'}
        type={'website'}
        path={'/playground'}
      />
      <PlaygroundPage />
    </>
  )
}

Playground.getLayout = (page: React.ReactElement) => {
  return (
    <LayoutWrapper>
      <DefaultLayout>{page}</DefaultLayout>
    </LayoutWrapper>
  )
}

export default Playground
