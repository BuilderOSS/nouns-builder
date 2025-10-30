import { useChainStore } from '@buildeross/stores'
import { Feed } from '@buildeross/ui/Feed'
import { Flex, Heading, Stack } from '@buildeross/zord'
import { Meta } from 'src/components/Meta'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'

import { NextPageWithLayout } from './_app'

const FeedPage: NextPageWithLayout = () => {
  const chain = useChainStore((state) => state.chain)

  return (
    <Flex direction={'column'} align={'center'} mt={'x5'} minH={'100vh'} px={'x4'}>
      <Meta title={'Feed'} type={'website'} path={'/feed'} />
      <Stack gap="x6" w="100%" style={{ maxWidth: '912px' }}>
        <Heading as="h1" size="lg">
          Activity Feed
        </Heading>
        <Feed chainId={chain.id} />
      </Stack>
    </Flex>
  )
}

FeedPage.getLayout = getDefaultLayout

export default FeedPage
