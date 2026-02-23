import {
  CLANKER_FACTORY_ADDRESS,
  PUBLIC_ZORA_NFT_CREATOR,
} from '@buildeross/constants/addresses'
import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { useDecodedTransactions } from '@buildeross/hooks/useDecodedTransactions'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import {
  OrderDirection,
  Proposal,
  SubgraphSDK,
  Token_OrderBy,
} from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { DecodedTransactions } from '@buildeross/ui/DecodedTransactions'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { getEscrowBundler, getEscrowBundlerLegacy } from '@buildeross/utils/escrow'
import { getSablierContracts } from '@buildeross/utils/sablier/contracts'
import { atoms, Box, Flex, Paragraph } from '@buildeross/zord'
import { coinFactoryAddress } from '@zoralabs/protocol-deployments'
import { toLower } from 'lodash'
import React, { useMemo } from 'react'
import useSWR from 'swr'

import { propPageWrapper } from '../styles.css'
import { CoinDetails } from './CoinDetails'
import { DropDetails } from './DropDetails'
import { MilestoneDetails } from './MilestoneDetails'
import { proposalDescription } from './ProposalDescription.css'
import { Section } from './Section'
import { StreamDetails } from './StreamDetails'

type ProposalDescriptionProps = {
  proposal: Proposal
  collection: string
  onOpenProposalReview: () => Promise<void>
}

export const ProposalDescription: React.FC<ProposalDescriptionProps> = ({
  proposal,
  collection,
  onOpenProposalReview,
}) => {
  const { displayName } = useEnsData(proposal.proposer)
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()

  const { decodedTransactions } = useDecodedTransactions(chain.id, proposal)

  // Check if proposal has escrow milestone transactions
  const hasEscrowMilestone = useMemo(() => {
    if (!proposal.targets) return false

    const escrowBundler = getEscrowBundler(chain.id)
    const escrowBundlerLegacy = getEscrowBundlerLegacy(chain.id)

    return proposal.targets.some(
      (target) =>
        toLower(target) === toLower(escrowBundler) ||
        toLower(target) === toLower(escrowBundlerLegacy)
    )
  }, [proposal.targets, chain.id])

  // Check if proposal has Sablier stream transactions
  const hasSablierStream = useMemo(() => {
    if (!proposal.targets) return false

    const sablierContracts = getSablierContracts(chain.id)

    return proposal.targets.some(
      (target) =>
        (sablierContracts.batchLockup &&
          toLower(target) === toLower(sablierContracts.batchLockup)) ||
        (sablierContracts.lockup && toLower(target) === toLower(sablierContracts.lockup))
    )
  }, [proposal.targets, chain.id])

  // Check if proposal has coin creation transactions
  const hasCoinCreation = useMemo(() => {
    if (!proposal.targets) return false

    const zoraCoinFactory =
      coinFactoryAddress[chain.id as keyof typeof coinFactoryAddress]
    const clankerFactory = CLANKER_FACTORY_ADDRESS

    return proposal.targets.some((target) => {
      const targetLower = toLower(target)
      return (
        (zoraCoinFactory && targetLower === toLower(zoraCoinFactory)) ||
        (clankerFactory && targetLower === toLower(clankerFactory))
      )
    })
  }, [proposal.targets, chain.id])

  // Check if proposal has drop creation transactions
  const hasDropCreation = useMemo(() => {
    if (!proposal.targets) return false

    const zoraCreatorAddress = PUBLIC_ZORA_NFT_CREATOR[chain.id]
    if (!zoraCreatorAddress) return false

    return proposal.targets.some(
      (target) => toLower(target) === toLower(zoraCreatorAddress)
    )
  }, [proposal.targets, chain.id])

  const { data: tokenImage, error } = useSWR(
    !!collection && !!proposal.proposer
      ? ([SWR_KEYS.TOKEN_IMAGE, chain.id, collection, proposal.proposer] as const)
      : null,
    async ([_key, _chainId, _collection, _proposer]) => {
      const data = await SubgraphSDK.connect(_chainId).tokens({
        where: {
          owner: _proposer.toLowerCase(),
          tokenContract: _collection.toLowerCase(),
        },
        first: 1,
        orderBy: Token_OrderBy.MintedAt,
        orderDirection: OrderDirection.Asc,
      })
      return data?.tokens?.[0]?.image
    },
    { revalidateOnFocus: false }
  )

  return (
    <Flex className={propPageWrapper}>
      <Flex direction={'column'} mt={{ '@initial': 'x6', '@768': 'x13' }}>
        {hasEscrowMilestone && (
          <MilestoneDetails
            proposal={proposal}
            onOpenProposalReview={onOpenProposalReview}
          />
        )}

        {hasSablierStream && (
          <StreamDetails
            proposal={proposal}
            onOpenProposalReview={onOpenProposalReview}
          />
        )}

        {hasCoinCreation && (
          <CoinDetails proposal={proposal} onOpenProposalReview={onOpenProposalReview} />
        )}

        {hasDropCreation && (
          <DropDetails proposal={proposal} onOpenProposalReview={onOpenProposalReview} />
        )}

        <Section title="Description">
          <Paragraph overflow={'auto'}>
            {proposal.description && (
              <Box className={proposalDescription}>
                <MarkdownDisplay>{proposal.description}</MarkdownDisplay>
              </Box>
            )}
          </Paragraph>
        </Section>

        <Section title="Proposer">
          <Flex direction={'row'} placeItems={'center'}>
            <Box
              backgroundColor="background2"
              width={'x8'}
              height={'x8'}
              mr={'x2'}
              borderRadius={'small'}
              position="relative"
            >
              {!!tokenImage && !error && (
                <img
                  alt="proposer"
                  src={tokenImage}
                  className={atoms({ borderRadius: 'small' })}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </Box>

            <Box>
              <a
                href={`${ETHERSCAN_BASE_URL[chain.id]}/address/${proposal.proposer}`}
                rel="noreferrer"
                target="_blank"
              >
                {displayName}
              </a>
            </Box>
          </Flex>
        </Section>

        <Section title="Proposed Transactions">
          <DecodedTransactions
            decodedTransactions={decodedTransactions}
            chainId={chain.id}
            addresses={addresses}
          />
        </Section>
      </Flex>
    </Flex>
  )
}
