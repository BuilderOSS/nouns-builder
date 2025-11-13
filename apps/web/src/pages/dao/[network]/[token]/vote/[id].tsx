import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { SectionHandler } from '@buildeross/dao-ui'
import {
  PropDates,
  ProposalActions,
  ProposalDescription,
  ProposalDetailsGrid,
  ProposalHeader,
  ProposalVotes,
} from '@buildeross/proposal-ui'
import type { Proposal_Filter } from '@buildeross/sdk/subgraph'
import {
  formatAndFetchState,
  getProposal,
  isChainIdSupportedByEAS,
  SubgraphSDK,
} from '@buildeross/sdk/subgraph'
import { type DaoContractAddresses, useChainStore } from '@buildeross/stores'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { isProposalOpen } from '@buildeross/utils/proposalState'
import { getProposalWarning } from '@buildeross/utils/warnings'
import { Box, Flex, Icon } from '@buildeross/zord'
import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { Fragment } from 'react'
import { Meta } from 'src/components/Meta'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import type { NextPageWithLayout } from 'src/pages/_app'
import type { ProposalOgMetadata } from 'src/pages/api/og/proposal'
import { votePageWrapper } from 'src/styles/vote.css'
import useSWR, { unstable_serialize } from 'swr'
import { getAddress, isAddress } from 'viem'
import { useBalance } from 'wagmi'

export interface VotePageProps {
  proposalNumber: number
  proposalId: string
  daoName: string
  ogImageURL: string
  addresses: DaoContractAddresses
  chainId: CHAIN_ID
}

const VotePage: NextPageWithLayout<VotePageProps> = ({
  proposalNumber,
  proposalId,
  daoName,
  ogImageURL,
  chainId,
  addresses,
}) => {
  const chain = useChainStore((state) => state.chain)
  const { query, push, pathname } = useRouter()

  const { data: balance } = useBalance({
    address: addresses.treasury,
    chainId: chainId,
  })

  const { data: proposal } = useSWR(
    chainId && proposalId ? ([SWR_KEYS.PROPOSAL, chainId, proposalId] as const) : null,
    ([, _chainId, _proposalId]) => getProposal(_chainId, _proposalId)
  )

  const openProposalReviewPage = React.useCallback(async () => {
    await push({
      pathname: `/dao/[network]/[token]/proposal/review`,
      query: {
        network: chain.slug,
        token: addresses.token,
      },
    })
  }, [push, chain.slug, addresses.token])

  const openDaoActivityPage = React.useCallback(async () => {
    await push({
      pathname: `/dao/[network]/[token]`,
      query: {
        network: chain.slug,
        token: addresses.token,
        tab: 'activity',
      },
    })
  }, [push, chain.slug, addresses.token])

  const sections = React.useMemo(() => {
    if (!proposal || !addresses.token) return []
    const sections = [
      {
        title: 'Details',
        component: [
          <ProposalDescription
            key="description"
            proposal={proposal}
            collection={addresses.token}
            onOpenProposalReview={openProposalReviewPage}
          />,
        ],
      },
      {
        title: 'Votes',
        component: [<ProposalVotes key="votes" proposal={proposal} />],
      },
    ]

    if (isChainIdSupportedByEAS(chainId)) {
      sections.push({
        title: 'Propdates',
        component: [<PropDates key="propdates" proposal={proposal} />],
      })
    }
    return sections
  }, [proposal, chainId, addresses.token, openProposalReviewPage])

  const displayActions = proposal ? isProposalOpen(proposal.state) : false

  const { proposer, state, values } = proposal ?? {}
  const treasuryBalance = balance?.value
  const displayWarning = React.useMemo(() => {
    if (!proposer || state == null || !values) return ''
    return getProposalWarning({
      proposer,
      proposalState: state,
      proposalValues: values,
      treasuryBalance,
      daoName,
    })
  }, [proposer, state, values, treasuryBalance, daoName])

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

  if (!proposal) {
    return null
  }

  return (
    <Fragment>
      <Meta
        title={`${daoName} - Prop ${proposal.proposalNumber}`}
        path={`/dao/${chain.slug}/${addresses.token}/vote/${proposalNumber}`}
        image={ogImageURL}
        description={`View this proposal from ${daoName}`}
      />

      <Flex position="relative" direction="column">
        <Flex className={votePageWrapper} gap={{ '@initial': 'x2', '@768': 'x4' }}>
          <ProposalHeader proposal={proposal} handleBack={openDaoActivityPage} />
          <>
            {displayWarning && (
              <Flex
                w="100%"
                backgroundColor="warning"
                color="onWarning"
                p="x4"
                borderRadius="curved"
                align="center"
                justify="center"
              >
                <Icon fill="onWarning" id="warning" mr="x2" />
                <Box fontWeight={'heading'}>{displayWarning}</Box>
              </Flex>
            )}

            {displayActions && <ProposalActions daoName={daoName} proposal={proposal} />}
          </>

          <ProposalDetailsGrid proposal={proposal} />
        </Flex>
      </Flex>

      <Box mt="x12" pb="x30">
        <SectionHandler
          sections={sections}
          activeTab={query.tab ? (query.tab as string) : 'Details'}
          onTabChange={(tab) => openTab(tab, false)}
        />
      </Box>
    </Fragment>
  )
}

