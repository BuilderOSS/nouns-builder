import SWR_KEYS from '@buildeross/constants/swrKeys'
import { ExploreDaosResponse } from '@buildeross/sdk/subgraph'
import { Flex } from '@buildeross/zord'
import axios from 'axios'
import { useRouter } from 'next/router'
import { Explore } from 'src/components/Explore'
import { Meta } from 'src/components/Meta'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'
import { useChainStore } from 'src/stores'
import useSWR from 'swr'

import { NextPageWithLayout } from './_app'

const ExplorePage: NextPageWithLayout = () => {
  const {
    query: { page, orderBy },
    isReady,
  } = useRouter()
  const chain = useChainStore((x) => x.chain)

  const { data, error } = useSWR(
    isReady ? ([SWR_KEYS.EXPLORE, page, orderBy, chain.slug] as const) : null,
    async ([, _page, _orderBy, _chainSlug]) => {
      const params: any = {}
      if (_page) params['page'] = _page
      if (_orderBy) params['orderBy'] = _orderBy
      if (_chainSlug) params['network'] = _chainSlug

      return await axios
        .get<ExploreDaosResponse>('/api/explore', { params })
        .then((x) => x.data)
    }
  )

  const { daos = [], hasNextPage = false } = data || {}

  return (
    <Flex direction={'column'} align={'center'} mt={'x5'} minH={'100vh'}>
      <Meta title={'Explore'} type={'website'} path={'/explore'} />
      <Explore daos={daos} hasNextPage={hasNextPage} isLoading={!data && !error} />
    </Flex>
  )
}

ExplorePage.getLayout = getDefaultLayout

export default ExplorePage
