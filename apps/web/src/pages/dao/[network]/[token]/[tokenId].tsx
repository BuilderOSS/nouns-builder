import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_ALL_CHAINS, PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { CAST_ENABLED } from '@buildeross/constants/farcasterEnabled'
import { SUCCESS_MESSAGES } from '@buildeross/constants/messages'
import { useVotes } from '@buildeross/hooks'
import { getEscrowDelegate } from '@buildeross/sdk/eas'
import { SubgraphSDK } from '@buildeross/sdk/subgraph'
import { OrderDirection, Token_OrderBy } from '@buildeross/sdk/subgraph'
import { TokenWithDaoQuery } from '@buildeross/sdk/subgraph'
import { AddressType, Chain, CHAIN_ID } from '@buildeross/types'
import { isPossibleMarkdown } from '@buildeross/utils/helpers'
import { Flex } from '@buildeross/zord'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { Meta } from 'src/components/Meta'
import AnimatedModal from 'src/components/Modal/AnimatedModal'
import { SuccessModalContent } from 'src/components/Modal/SuccessModalContent'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import {
  About,
  Activity,
  Admin,
  SectionHandler,
  SmartContracts,
  Treasury,
} from 'src/modules/dao'
import { DaoTopSection } from 'src/modules/dao/components/DaoTopSection'
import FeedTab from 'src/modules/dao/components/Feed/Feed'
import { NextPageWithLayout } from 'src/pages/_app'
import { DaoOgMetadata } from 'src/pages/api/og/dao'
import { DaoContractAddresses } from 'src/stores/useDaoStore'
import { useAccount } from 'wagmi'

export type TokenWithDao = NonNullable<TokenWithDaoQuery['token']>

interface TokenPageProps {
  collection: AddressType
  token: TokenWithDao
  name: string
  description: string
  addresses: DaoContractAddresses
  ogImageURL: string
  chainId: CHAIN_ID
  fallback?: Record<string, any>
}

const TokenPage: NextPageWithLayout<TokenPageProps> = ({
  collection,
  token,
  description,
  name,
  addresses,
  ogImageURL,
  chainId,
}) => {
  const { query, replace, pathname } = useRouter()
  const { address } = useAccount()

  const chain = PUBLIC_ALL_CHAINS.find((x) => x.id === chainId) as Chain

  const { hasThreshold } = useVotes({
    chainId: chainId,
    signerAddress: address,
    collectionAddress: collection,
    governorAddress: addresses?.governor,
  })

  const handleCloseSuccessModal = () => {
    replace(
      {
        pathname,
        query: { token: collection, network: chain.slug, tokenId: token.tokenId },
      },
      undefined,
      {
        shallow: true,
      }
    )
  }

  const sections = React.useMemo(() => {
    const aboutSection = {
      title: 'About',
      component: [<About key={'about'} />],
    }
    const treasurySection = {
      title: 'Treasury',
      component: [<Treasury key={'treasury'} />],
    }
    const proposalsSection = {
      title: 'Activity',
      component: [<Activity key={'proposals'} />],
    }
    const adminSection = {
      title: 'Admin',
      component: [<Admin key={'admin'} />],
    }
    const smartContractsSection = {
      title: 'Contracts',
      component: [<SmartContracts key={'smart_contracts'} />],
    }
    const daoFeed = {
      title: 'Feed',
      component: [<FeedTab key="feed" collectionAddress={collection} />],
    }

    const publicSections = [
      aboutSection,
      treasurySection,
      proposalsSection,
      smartContractsSection,
    ]

    const baseSections = hasThreshold ? [...publicSections, adminSection] : publicSections
    return CAST_ENABLED.includes(collection)
      ? [...baseSections.slice(0, 1), daoFeed, ...baseSections.slice(1)]
      : baseSections
  }, [hasThreshold, collection])

  const ogDescription = useMemo(() => {
    if (!description) return ''
    const isMarkdown = isPossibleMarkdown(description)

    // DAO descriptions are full of MD syntax and do not provide a pleasant
    // reading experience for social embeds. For this, we'll check if the
    // description is markdown and if so, we'll provide a generic description
    if (isMarkdown) {
      return `${
        name || 'This DAO'
      } was created on Nouns Builder. Please click the link to see more.`
    }
    // remove line breaks and formatting from og description
    const cleanDesc = description.replace(/(\r\n|\n|\r|\t|\v|\f|\\n)/gm, '')
    return cleanDesc.length > 111 ? `${cleanDesc.slice(0, 111)}...` : cleanDesc
  }, [description, name])

  const activeTab = query?.tab ? (query.tab as string) : 'about'

  const path = `/dao/${query.network}/${query.token}/${query.tokenId}?tab=${activeTab}`

  return (
    <Flex direction="column" pb="x30">
      <Meta
        title={name}
        type={`${name}:nft`}
        image={ogImageURL}
        path={path}
        description={ogDescription}
        farcaster={{
          name,
          contractAddress: collection,
          chain,
          image: token?.image || undefined,
        }}
      />

      <DaoTopSection
        chain={chain}
        collection={collection}
        auctionAddress={addresses.auction!}
        token={token}
      />
      <SectionHandler
        sections={sections}
        activeTab={activeTab}
        basePath={`/dao/${query.network}/${collection}/${token.tokenId}`}
      />

      <AnimatedModal
        open={query?.message === SUCCESS_MESSAGES.PROPOSAL_SUBMISSION_SUCCESS}
        close={handleCloseSuccessModal}
      >
        <SuccessModalContent
          title={`Proposal submitted`}
          subtitle={`Your Proposal has been successfully submitted. It might take a few minutes for it to appear.`}
          success
        />
      </AnimatedModal>
    </Flex>
  )
}