VotePage.getLayout = getDaoLayout

export default VotePage

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
  const collection = params?.token as AddressType
  const proposalIdOrNumber = params?.id as string
  const network = params?.network as string

  const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.slug === network)

  if (!chain || !isAddress(collection)) {
    return {
      notFound: true,
    }
  }

  const env = process.env.VERCEL_ENV || 'development'
  const protocol = env === 'development' ? 'http' : 'https'

  let where: Proposal_Filter

  where = proposalIdOrNumber.startsWith('0x')
    ? {
        proposalId: proposalIdOrNumber.toLowerCase(),
      }
    : {
        proposalNumber: Number.parseInt(proposalIdOrNumber),
        dao: collection.toLowerCase(),
      }

  const data = await SubgraphSDK.connect(chain.id)
    .proposalOGMetadata({
      where,
      first: 1,
    })
    .then((x) => (x.proposals.length > 0 ? x.proposals[0] : undefined))

  if (!data) {
    return {
      notFound: true,
    }
  }

  const proposal = await formatAndFetchState(chain.id, data)

  if (!proposal) {
    return {
      notFound: true,
    }
  }

  if (getAddress(proposal.dao.tokenAddress) !== getAddress(collection)) {
    return {
      notFound: true,
    }
  }

  const {
    name,
    contractImage,
    tokenAddress,
    metadataAddress,
    governorAddress,
    treasuryAddress,
    auctionAddress,
  } = data.dao

  const ogMetadata: ProposalOgMetadata = {
    proposal: {
      proposalNumber: proposal.proposalNumber,
      title: proposal.title,
      forVotes: proposal.forVotes,
      againstVotes: proposal.againstVotes,
      abstainVotes: proposal.abstainVotes,
      state: proposal.state,
    },
    daoName: name,
    daoImage: contractImage,
    tokenAddress,
    chainId: chain.id,
  }

  const addresses: DaoContractAddresses = {
    token: tokenAddress,
    metadata: metadataAddress,
    governor: governorAddress,
    treasury: treasuryAddress,
    auction: auctionAddress,
  }

  const ogImageURL = `${protocol}://${
    req.headers.host
  }/api/og/proposal?data=${encodeURIComponent(JSON.stringify(ogMetadata))}`

  const { maxAge, swr } = isProposalOpen(proposal.state)
    ? CACHE_TIMES.IN_PROGRESS_PROPOSAL
    : CACHE_TIMES.SETTLED_PROPOSAL

  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )

  return {
    props: {
      fallback: {
        [unstable_serialize([SWR_KEYS.PROPOSAL, chain.id, proposal.proposalId])]:
          proposal,
      },
      daoName: name,
      ogImageURL,
      proposalId: proposal.proposalId,
      proposalNumber: proposal.proposalNumber,
      addresses,
      chainId: chain.id,
    },
  }
}
