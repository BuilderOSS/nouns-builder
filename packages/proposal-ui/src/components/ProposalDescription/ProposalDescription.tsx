import {
  CLANKER_FACTORY_ADDRESS,
  PUBLIC_ZORA_NFT_CREATOR,
  ZORA_COIN_FACTORY_ADDRESS,
} from '@buildeross/constants/addresses'
import { useDecodedTransactions } from '@buildeross/hooks/useDecodedTransactions'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import {
  Proposal,
} from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import { DecodedTransactions } from '@buildeross/ui/DecodedTransactions'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { getEscrowBundler, getEscrowBundlerLegacy } from '@buildeross/utils/escrow'
import { walletSnippet } from '@buildeross/utils/helpers'
import {
  getSablierAirdropFactories,
  getSablierContracts,
} from '@buildeross/utils/sablier/contracts'
import { Box, Flex, Paragraph, Text } from '@buildeross/zord'
import { toLower } from 'lodash'
import React, { useMemo } from 'react'
import { zeroAddress } from 'viem'

import { propPageWrapper } from '../styles.css'
import { AirdropDetails } from './AirdropDetails'
import { CoinDetails } from './CoinDetails'
import { DropDetails } from './DropDetails'
import { MilestoneDetails } from './MilestoneDetails'
import { proposalDescription } from './ProposalDescription.css'
import { Section } from './Section'
import { StreamDetails } from './StreamDetails'

type ProposalDescriptionProps = {
  title?: string
  proposal: Proposal
  collection: string
  onOpenProposalReview: () => Promise<void>
  isPreview?: boolean
}

const getSafeDiscussionUrl = (value?: string | null): string | null => {
  if (!value) return null

  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }

    return value
  } catch {
    return null
  }
}

export const ProposalDescription: React.FC<ProposalDescriptionProps> = ({
  title,
  proposal,
  collection,
  onOpenProposalReview,
  isPreview = false,
}) => {
  const { displayName, ensAvatar } = useEnsData(proposal.proposer)
  const { displayName: representedDisplayName, ensAvatar: representedEnsAvatar } =
    useEnsData(proposal.representedAddress || undefined)
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const safeDiscussionUrl = getSafeDiscussionUrl(proposal.discussionUrl)

  const enableDecodedTransactions = !isPreview
  const { decodedTransactions } = useDecodedTransactions(
    chain.id,
    proposal,
    enableDecodedTransactions
  )

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

  // Check if proposal has Sablier airdrop creation transactions
  const hasSablierAirdrop = useMemo(() => {
    if (!proposal.targets) return false

    const { factoryMerkleInstant, factoryMerkleLL } = getSablierAirdropFactories(chain.id)

    return proposal.targets.some(
      (target) =>
        (factoryMerkleInstant && toLower(target) === toLower(factoryMerkleInstant)) ||
        (factoryMerkleLL && toLower(target) === toLower(factoryMerkleLL))
    )
  }, [proposal.targets, chain.id])

  // Check if proposal has coin creation transactions
  const hasCoinCreation = useMemo(() => {
    if (!proposal.targets) return false

    const zoraCoinFactory = ZORA_COIN_FACTORY_ADDRESS
    const clankerFactory = CLANKER_FACTORY_ADDRESS

    return proposal.targets.some((target) => {
      const targetLower = toLower(target)
      return (
        (zoraCoinFactory && targetLower === toLower(zoraCoinFactory)) ||
        (clankerFactory && targetLower === toLower(clankerFactory))
      )
    })
  }, [proposal.targets])

  // Check if proposal has drop creation transactions
  const hasDropCreation = useMemo(() => {
    if (!proposal.targets) return false

    const zoraCreatorAddress = PUBLIC_ZORA_NFT_CREATOR[chain.id]
    if (!zoraCreatorAddress || zoraCreatorAddress === zeroAddress) return false

    return proposal.targets.some(
      (target) => toLower(target) === toLower(zoraCreatorAddress)
    )
  }, [proposal.targets, chain.id])

  return (
    <Flex
      direction="column"
      w="100%"
      mx="auto"
      className={isPreview ? undefined : propPageWrapper}
    >
      <Flex
        direction={'column'}
        mt={isPreview ? undefined : { '@initial': 'x6', '@768': 'x13' }}
      >
        {title && (
          <Section title="Title">
            <Text fontSize={28} fontWeight={'display'}>
              {title}
            </Text>
            <Flex
              color={'text3'}
              mt={'x2'}
              align="center"
              gap="x1"
              wrap
              style={{ minWidth: 0 }}
            >
              <Text color={'text3'}>By</Text>
              <WalletIdentityWithPreview
                address={proposal.proposer as `0x${string}`}
                displayName={displayName || walletSnippet(proposal.proposer)}
                avatarSrc={ensAvatar}
                avatarSize="20"
                nameVariant="paragraph-sm"
                mobileTapBehavior="toggle"
                inline
              />
              {proposal.representedAddress && (
                <>
                  <Text color={'text3'}>on behalf of</Text>
                  <WalletIdentityWithPreview
                    address={proposal.representedAddress as `0x${string}`}
                    displayName={
                      representedDisplayName || walletSnippet(proposal.representedAddress)
                    }
                    avatarSrc={representedEnsAvatar}
                    avatarSize="20"
                    nameVariant="paragraph-sm"
                    mobileTapBehavior="toggle"
                    inline
                  />
                </>
              )}
            </Flex>
          </Section>
        )}

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

        {hasSablierAirdrop && <AirdropDetails proposal={proposal} />}

        {hasCoinCreation && <CoinDetails proposal={proposal} />}

        {hasDropCreation && <DropDetails proposal={proposal} />}

        <Section title="Description">
          <Paragraph overflow={'auto'}>
            {proposal.description && (
              <Box className={proposalDescription}>
                <MarkdownDisplay>{proposal.description}</MarkdownDisplay>
              </Box>
            )}
          </Paragraph>
        </Section>

        {safeDiscussionUrl && (
          <Section title="Discussion">
            <a href={safeDiscussionUrl} rel="noreferrer" target="_blank">
              {safeDiscussionUrl}
            </a>
          </Section>
        )}

        <Section title="Proposer" mb={isPreview ? 'x0' : undefined}>
          <Flex direction={'row'} placeItems={'center'}>
            <Flex direction="column" gap="x1" style={{ minWidth: 0 }}>
              <WalletIdentityWithPreview
                address={proposal.proposer as `0x${string}`}
                displayName={displayName || walletSnippet(proposal.proposer)}
                avatarSrc={ensAvatar}
                mobileTapBehavior="toggle"
                inline
              />
              {proposal.representedAddress && (
                <Flex align="center" gap="x1" wrap style={{ minWidth: 0 }}>
                  <Text color={'text3'}>on behalf of</Text>
                  <WalletIdentityWithPreview
                    address={proposal.representedAddress as `0x${string}`}
                    displayName={
                      representedDisplayName || walletSnippet(proposal.representedAddress)
                    }
                    avatarSrc={representedEnsAvatar}
                    mobileTapBehavior="toggle"
                    inline
                  />
                </Flex>
              )}
            </Flex>
          </Flex>
        </Section>

        {!isPreview && (
          <Section title="Proposed Transactions">
            <DecodedTransactions
              decodedTransactions={decodedTransactions}
              chainId={chain.id}
              addresses={addresses}
            />
          </Section>
        )}
      </Flex>
    </Flex>
  )
}
