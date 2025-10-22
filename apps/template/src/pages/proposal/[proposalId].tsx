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
import { isChainIdSupportedByEAS } from '@buildeross/sdk/eas'
import type { Proposal_Filter } from '@buildeross/sdk/subgraph'
import { formatAndFetchState, getProposal, SubgraphSDK } from '@buildeross/sdk/subgraph'
import { useDaoStore } from '@buildeross/stores'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { isProposalOpen } from '@buildeross/utils/proposalState'
import { Box, Flex, Icon } from '@buildeross/zord'
import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { Fragment } from 'react'
import useSWR, { unstable_serialize } from 'swr'
import { getAddress, isAddressEqual } from 'viem'
import { useBalance } from 'wagmi'

import { getDaoConfig } from '@/config'

export interface VotePageProps {
  proposalNumber: number
  proposalId: string
  daoName: string
  chainId: CHAIN_ID
}

const BAD_ACTORS = [
  '0xfd637806e0D22Ca8158AB8bb5826e6fEDa82c15f',
  '0xb8fa1f523976008e9db686fcfdb5e57f1ca43f50',
]

const checkDrain = (values: string[], treasuryBalance: bigint) => {
  const proposalValue = values.reduce((acc, numStr) => acc + BigInt(numStr), BigInt(0))
  const thresholdAmt = (treasuryBalance * BigInt(90)) / BigInt(100)

  return proposalValue >= thresholdAmt
}

const ProposalDetailPage: React.FC<VotePageProps> = ({
  proposalId,
  daoName,
  chainId,
}) => {
  const addresses = useDaoStore((state) => state.addresses)
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
    await push('/proposal/review')
  }, [push])

  const openDaoActivityPage = React.useCallback(async () => {
    await push('/proposals')
  }, [push])

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

  const { displayActions, displayWarning } = React.useMemo(() => {
    if (!proposal) return { displayActions: false, displayWarning: false }
    const displayActions = isProposalOpen(proposal.state)
    const isBadActor = BAD_ACTORS.some((baddie) =>
      isAddressEqual(proposal.proposer, baddie as AddressType)
    )
    const isPossibleDrain = balance?.value
      ? checkDrain(proposal.values, balance?.value)
      : false

    const displayWarning = displayActions && (isBadActor || isPossibleDrain)

    return { displayActions, displayWarning }
  }, [proposal, balance])

  const openTab = React.useCallback(
    async (tab: string, scroll?: boolean) => {
      const nextQuery = { ...query }
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
      <Head>
        <title>{`${daoName} - Prop ${proposal.proposalNumber}`}</title>
        <meta
          property="og:title"
          content={`${daoName} - Prop ${proposal.proposalNumber}`}
        />
        <meta property="og:description" content={`View this proposal from ${daoName}`} />
      </Head>

      <Flex position="relative" direction="column" w="100%" align="center">
        <Flex
          direction="column"
          w="100%"
          gap={{ '@initial': 'x2', '@768': 'x4' }}
          style={{ maxWidth: 912 }}
        >
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
                <Box fontWeight={'heading'}>
                  {`Executing this proposal will transfer more than 90% of ${daoName}'s treasury.`}
                </Box>
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

export default ProposalDetailPage

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const proposalIdOrNumber = params?.proposalId as string
  const daoConfig = getDaoConfig()

  if (!daoConfig) {
    return {
      notFound: true,
    }
  }

  const { chain, addresses } = daoConfig

  let where: Proposal_Filter

  where = proposalIdOrNumber.startsWith('0x')
    ? {
        proposalId: proposalIdOrNumber.toLowerCase(),
      }
    : {
        proposalNumber: Number.parseInt(proposalIdOrNumber),
        dao: addresses.token.toLowerCase(),
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

  if (getAddress(proposal.dao.tokenAddress) !== getAddress(addresses.token)) {
    return {
      notFound: true,
    }
  }

  const { name } = data.dao

  return {
    props: {
      fallback: {
        [unstable_serialize([SWR_KEYS.PROPOSAL, chain.id, proposal.proposalId])]:
          proposal,
      },
      daoName: name,
      proposalId: proposal.proposalId,
      proposalNumber: proposal.proposalNumber,
      chainId: chain.id,
    },
  }
}
