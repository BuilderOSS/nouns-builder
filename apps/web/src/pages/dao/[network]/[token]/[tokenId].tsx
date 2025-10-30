import { DaoAuctionSection, type TokenWithDao } from '@buildeross/auction-ui'
import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_ALL_CHAINS, PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { SUCCESS_MESSAGES } from '@buildeross/constants/messages'
import {
  About,
  Activity,
  Admin,
  Feed,
  SectionHandler,
  SmartContracts,
  Treasury,
} from '@buildeross/dao-ui'
import { useVotes } from '@buildeross/hooks/useVotes'
import { OrderDirection, SubgraphSDK, Token_OrderBy } from '@buildeross/sdk/subgraph'
import { DaoContractAddresses } from '@buildeross/stores'
import { AddressType, Chain, CHAIN_ID } from '@buildeross/types'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { isPossibleMarkdown } from '@buildeross/utils/helpers'
import { Flex } from '@buildeross/zord'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { Meta } from 'src/components/Meta'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import { DaoOgMetadata } from 'src/pages/api/og/dao'
import { isAddress } from 'viem'
import { useAccount } from 'wagmi'

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
  const { query, replace, push, pathname } = useRouter()

  const { address } = useAccount()

  const chain = PUBLIC_ALL_CHAINS.find((x) => x.id === chainId) as Chain

  const { hasThreshold } = useVotes({
    chainId: chainId,
    signerAddress: address,
    collectionAddress: collection,
    governorAddress: addresses.governor,
  })

  const handleCloseSuccessModal = React.useCallback(async () => {
    const nextQuery = { ...query }
    delete nextQuery.message

    await replace(
      {
        pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true }
    )
  }, [replace, pathname, query])

  const openTab = React.useCallback(
    async (tab: string, scroll?: boolean) => {
      const nextQuery = { ...query } // Get existing query params
      nextQuery['tab'] = tab

      await push(
        {
          pathname,
          query: nextQuery,
        },
        undefined,
        { shallow: true, scroll }
      )
    },
    [push, pathname, query]
  )

  const openProposalCreatePage = React.useCallback(async () => {
    await push({
      pathname: `/dao/[network]/[token]/proposal/create`,
      query: {
        network: chain.slug,
        token: addresses.token,
      },
    })
  }, [push, chain.slug, addresses.token])

  const openProposalReviewPage = React.useCallback(async () => {
    await push({
      pathname: `/dao/[network]/[token]/proposal/review`,
      query: {
        network: chain.slug,
        token: addresses.token,
      },
    })
  }, [push, chain.slug, addresses.token])

  const sections = React.useMemo(() => {
    const aboutSection = {
      title: 'About',
      component: [<About key={'about'} onOpenTreasury={() => openTab('treasury')} />],
    }
    const treasurySection = {
      title: 'Treasury',
      component: [<Treasury key={'treasury'} />],
    }
    const proposalsSection = {
      title: 'Activity',
      component: [
        <Activity
          key={'proposals'}
          onOpenProposalCreate={openProposalCreatePage}
          onOpenProposalReview={openProposalReviewPage}
        />,
      ],
    }
    const adminSection = {
      title: 'Admin',
      component: [<Admin key={'admin'} onOpenProposalReview={openProposalReviewPage} />],
    }
    const smartContractsSection = {
      title: 'Contracts',
      component: [<SmartContracts key={'smart_contracts'} />],
    }
    const daoFeed = {
      title: 'Feed',
      component: [<Feed key="feed" collectionAddress={collection} />],
    }

    const publicSections = [
      aboutSection,
      daoFeed,
      treasurySection,
      proposalsSection,
      smartContractsSection,
    ]

    return hasThreshold ? [...publicSections, adminSection] : publicSections
  }, [hasThreshold, collection, openTab, openProposalCreatePage, openProposalReviewPage])

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

  const activeTab = query.tab ? (query.tab as string) : 'about'
  const path = `/dao/${chain.slug}/${addresses.token}/${token.tokenId}?tab=${activeTab}`

  const onAuctionCreated = React.useCallback(
    (tokenId: bigint) => {
      push({
        pathname: `/dao/[network]/[token]/[tokenId]`,
        query: {
          network: chain.slug,
          token: addresses.token,
          tokenId: tokenId.toString(),
        },
      })
    },
    [push, chain.slug, addresses.token]
  )

  const referral = useMemo(() => {
    if (!query.referral) return undefined
    const referralStr = Array.isArray(query.referral) ? query.referral[0] : query.referral
    if (isAddress(referralStr)) return referralStr as AddressType
    return undefined
  }, [query.referral])

  return (
    <Flex direction="column" pb="x30">
      <Meta
        title={name}
        type={`${name}:nft`}
        image={ogImageURL}
        path={path}
        description={ogDescription}
      />

      <DaoAuctionSection
        chain={chain}
        collection={collection}
        auctionAddress={addresses.auction!}
        token={token}
        onAuctionCreated={onAuctionCreated}
        referral={referral}
      />
      <SectionHandler
        sections={sections}
        activeTab={activeTab}
        onTabChange={(tab) => openTab(tab, false)}
      />

      <AnimatedModal
        open={query.message === SUCCESS_MESSAGES.PROPOSAL_SUBMISSION_SUCCESS}
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

    const addresses: DaoContractAddresses = {
      token: collection,
      metadata: metadataAddress,
      treasury: treasuryAddress,
      governor: governorAddress,
      auction: auctionAddress,
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
