import { DaoAuctionSection, type TokenWithDao } from '@buildeross/auction-ui'
import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { SubgraphSDK } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Flex } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import { getDaoConfig, RequiredDaoContractAddresses } from '@/config'

interface TokenPageProps {
  token: TokenWithDao
  addresses: RequiredDaoContractAddresses
  chainId: CHAIN_ID
  collectionAddress: AddressType
}

const TokenPage: React.FC<TokenPageProps> = ({
  token,
  addresses,
  chainId: _chainId,
  collectionAddress,
}) => {
  const { push } = useRouter()
  const daoConfig = getDaoConfig()
  const chain = daoConfig.chain

  const onAuctionCreated = React.useCallback(
    (tokenId: bigint) => {
      push(`/token/${tokenId.toString()}`)
    },
    [push]
  )

  return (
    <>
      <Head>
        <title>{`${daoConfig.name} - Token #${token.tokenId}`}</title>
        <meta
          name="description"
          content={`Token #${token.tokenId} from ${daoConfig.name}`}
        />
        <meta
          property="og:title"
          content={`${daoConfig.name} - Token #${token.tokenId}`}
        />
        <meta
          property="og:description"
          content={`Token #${token.tokenId} from ${daoConfig.name}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex direction="column">
        <DaoAuctionSection
          chain={chain}
          collection={collectionAddress}
          auctionAddress={addresses.auction}
          token={token}
          onAuctionCreated={onAuctionCreated}
        />
      </Flex>
    </>
  )
}

export default TokenPage

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  const tokenId = params?.tokenId as string

  try {
    const daoConfig = getDaoConfig()
    const { chain, addresses } = daoConfig

    const token = await SubgraphSDK.connect(chain.id)
      .tokenWithDao({
        id: `${addresses.token.toLowerCase()}:${tokenId}`,
      })
      .then((x) => x.token)

    if (!token) {
      return {
        notFound: true,
      }
    }

    const { maxAge, swr } = CACHE_TIMES.TOKEN_INFO
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
    )

    const props: TokenPageProps = {
      token,
      addresses,
      chainId: chain.id,
      collectionAddress: addresses.token,
    }

    return {
      props,
    }
  } catch (e) {
    console.error('Error fetching token:', e)
    return {
      notFound: true,
    }
  }
}
