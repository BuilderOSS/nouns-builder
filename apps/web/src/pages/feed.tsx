import { useChainStore } from '@buildeross/stores'
import { Feed } from '@buildeross/ui/Feed'
import { Flex } from '@buildeross/zord'
import { Meta } from 'src/components/Meta'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'

import { NextPageWithLayout } from './_app'

const FeedPage: NextPageWithLayout = () => {
  const chain = useChainStore((state) => state.chain)

  return (
    <Flex direction={'column'} align={'center'} mt={'x5'} minH={'100vh'}>
      <Meta title={'Feed'} type={'website'} path={'/feed'} />
      <Feed chainId={chain.id} />
    </Flex>
  )
}

FeedPage.getLayout = getDefaultLayout

export default FeedPage
