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
import { DecodedTransactions } from '@buildeross/ui/DecodedTransactions'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { getEscrowBundler, getEscrowBundlerV1 } from '@buildeross/utils/escrow'
import { atoms, Box, Flex, Paragraph } from '@buildeross/zord'
import { toLower } from 'lodash'
import React, { ReactNode, useMemo } from 'react'
import { useChainStore } from 'src/stores'
import { propPageWrapper } from 'src/styles/Proposals.css'
import useSWR from 'swr'

import { MilestoneDetails } from './MilestoneDetails'
import { proposalDescription } from './ProposalDescription.css'

const Section = ({ children, title }: { children: ReactNode; title: string }) => (
  <Box mb={{ '@initial': 'x6', '@768': 'x13' }}>
    <Box fontSize={20} mb={{ '@initial': 'x4', '@768': 'x5' }} fontWeight={'display'}>
      {title}
    </Box>
    {children}
  </Box>
)

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
  const { description, proposer, executionTransactionHash } = proposal

  const { displayName } = useEnsData(proposer)
  const chain = useChainStore((x) => x.chain)

  const { decodedTransactions } = useDecodedTransactions(chain.id, proposal)

  const decodedEscrowTxn = useMemo(
    () =>
      decodedTransactions?.find(
        (t) =>
          toLower(t.target) === toLower(getEscrowBundler(chain.id)) ||
          toLower(t.target) === toLower(getEscrowBundlerV1(chain.id))
      ),
    [chain.id, decodedTransactions]
  )

  const { data: tokenImage, error } = useSWR(
    !!collection && !!proposer
      ? ([SWR_KEYS.TOKEN_IMAGE, chain.id, collection, proposer] as const)
      : null,
    async ([_key, chainId, collection, proposer]) => {
      const data = await SubgraphSDK.connect(chainId).tokens({
        where: { owner: proposer.toLowerCase(), tokenContract: collection.toLowerCase() },
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
        {!!decodedEscrowTxn && (
          <Section title="Escrow Milestones">
            <MilestoneDetails
              decodedTransaction={decodedEscrowTxn}
              executionTransactionHash={executionTransactionHash}
              onOpenProposalReview={onOpenProposalReview}
            />
          </Section>
        )}

        <Section title="Description">
          <Paragraph overflow={'auto'}>
            {description && (
              <Box className={proposalDescription}>
                <MarkdownDisplay>{description}</MarkdownDisplay>
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
                  width={128}
                  height={128}
                  className={atoms({ borderRadius: 'small' })}
                />
              )}
            </Box>

            <Box>
              <a
                href={`${ETHERSCAN_BASE_URL[chain.id]}/address/${proposer}`}
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
          />
        </Section>
      </Flex>
    </Flex>
  )
}
