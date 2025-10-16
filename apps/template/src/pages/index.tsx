import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PreAuction } from '@buildeross/dao-ui'
import { OrderDirection, SubgraphSDK, Token_OrderBy } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Flex } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import { getDaoConfig, RequiredDaoContractAddresses } from '@/config'

interface HomePageProps {
  hasTokens: boolean
  addresses: RequiredDaoContractAddresses
  chainId: CHAIN_ID
  collectionAddress: AddressType
}

export default function Home({
  hasTokens,
  addresses: _addresses,
  chainId: _chainId,
  collectionAddress,
}: HomePageProps) {
  const { push } = useRouter()
  const daoConfig = getDaoConfig()
  const chain = daoConfig.chain

  const openTokenPage = React.useCallback(
    async (tokenId: number) => {
      await push(`/token/${tokenId}`)
    },
    [push]
  )

  // If we have tokens, this should have redirected in getServerSideProps
  // So this only renders when there are no tokens yet (PreAuction state)
  if (hasTokens) {
    return null
  }

  return (
    <>
      <Head>
        <title>DAO - Home</title>
        <meta name="description" content="DAO Homepage" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex direction="column" pb="x30" style={{ margin: '0 -1rem' }}>
        <PreAuction
          chain={chain}
          collectionAddress={collectionAddress}
          onOpenAuction={openTokenPage}
          onOpenSettings={() => {}}
        />
      </Flex>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const { maxAge, swr } = CACHE_TIMES.DAO_INFO
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )

  try {
    const daoConfig = getDaoConfig()
    const { chain, addresses } = daoConfig

    // Get the latest token ID
    const latestTokenId = await SubgraphSDK.connect(chain.id)
      .tokens({
        where: {
          dao: addresses.token.toLowerCase(),
        },
        orderBy: Token_OrderBy.TokenId,
        orderDirection: OrderDirection.Desc,
        first: 1,
      })
      .then((x) => (x.tokens.length > 0 ? x.tokens[0].tokenId : undefined))

    if (!latestTokenId) {
      // If no tokens exist yet, show the PreAuction page
      return {
        props: {
          hasTokens: false,
          addresses,
          chainId: chain.id,
          collectionAddress: addresses.token,
        },
      }
    }

    // Redirect to the latest token page
    return {
      redirect: {
        destination: `/token/${latestTokenId}`,
        permanent: false,
      },
    }
  } catch (e) {
    console.error('Error fetching latest token:', e)
    return {
      notFound: true,
    }
  }
}
