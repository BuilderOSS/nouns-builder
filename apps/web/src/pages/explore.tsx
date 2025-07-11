import { Flex } from '@zoralabs/zord'
import axios from 'axios'
import { useRouter } from 'next/router'
import useSWR from 'swr'

import { Meta } from 'src/components/Meta'
import SWR_KEYS from 'src/constants/swrKeys'
import { ExploreDaosResponse } from 'src/data/subgraph/requests/exploreQueries'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'
import { Explore } from 'src/modules/dao'
import { useChainStore } from 'src/stores/useChainStore'

import { NextPageWithLayout } from './_app'

const ExplorePage: NextPageWithLayout = () => {
  const {
    query: { page, orderBy },
    isReady,
  } = useRouter()
  const chain = useChainStore((x) => x.chain)

  const { data, error } = useSWR(
    isReady ? [SWR_KEYS.EXPLORE, page, orderBy, chain.slug] : null,
    async () => {
      const params: any = {}
      if (page) params['page'] = page
      if (orderBy) params['orderBy'] = orderBy
      if (chain) params['network'] = chain.slug

      return await axios
        .get<ExploreDaosResponse>('/api/explore', { params })
        .then((x) => x.data)
    }
  )

  const { daos, hasNextPage } = data || {}

  return (
    <Flex direction={'column'} align={'center'} mt={'x5'} minH={'100vh'}>
      <Meta title={'Explore'} type={'website'} path={'/explore'} />
      <Explore
        daos={daos}
        hasNextPage={hasNextPage || false}
        isLoading={!data && !error}
      />
    </Flex>
  )
}

ExplorePage.getLayout = getDefaultLayout

export default ExplorePage