TokenPage.getLayout = getDaoLayout

export default TokenPage

const getLatestTokenIdRedirect = async (
  collectionAddress: AddressType,
  chain: Chain,
  network: string
): Promise<GetServerSidePropsResult<TokenPageProps>> => {
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

  if (!latestTokenId) return { notFound: true }

  return {
    redirect: {
      destination: `/dao/${network}/${collectionAddress}/${latestTokenId}`,
      permanent: false,
    },
  }
}

export const getServerSideProps: GetServerSideProps = async ({ params, res, req }) => {
  const collection = params?.token as AddressType
  const tokenId = params?.tokenId as string
  const network = params?.network as string

  try {
    const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.slug === network)
    if (!chain) throw new Error('Invalid network')

    const env = process.env.VERCEL_ENV || 'development'
    const protocol = env === 'development' ? 'http' : 'https'

    const token = await SubgraphSDK.connect(chain.id)
      .tokenWithDao({
        id: `${collection.toLowerCase()}:${tokenId}`,
      })
      .then((x) => x.token)

    if (!token) return getLatestTokenIdRedirect(collection, chain, network)

    const {
      name,
      description,
      contractImage,
      totalSupply,
      ownerCount,
      proposalCount,
      tokenAddress,
      metadataAddress,
      treasuryAddress,
      governorAddress,
      auctionAddress,
    } = token.dao

    const escrowDelegateAddress = (await getEscrowDelegate(
      tokenAddress,
      treasuryAddress,
      chain.id
    )) as AddressType

    const addresses: DaoContractAddresses = {
      token: collection,
      metadata: metadataAddress,
      treasury: treasuryAddress,
      governor: governorAddress,
      auction: auctionAddress,
      escrowDelegate: escrowDelegateAddress,
    }

    const daoOgMetadata: DaoOgMetadata = {
      name,
      contractImage,
      totalSupply,
      ownerCount,
      proposalCount,
      chainId: chain.id,
      treasuryAddress,
      tokenAddress,
    }

    const ogImageURL = `${protocol}://${
      req.headers.host
    }/api/og/dao?data=${encodeURIComponent(JSON.stringify(daoOgMetadata))}`

    const { maxAge, swr } = CACHE_TIMES.TOKEN_INFO
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
    )

    const props: TokenPageProps = {
      collection,
      name,
      token,
      description: description || '',
      addresses,
      ogImageURL,
      chainId: chain.id,
    }

    return {
      props,
    }
  } catch (e) {
    return {
      notFound: true,
    }
  }
}
