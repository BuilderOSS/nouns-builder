import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import SWR_KEYS from '@buildeross/constants/swrKeys'
import { isChainIdSupportedByEAS } from '@buildeross/sdk/eas'
import type { Proposal_Filter } from '@buildeross/sdk/subgraph'
import { formatAndFetchState, getProposal, SubgraphSDK } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { isProposalOpen } from '@buildeross/utils/proposalState'
import { Box, Flex, Icon } from '@buildeross/zord'
import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { Fragment } from 'react'
import { Meta } from 'src/components/Meta'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import { SectionHandler } from 'src/modules/dao'
import {
  ProposalActions,
  ProposalDescription,
  ProposalDetailsGrid,
  ProposalHeader,
} from 'src/modules/proposal'
import { PropDates } from 'src/modules/proposal/components/PropDates'
import { ProposalVotes } from 'src/modules/proposal/components/ProposalVotes'
import type { NextPageWithLayout } from 'src/pages/_app'
import type { ProposalOgMetadata } from 'src/pages/api/og/proposal'
import { useChainStore } from 'src/stores'
import { type DaoContractAddresses, useDaoStore } from 'src/stores'
import { propPageWrapper } from 'src/styles/Proposals.css'
import useSWR, { unstable_serialize } from 'swr'
import { getAddress, isAddress, isAddressEqual } from 'viem'
import { useBalance } from 'wagmi'

export interface VotePageProps {
  proposalId: string
  daoName: string
  ogImageURL: string
  addresses: DaoContractAddresses
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

const VotePage: NextPageWithLayout<VotePageProps> = ({
  proposalId,
  daoName,
  ogImageURL,
}) => {
  const { query } = useRouter()
  const chain = useChainStore((x) => x.chain)
  const { addresses } = useDaoStore()

  const { data: balance } = useBalance({
    address: addresses?.treasury as `0x${string}`,
    chainId: chain.id,
  })

  const { data: proposal } = useSWR([SWR_KEYS.PROPOSAL, chain.id, proposalId], () =>
    getProposal(chain.id, proposalId)
  )

  const sections = React.useMemo(() => {
    if (!proposal) return []
    const sections = [
      {
        title: 'Details',
        component: [
          <ProposalDescription
            key="description"
            proposal={proposal}
            collection={query?.token as string}
          />,
        ],
      },
      {
        title: 'Votes',
        component: [<ProposalVotes key="votes" proposal={proposal} />],
      },
    ]

    if (isChainIdSupportedByEAS(chain.id)) {
      sections.push({
        title: 'Propdates',
        component: [<PropDates key="propdates" proposal={proposal} />],
      })
    }
    return sections
  }, [proposal, chain.id, query?.token])

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

  if (!proposal) {
    return null
  }

  return (
    <Fragment>
      <Meta
        title={`${daoName} - Prop ${proposal.proposalNumber}`}
        path={`/dao/${query.network}/${query.token}/vote/${query.id}`}
        image={ogImageURL}
        description={`View this proposal from ${daoName}`}
      />

      <Flex position="relative" direction="column">
        <Flex className={propPageWrapper} gap={{ '@initial': 'x2', '@768': 'x4' }}>
          <ProposalHeader proposal={proposal} />
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
          basePath={`/dao/${query.network}/${query.token}/vote/${query.id}`}
        />
      </Box>
    </Fragment>
  )
}

VotePage.getLayout = getDaoLayout

export default VotePage

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
  const collection = params?.token as AddressType
  const proposalIdOrNumber = params?.id as `0x${string}`
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
      addresses,
      chainId: chain.id,
    },
  }
}
