import { Flex } from '@buildeross/zord'
import { ExploreMyDaos } from 'src/components/Explore'
import { Meta } from 'src/components/Meta'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'

import { NextPageWithLayout } from './_app'

const MyDaosPage: NextPageWithLayout = () => {
  return (
    <Flex direction={'column'} align={'center'} mt={'x5'} minH={'100vh'}>
      <Meta title={'My Daos'} type={'website'} path={'/mydaos'} />
      <ExploreMyDaos />
    </Flex>
  )
}

MyDaosPage.getLayout = getDefaultLayout

export default MyDaosPage
