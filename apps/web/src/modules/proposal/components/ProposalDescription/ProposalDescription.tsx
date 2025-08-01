import SWR_KEYS from '@buildeross/constants/swrKeys'
import { useDecodedTransactions } from '@buildeross/hooks/useDecodedTransactions'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { SubgraphSDK } from '@buildeross/sdk/subgraph'
import { Proposal } from '@buildeross/sdk/subgraph'
import { OrderDirection, Token_OrderBy } from '@buildeross/sdk/subgraph'
import { atoms, Box, Flex, Paragraph } from '@buildeross/zord'
import { toLower } from 'lodash'
import Image from 'next/image'
import React, { ReactNode, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import {
  getEscrowBundler,
  getEscrowBundlerV1,
} from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'
import { useChainStore } from 'src/stores/useChainStore'
import { propPageWrapper } from 'src/styles/Proposals.css'
import useSWR from 'swr'

import { DecodedTransactions } from './DecodedTransactions'
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
}

export const ProposalDescription: React.FC<ProposalDescriptionProps> = ({
  proposal,
  collection,
}) => {
  const { description, proposer, executionTransactionHash } = proposal

  const { displayName } = useEnsData(proposer)
  const chain = useChainStore((x) => x.chain)

  const decodedTransactions = useDecodedTransactions(chain.id, proposal)

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
      ? [SWR_KEYS.TOKEN_IMAGE, chain.id, collection, proposer]
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
            />
          </Section>
        )}

        <Section title="Description">
          <Paragraph overflow={'auto'}>
            {description && (
              <Box className={proposalDescription}>
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  remarkPlugins={[remarkGfm]}
                >
                  {description}
                </ReactMarkdown>
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
                <Image
                  alt="proposer"
                  src={tokenImage}
                  quality={50}
                  width={128}
                  height={128}
                  className={atoms({ borderRadius: 'small' })}
                />
              )}
            </Box>

            <Box>{displayName}</Box>
          </Flex>
        </Section>

        <Section title="Proposed Transactions">
          <DecodedTransactions decodedTransactions={decodedTransactions} />
        </Section>
      </Flex>
    </Flex>
  )
}
