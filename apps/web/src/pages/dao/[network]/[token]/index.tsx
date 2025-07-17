import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { serverConfig } from '@buildeross/utils/wagmi/serverConfig'
import { Flex, Text, atoms, theme } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { isAddress } from 'viem'
import { useAccount, useReadContract } from 'wagmi'
import { readContract } from 'wagmi/actions'

import { Meta } from 'src/components/Meta'
import { auctionAbi } from 'src/data/contract/abis'
import getDAOAddresses from 'src/data/contract/requests/getDAOAddresses'
import { SDK } from 'src/data/subgraph/client'
import { OrderDirection, Token_OrderBy } from 'src/data/subgraph/sdk.generated'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import NogglesLogo from 'src/layouts/assets/builder-framed.svg'
import {
  Activity,
  PreAuction,
  PreAuctionForm,
  SectionHandler,
  SmartContracts,
} from 'src/modules/dao'
import { NextPageWithLayout } from 'src/pages/_app'
import { useChainStore } from 'src/stores/useChainStore'
import { DaoContractAddresses, useDaoStore } from 'src/stores/useDaoStore'

interface DaoPageProps {
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  collectionAddress: AddressType
}

const DaoPage: NextPageWithLayout<DaoPageProps> = ({ chainId, collectionAddress }) => {
  const { query } = useRouter()

  const { address: signerAddress } = useAccount()
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)

  const { data: owner } = useReadContract({
    abi: auctionAbi,
    address: addresses.auction,
    functionName: 'owner',
    chainId: chainId,
  })

  const sections = [
    {
      title: 'Activity',
      component: [<Activity key={'proposals'} />],
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

  const path = `/dao/${query.network}/${query.token}/${query.tokenId}?tab=${activeTab}`

  return (
    <Flex direction="column" pb="x30">
      <Meta title={'dao page'} path={path} />

      <PreAuction chain={chain} collectionAddress={collectionAddress} />

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

    const latestTokenId = await SDK.connect(chain.id)
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
