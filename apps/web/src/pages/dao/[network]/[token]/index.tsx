import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { auctionAbi, getDAOAddresses } from '@buildeross/sdk/contract'
import { OrderDirection, SubgraphSDK, Token_OrderBy } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { serverConfig } from '@buildeross/utils/wagmi/serverConfig'
import { atoms, Flex, Text, theme } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { Meta } from 'src/components/Meta'
import NogglesLogo from 'src/layouts/assets/builder-framed.svg'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import {
  Activity,
  PreAuction,
  PreAuctionForm,
  SectionHandler,
  SmartContracts,
} from 'src/modules/dao'
import { NextPageWithLayout } from 'src/pages/_app'
import { DaoContractAddresses, useChainStore, useDaoStore } from 'src/stores'
import { isAddress } from 'viem'
import { useAccount, useReadContract } from 'wagmi'
import { readContract } from 'wagmi/actions'

interface DaoPageProps {
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  collectionAddress: AddressType
}

const DaoPage: NextPageWithLayout<DaoPageProps> = ({ chainId, collectionAddress }) => {
  const { query, pathname, push } = useRouter()

  const { address: signerAddress } = useAccount()
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)

  const { data: owner } = useReadContract({
    abi: auctionAbi,
    address: addresses.auction,
    functionName: 'owner',
    chainId: chainId,
  })

  const openAdminTab = React.useCallback(() => {
    const current = { ...query } // Get existing query params
    current['tab'] = 'admin'

    push(
      {
        pathname,
        query: current,
      },
      undefined,
      { shallow: true } // Prevent full page reload
    )
  }, [push, pathname, query])

  const openTokenPage = React.useCallback(
    (tokenId: number) => push(`/dao/${query.network}/${query.token}/${tokenId}`),
    [push, query.network, query.token]
  )

  const openProposalCreatePage = React.useCallback(
    () => push(`/dao/${query.network}/${query.token}/proposal/create`),
    [push, query.network, query.token]
  )

  const openProposalReviewPage = React.useCallback(
    () => push(`/dao/${query.network}/${query.token}/proposal/review`),
    [push, query.network, query.token]
  )

  const sections = [
    {
      title: 'Activity',
      component: [
        <Activity
          key={'proposals'}
          onOpenProposalCreate={openProposalCreatePage}
          onOpenProposalReview={openProposalReviewPage}
        />,
      ],
    },
    {
      title: 'Admin',
      component: [<PreAuctionForm key={'admin'} />],
    },
    {
      title: 'Smart Contracts',
      component: [<SmartContracts key={'smart_contracts'} />],
    },
  ]

  if (!owner) {
    return null
  }

  const isOwner = owner === signerAddress

  if (!isOwner) {
    return (
      <Flex direction={'column'} align={'center'} width={'100%'} height={'100vh'}>
        <Flex mt={'x64'} direction="column" align={'center'}>
          <NogglesLogo
            fill={theme.colors.text4}
            className={atoms({ width: 'x23', cursor: 'pointer' })}
          />
          <Text mt={'x2'} color="text4">
            There’s nothing here yet
          </Text>
        </Flex>
      </Flex>
    )
  }

  const activeTab = query?.tab ? (query.tab as string) : 'activity'
  const path = `/dao/${query.network}/${query.token}/?tab=${activeTab}`

  return (
    <Flex direction="column" pb="x30">
      <Meta title={'dao page'} path={path} />

      <PreAuction
        chain={chain}
        collectionAddress={collectionAddress}
        onOpenAuction={openTokenPage}
        onOpenSettings={openAdminTab}
      />

      <SectionHandler
        sections={sections}
        activeTab={activeTab}
        basePath={`/dao/${query.network}/${collectionAddress}`}
      />
    </Flex>
  )
}

DaoPage.getLayout = getDaoLayout

export default DaoPage

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { maxAge, swr } = CACHE_TIMES.DAO_INFO
  context.res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )

  const collectionAddress = context?.params?.token as AddressType
  const network = context?.params?.network
  const tab = context?.query?.tab as string
  const referral = context?.query?.referral as string
  const message = context?.query?.message as string

  const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.slug === network)

  if (!isAddress(collectionAddress) || !chain) {
    return {
      notFound: true,
    }
  }

  try {
    const addresses = await getDAOAddresses(chain.id, collectionAddress)
    if (!addresses) {
      return {
        notFound: true,
      }
    }

    const latestTokenId = await SubgraphSDK.connect(chain.id)
      .tokens({
        where: {
          dao: collectionAddress.toLowerCase(),
        },
        orderBy: Token_OrderBy.TokenId,
        orderDirection: OrderDirection.Desc,
        first: 1,
      })
      .then((x) => (x.tokens.length > 0 ? x.tokens[0].tokenId : undefined))

    const owner = await readContract(serverConfig, {
      abi: auctionAbi,
      address: addresses.auction as AddressType,
      functionName: 'owner',
      chainId: chain.id,
    })

    const initialized: boolean =
      owner === addresses.treasury && latestTokenId !== undefined

    if (!initialized) {
      return {
        props: {
          chainId: chain.id,
          addresses,
          collectionAddress,
        },
      }
    }

    if (!tab && !referral) {
      return {
        redirect: {
          destination: `/dao/${network}/${collectionAddress}/${latestTokenId}`,
          permanent: false,
        },
      }
    }

    const params = new URLSearchParams()
    if (tab) params.set('tab', tab)
    if (referral) params.set('referral', referral)
    if (message) params.set('message', message)

    return {
      redirect: {
        destination: `/dao/${network}/${collectionAddress}/${latestTokenId}?${params.toString()}`,
        permanent: false,
      },
    }
  } catch (e) {
    return {
      notFound: true,
    }
  }
}
