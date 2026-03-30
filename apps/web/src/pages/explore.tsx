import { Flex } from '@buildeross/zord'
import { Meta } from 'src/components/Meta'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'
import { Explore } from 'src/modules/explore'

import { NextPageWithLayout } from './_app'

const ExplorePage: NextPageWithLayout = () => {
  return (
    <Flex direction={'column'} align={'center'} mt={'x5'}>
      <Meta title={'Explore'} type={'website'} path={'/explore'} />
      <Explore />
    </Flex>
  )
}

ExplorePage.getLayout = getDefaultLayout

export default ExplorePage
