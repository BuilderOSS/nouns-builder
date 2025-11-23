import { Feed } from '@buildeross/feed-ui'
import { Flex } from '@buildeross/zord'
import React from 'react'
import { Meta } from 'src/components/Meta'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'

import { NextPageWithLayout } from './_app'

const FeedPage: NextPageWithLayout = () => {
  return (
    <Flex direction={'column'} align={'center'} mt={'x5'} minH={'100vh'}>
      <Meta title={'Feed'} type={'website'} path={'/feed'} />
      <Feed enableFilters />
    </Flex>
  )
}

FeedPage.getLayout = getDefaultLayout

export default FeedPage
