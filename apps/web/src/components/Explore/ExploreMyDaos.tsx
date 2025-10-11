import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { exploreMyDaosRequest } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { chainIdToSlug } from '@buildeross/utils/helpers'
import { Grid } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React from 'react'
import { DaoCard } from 'src/modules/dao/components/DaoCard'
import useSWR from 'swr'
import { formatEther } from 'viem'
import { useAccount } from 'wagmi'

import { exploreGrid } from './Explore.css'
import ExploreNoDaos from './ExploreNoDaos'
import { ExploreSkeleton } from './ExploreSkeleton'
import ExploreToolbar from './ExploreToolbar'

export const ExploreMyDaos = () => {
  const { address } = useAccount()
  const { push } = useRouter()

  const { data, error, isValidating } = useSWR(
    address ? ([SWR_KEYS.DYNAMIC.MY_DAOS_PAGE(address), address] as const) : null,
    ([, _address]) => exploreMyDaosRequest(_address),
    { revalidateOnFocus: false }
  )

  const isLoading = data ? false : isValidating && !data && !error

  const onOpenDao = React.useCallback(
    (chainId: CHAIN_ID, tokenAddress: string, tokenId?: number | string | bigint) => {
      if (tokenId === undefined || tokenId === null) {
        push({
          pathname: `/dao/[network]/[token]`,
          query: {
            network: chainIdToSlug(chainId),
            token: tokenAddress,
          },
        })
        return
      }
      push({
        pathname: `/dao/[network]/[token]/[tokenId]`,
        query: {
          network: chainIdToSlug(chainId),
          token: tokenAddress,
          tokenId: tokenId.toString(),
        },
      })
    },
    [push]
  )

  return (
    <>
      <ExploreToolbar title={`My DAOs`} />
      {isLoading ? (
        <ExploreSkeleton />
      ) : data?.daos?.length ? (
        <Grid className={exploreGrid} mb={'x16'}>
          {data.daos.map((dao) => {
            const bid = dao.highestBid?.amount ?? undefined
            const bidInEth = bid ? formatEther(bid) : undefined
            if (!dao.chainId) return null

            return (
              <DaoCard
                key={dao.dao.tokenAddress}
                chainId={dao.chainId}
                tokenImage={dao.token?.image ?? undefined}
                tokenName={dao.token?.name ?? undefined}
                collectionName={dao.dao.name ?? undefined}
                bid={bidInEth}
                endTime={dao.endTime ?? undefined}
                onClick={() =>
                  onOpenDao(dao.chainId, dao.dao.tokenAddress, dao.token?.tokenId)
                }
              />
            )
          })}
        </Grid>
      ) : (
        <ExploreNoDaos />
      )}
    </>
  )
}
