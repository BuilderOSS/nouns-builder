import { Flex } from '@buildeross/zord'
import { Meta } from 'src/components/Meta'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'
import { ExploreMyDaos } from 'src/modules/dao'

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
