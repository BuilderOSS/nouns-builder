import { Flex } from '@buildeross/zord'
import { Meta } from 'src/components/Meta'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'
import { ExploreFavorites } from 'src/modules/explore'

import { NextPageWithLayout } from './_app'

const FavoritesPage: NextPageWithLayout = () => {
  return (
    <Flex direction={'column'} align={'center'} mt={'x5'} minH={'100vh'}>
      <Meta title={'Favorite Daos'} type={'website'} path={'/favorites'} />
      <ExploreFavorites />
    </Flex>
  )
}

FavoritesPage.getLayout = getDefaultLayout

export default FavoritesPage
