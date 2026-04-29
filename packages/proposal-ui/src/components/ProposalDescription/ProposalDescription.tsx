import {
  CLANKER_FACTORY_ADDRESS,
  PUBLIC_ZORA_NFT_CREATOR,
  ZORA_COIN_FACTORY_ADDRESS,
} from '@buildeross/constants/addresses'
import { useDecodedTransactions } from '@buildeross/hooks/useDecodedTransactions'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import {
  ProposalDescriptionMetadataV1,
  ProposalTransactionBundle,
  SimulationOutput,
  TransactionBundle,
} from '@buildeross/types'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import { DecodedTransactions } from '@buildeross/ui/DecodedTransactions'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { getEscrowBundler, getEscrowBundlerLegacy } from '@buildeross/utils/escrow'
import { walletSnippet } from '@buildeross/utils/helpers'
import {
  getSablierAirdropFactories,
  getSablierContracts,
} from '@buildeross/utils/sablier/contracts'
import { atoms, Box, Flex, Icon, Paragraph, Stack, Text } from '@buildeross/zord'
import { toLower } from 'lodash'
import React, { useMemo } from 'react'
import { zeroAddress } from 'viem'

import { TRANSACTION_TYPES } from '../../constants'
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
  // DEPRECATED: Will be removed in the future, use `addresses.token` instead
  collection?: string
  onOpenProposalReview: () => Promise<void>
  isPreview?: boolean
  showMetadataSections?: boolean
  previewTransactions?: TransactionBundle[]
  previewSimulations?: SimulationOutput[]
}

type BundleWithRange = ProposalTransactionBundle & {
  bundleIndex: number
  start: number
  end: number
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

const normalizeForCompare = (value?: string) =>
  (value || '')
    .toLowerCase()
    .replace(/[\s\-_.:;,!?'"`~()\[\]{}]+/g, ' ')
    .trim()

const getBundleIntent = (summary: string | undefined, fallback: string | undefined) => {
  if (!summary) return fallback
  if (!fallback) return summary
  return normalizeForCompare(summary) === normalizeForCompare(fallback)
    ? fallback
    : summary
}

export const ProposalDescription: React.FC<ProposalDescriptionProps> = ({
  title,
  proposal,
  onOpenProposalReview,
  isPreview = false,
  showMetadataSections = true,
  previewTransactions,
  previewSimulations,
}) => {
  const proposalMetadata = (proposal as Proposal & { metadata?: string | null }).metadata

  const { displayName, ensAvatar } = useEnsData(proposal.proposer)
  const { displayName: representedDisplayName, ensAvatar: representedEnsAvatar } =
    useEnsData(proposal.representedAddress || undefined)
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const safeDiscussionUrl = getSafeDiscussionUrl(proposal.discussionUrl)

  const { decodedTransactions } = useDecodedTransactions(chain.id, proposal)

  const parsedProposalMetadata = useMemo<
    ProposalDescriptionMetadataV1 | undefined
  >(() => {
    if (!proposalMetadata) return undefined

    try {
      return JSON.parse(proposalMetadata) as ProposalDescriptionMetadataV1
    } catch (_error) {
      return undefined
    }
  }, [proposalMetadata])

  const metadataBundles = useMemo(() => {
    if (isPreview) {
      return (previewTransactions || []).map((transaction) => ({
        type: transaction.type,
        summary: transaction.summary,
        callCount: transaction.transactions.length,
      }))
    }

    const bundles = parsedProposalMetadata?.transactionBundles

    if (!Array.isArray(bundles)) return undefined

    const isValid = bundles.every(
      (bundle) =>
        bundle &&
        typeof bundle.type === 'string' &&
        typeof bundle.callCount === 'number' &&
        bundle.callCount > 0
    )

    return isValid ? bundles : undefined
  }, [isPreview, parsedProposalMetadata, previewTransactions])

  const bundlesWithRanges = useMemo(() => {
    if (!decodedTransactions?.length || !metadataBundles?.length) return undefined

    let cursor = 0
    const ranges: BundleWithRange[] = []

    for (let bundleIndex = 0; bundleIndex < metadataBundles.length; bundleIndex++) {
      const bundle = metadataBundles[bundleIndex]
      const start = cursor
      const end = cursor + bundle.callCount
      ranges.push({ ...bundle, bundleIndex, start, end })
      cursor = end
    }

    if (cursor !== decodedTransactions.length) {
      console.warn(
        'Proposal metadata bundle count mismatch; falling back to decoded-only.'
      )
      return undefined
    }

    return ranges
  }, [decodedTransactions, metadataBundles])

  const proposalMetadataForSummary = useMemo<
    ProposalDescriptionMetadataV1 | undefined
  >(() => {
    if (isPreview) {
      return {
        version: 1,
        title: title ?? proposal.title ?? '',
        description: proposal.description || '',
        representedAddress: proposal.representedAddress || undefined,
        discussionUrl: proposal.discussionUrl || undefined,
        transactionBundles: metadataBundles,
      }
    }

    return parsedProposalMetadata
  }, [
    isPreview,
    metadataBundles,
    parsedProposalMetadata,
    proposal.description,
    proposal.discussionUrl,
    proposal.representedAddress,
    proposal.title,
    title,
  ])

  const failedSimulationByIndex = useMemo(() => {
    if (!isPreview || !previewSimulations?.length) return {}

    return previewSimulations
      .filter((simulation) => simulation.status === false)
      .reduce<Record<number, SimulationOutput>>((acc, simulation) => {
        acc[simulation.index] = simulation
        return acc
      }, {})
  }, [isPreview, previewSimulations])

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
        {showMetadataSections && title && (
          <Section title="Title">
            <Text fontSize={28} fontWeight={'display'}>
              {title}
            </Text>
            <Flex
              color={'text3'}
              mt={'x2'}
              align="center"
              gap="x2"
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
            </Flex>
          </Section>
        )}

        {showMetadataSections && hasEscrowMilestone && (
          <MilestoneDetails
            proposal={proposal}
            onOpenProposalReview={onOpenProposalReview}
          />
        )}

        {showMetadataSections && hasSablierStream && (
          <StreamDetails
            proposal={proposal}
            onOpenProposalReview={onOpenProposalReview}
          />
        )}

        {showMetadataSections && hasSablierAirdrop && (
          <AirdropDetails proposal={proposal} />
        )}

        {showMetadataSections && hasCoinCreation && <CoinDetails proposal={proposal} />}

        {showMetadataSections && hasDropCreation && <DropDetails proposal={proposal} />}

        {showMetadataSections && (
          <Section title="Description">
            <Paragraph overflow={'auto'}>
              {proposal.description && (
                <Box className={proposalDescription}>
                  <MarkdownDisplay>{proposal.description}</MarkdownDisplay>
                </Box>
              )}
            </Paragraph>
          </Section>
        )}

        {showMetadataSections && safeDiscussionUrl && (
          <Section title="Discussion">
            <a href={safeDiscussionUrl} rel="noreferrer" target="_blank">
              {safeDiscussionUrl}
            </a>
          </Section>
        )}

        {showMetadataSections && (
          <Section title="Proposer">
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
                  <Flex align="center" gap="x2" wrap style={{ minWidth: 0 }}>
                    <Text color={'text3'}>on behalf of</Text>
                    <WalletIdentityWithPreview
                      address={proposal.representedAddress as `0x${string}`}
                      displayName={
                        representedDisplayName ||
                        walletSnippet(proposal.representedAddress)
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
        )}

        <Section title="Proposed Transactions" mb={isPreview ? 'x0' : undefined}>
          {bundlesWithRanges?.length ? (
            <Stack gap="x4">
              {bundlesWithRanges.map((bundle) => {
                const transactionTypeMeta =
                  TRANSACTION_TYPES[bundle.type as keyof typeof TRANSACTION_TYPES]
                const bundleIntent = getBundleIntent(
                  bundle.summary,
                  transactionTypeMeta?.subTitle || transactionTypeMeta?.title
                )
                const bundleDecodedTransactions = decodedTransactions?.slice(
                  bundle.start,
                  bundle.end
                )

                return (
                  <Stack
                    key={`${bundle.bundleIndex}-${bundle.type}-${bundle.start}`}
                    className={atoms({
                      borderColor: 'border',
                      borderStyle: 'solid',
                      borderWidth: 'normal',
                      borderRadius: 'curved',
                    })}
                    p="x3"
                    gap="x3"
                  >
                    <Flex align="center" gap="x2">
                      <Flex
                        align="center"
                        justify="center"
                        h="x10"
                        w="x10"
                        borderRadius="round"
                        style={{ backgroundColor: transactionTypeMeta?.iconBackdrop }}
                      >
                        <Icon
                          id={transactionTypeMeta?.icon || 'plus'}
                          fill={transactionTypeMeta?.iconFill || 'icon1'}
                        />
                      </Flex>
                      <Stack gap="x1">
                        <Text fontWeight="heading">{bundleIntent || bundle.type}</Text>
                        <Text color="text3">{bundle.callCount} call(s)</Text>
                      </Stack>
                    </Flex>

                    {!!bundleDecodedTransactions?.length && (
                      <DecodedTransactions
                        decodedTransactions={bundleDecodedTransactions}
                        chainId={chain.id}
                        addresses={addresses}
                        startIndex={bundle.start}
                        proposalMetadata={proposalMetadataForSummary}
                        simulationByIndex={failedSimulationByIndex}
                        bundleContext={{
                          bundleIndex: bundle.bundleIndex,
                          bundleType: bundle.type,
                          bundleIntent,
                          bundleTypeTitle: transactionTypeMeta?.title,
                          bundleCallCount: bundle.callCount,
                        }}
                      />
                    )}
                  </Stack>
                )
              })}
            </Stack>
          ) : (
            <DecodedTransactions
              decodedTransactions={decodedTransactions}
              chainId={chain.id}
              addresses={addresses}
              proposalMetadata={proposalMetadataForSummary}
              simulationByIndex={failedSimulationByIndex}
            />
          )}
        </Section>
      </Flex>
    </Flex>
  )
}
