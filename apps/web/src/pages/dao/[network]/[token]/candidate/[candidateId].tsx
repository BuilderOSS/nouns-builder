import {
  CandidateCommentForm,
  CandidateDetailsSection,
  CandidateDiscussionSection,
  CandidateEditedBanner,
  CandidatePromoteCard,
  CandidateSignalBreakdown,
  CandidateState,
  CandidateStatus,
} from '@buildeross/candidate-ui'
import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { SectionHandler } from '@buildeross/dao-ui'
import { decodeTransactions } from '@buildeross/hooks'
import { ProposalNavigation } from '@buildeross/proposal-ui'
import type { CandidateGroup } from '@buildeross/sdk'
import { getCandidateGroup } from '@buildeross/sdk'
import { getDAOAddresses, tokenAbi } from '@buildeross/sdk/contract'
import { CandidateVoteSupport, getUserCandidateSignal } from '@buildeross/sdk/subgraph'
import {
  type DaoContractAddresses,
  useAuthStore,
  useCandidateStore,
  useChainStore,
  useDaoStore,
} from '@buildeross/stores'
import {
  AddressType,
  CHAIN_ID,
  type ProposalDescriptionMetadataV1,
  type TransactionBundle,
  TransactionType,
} from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { WalletIdentityWithPreview } from '@buildeross/ui/WalletIdentity'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useRef } from 'react'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import { votePageWrapper } from 'src/styles/vote.css'
import useSWR, { useSWRConfig } from 'swr'
import { isAddressEqual } from 'viem'
import { useReadContract } from 'wagmi'

interface CandidateDetailPageProps {
  candidateId: string
  initialData?: CandidateGroup
  chainId?: number
  addresses?: DaoContractAddresses
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

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const buildCandidateTransactions = (
  metadata: ProposalDescriptionMetadataV1 | undefined,
  targets: string[],
  values: Array<string | bigint>,
  calldatas: string[]
): TransactionBundle[] => {
  const bundles: TransactionBundle[] = []
  const bundleMeta = metadata?.transactionBundles || []
  let currentIndex = 0

  for (const meta of bundleMeta) {
    const callCount = Number(meta.callCount || 0)
    const bundleTransactions = []

    for (let i = 0; i < callCount; i++) {
      const idx = currentIndex + i
      if (idx >= targets.length) break

      bundleTransactions.push({
        target: targets[idx] as `0x${string}`,
        value: values[idx]?.toString() || '0',
        calldata: calldatas[idx] || '0x',
        functionSignature: '',
      })
    }

    const title = toTitleCase(String(meta.type).replace(/-/g, ' '))

    bundles.push({
      type: meta.type,
      title,
      summary: meta.summary || title,
      transactions: bundleTransactions,
    })

    currentIndex += callCount
  }

  if (currentIndex < targets.length) {
    bundles.push({
      type: TransactionType.CUSTOM,
      title: 'Custom',
      summary: 'Imported candidate transactions',
      transactions: targets.slice(currentIndex).map((target, index) => ({
        target: target as `0x${string}`,
        value: values[currentIndex + index]?.toString() || '0',
        calldata: calldatas[currentIndex + index] || '0x',
        functionSignature: '',
      })),
    })
  }

  if (bundles.length === 0 && targets.length > 0) {
    bundles.push({
      type: TransactionType.CUSTOM,
      title: 'Custom',
      summary: 'Imported candidate transactions',
      transactions: targets.map((target, index) => ({
        target: target as `0x${string}`,
        value: values[index]?.toString() || '0',
        calldata: calldatas[index] || '0x',
        functionSignature: '',
      })),
    })
  }

  return bundles
}

const CandidateDetailPage: NextPageWithLayout<CandidateDetailPageProps> = ({
  candidateId,
  initialData,
}) => {
  const router = useRouter()
  const { address } = useAuthStore()
  const { query, push, pathname } = router
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const startCandidateDraft = useCandidateStore((state) => state.startCandidateDraft)
  const { mutate: mutateSWR } = useSWRConfig()
  const [composerOpen, setComposerOpen] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [submissionType, setSubmissionType] = React.useState<
    'signal' | 'comment' | 'reply' | 'signal_signature'
  >('signal')
  const [replyingToComment, setReplyingToComment] = React.useState<
    | {
        id: string
        commenter: string
        comment: string
        support: CandidateVoteSupport
        voteWeight: bigint
      }
    | undefined
  >()
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeTab = (query.tab as string) || 'Details'

  const openDaoPage = React.useCallback(async () => {
    await push({
      pathname: `/dao/[network]/[token]`,
      query: {
        network: chain.slug,
        token: addresses.token,
        tab: 'candidates',
      },
    })
  }, [push, chain.slug, addresses.token])

  const {
    data: candidate,
    error,
    mutate: mutateCandidate,
  } = useSWR(
    candidateId ? ['candidate', chain.id, candidateId] : null,
    () => getCandidateGroup(chain.id, candidateId, addresses.token),
    {
      fallbackData: initialData,
      revalidateOnMount: true,
    }
  )

  const latestVersion = React.useMemo(() => {
    const versions = candidate?.versions || []

    if (versions.length > 0) {
      return [...versions].sort(
        (a, b) => Number(a.versionNumber) - Number(b.versionNumber)
      )[versions.length - 1]
    }

    return candidate?.leadingVersion
  }, [candidate?.leadingVersion, candidate?.versions])

  const candidateCommentsKey = React.useMemo(
    () =>
      candidate?.id ? (['candidate-comments', chain.id, candidate.id] as const) : null,
    [candidate?.id, chain.id]
  )

  const safeDiscussionUrl = getSafeDiscussionUrl(latestVersion?.discussionUrl)
  const createdAtLabel = candidate?.createdAt
    ? dayjs.unix(candidate.createdAt).format('MMM DD, YYYY')
    : null
  const candidateNumberLabel = candidate?.candidateNumber?.toString()

  const proposalMetadata = React.useMemo(() => {
    if (!latestVersion?.metadata) return undefined

    try {
      return JSON.parse(latestVersion.metadata)
    } catch {
      return undefined
    }
  }, [latestVersion?.metadata])

  const { data: tokenSymbol } = useReadContract({
    abi: tokenAbi,
    address: addresses.token,
    functionName: 'symbol',
    chainId: chain.id,
    query: { enabled: !!addresses.token },
  })

  // Check user's token balance to determine voting power
  const { data: tokenBalance } = useReadContract({
    abi: tokenAbi,
    address: addresses.token,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: chain.id,
    query: { enabled: !!address && !!addresses.token },
  })

  const hasVotingPower = React.useMemo(() => {
    return tokenBalance !== undefined && tokenBalance > 0n
  }, [tokenBalance])

  // Check if user has already signaled on the current version
  const { data: userSignal } = useSWR(
    address && latestVersion?.proposalHash
      ? ['userCandidateSignal', chain.id, latestVersion.proposalHash, address]
      : null,
    () => getUserCandidateSignal(chain.id, latestVersion!.proposalHash, address!),
    { revalidateOnFocus: false }
  )

  const hasUserSignaled = React.useMemo(() => {
    return !!userSignal
  }, [userSignal])

  const handleEditCandidate = React.useCallback(() => {
    if (!candidate || !latestVersion) return

    const transactions = buildCandidateTransactions(
      proposalMetadata,
      (latestVersion.targets || []) as string[],
      (latestVersion.values || []) as Array<string | bigint>,
      (latestVersion.calldatas || []) as string[]
    )

    startCandidateDraft({
      candidateId: candidate.id,
      candidateNumber: candidate.candidateNumber,
      salt: candidate.salt,
      versionNumber: Number(latestVersion.versionNumber) + 1,
      title: proposalMetadata?.title || latestVersion.title || '',
      summary: proposalMetadata?.description || latestVersion.description || '',
      discussionUrl: proposalMetadata?.discussionUrl || latestVersion.discussionUrl || '',
      transactions,
    })

    void router.push({
      pathname: '/dao/[network]/[token]/candidate/create',
      query: {
        network: chain.slug,
        token: addresses.token,
        stage: 'draft',
        edit: '1',
      },
    })
  }, [
    addresses.token,
    candidate,
    chain.slug,
    latestVersion,
    proposalMetadata,
    router,
    startCandidateDraft,
  ])

  const handleComposerSuccess = React.useCallback(
    (result: { withSignature: boolean; isReply: boolean; hasSignal: boolean }) => {
      // Determine submission type for messaging
      if (result.isReply) {
        setSubmissionType('reply')
      } else if (result.withSignature) {
        setSubmissionType('signal_signature')
      } else if (result.hasSignal) {
        setSubmissionType('signal')
      } else {
        setSubmissionType('comment')
      }

      setIsSuccess(true)
      setReplyingToComment(undefined)

      // Refetch data immediately after submission
      // The SDK functions already wait for subgraph sync, so data should be ready
      void mutateCandidate()
      void mutateSWR(candidateCommentsKey)

      // Auto-close after 2 seconds
      successTimerRef.current = setTimeout(() => {
        setComposerOpen(false)
        setIsSuccess(false)
      }, 2000)
    },
    [candidateCommentsKey, mutateCandidate, mutateSWR]
  )

  const handleClose = React.useCallback(() => {
    setComposerOpen(false)
    setIsSuccess(false)
    setReplyingToComment(undefined)
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
  }, [])

  const handleReplyClick = React.useCallback(
    (comment: {
      id: string
      commenter: string
      comment: string
      support: CandidateVoteSupport
      voteWeight: bigint
    }) => {
      setReplyingToComment(comment)
      setComposerOpen(true)
    },
    []
  )

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
        successTimerRef.current = null
      }
    }
  }, [])

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

  const { data: decodedTransactions, isLoading: isDecodingTransactions } = useSWR(
    latestVersion
      ? ([
          'candidate-decoded-transactions',
          chain.id,
          latestVersion.id,
          latestVersion.targets,
          latestVersion.calldatas,
          latestVersion.values,
        ] as const)
      : null,
    ([, chainId, , targets, calldatas, values]) =>
      decodeTransactions(
        chainId,
        targets as string[],
        calldatas as string[],
        values.map((value) => value.toString())
      ),
    { revalidateOnFocus: false }
  )

  if (error) {
    return (
      <Box py="x8">
        <Text color="negative" textAlign="center">
          Error loading candidate
        </Text>
      </Box>
    )
  }

  if (!candidate) {
    return (
      <Box py="x8">
        <Text color="text3" textAlign="center">
          Loading candidate...
        </Text>
      </Box>
    )
  }

  const detailsContent = (
    <CandidateDetailsSection
      description={latestVersion?.description || ''}
      discussionUrl={safeDiscussionUrl}
      decodedTransactions={decodedTransactions}
      isDecodingTransactions={isDecodingTransactions}
      proposalMetadata={proposalMetadata}
      chainId={chain.id as CHAIN_ID}
      addresses={addresses}
    />
  )

  const discussionContent = (
    <CandidateDiscussionSection
      candidateProposer={candidate.proposer as `0x${string}`}
      candidateVersion={latestVersion}
      tokenSymbol={tokenSymbol ? String(tokenSymbol) : undefined}
      governorAddress={addresses.governor as `0x${string}`}
      onReplyClick={handleReplyClick}
    />
  )

  const sections = [
    { title: 'Details', component: [detailsContent] },
    { title: 'Discussion', component: [discussionContent] },
  ]

  return (
    <Flex position="relative" direction="column">
      <Flex className={votePageWrapper} gap={{ '@initial': 'x2', '@768': 'x4' }}>
        <Flex direction="column" gap={{ '@initial': 'x4', '@768': 'x7' }} mb="x2">
          <ProposalNavigation handleBack={() => openDaoPage()} />
          <Flex gap="x4" direction="column">
            <Stack gap="x2">
              <Flex align="center">
                <Text fontSize={20} color="text3" fontWeight="display" mr="x2">
                  Candidate
                </Text>
                <CandidateStatus
                  state={
                    latestVersion?.proposal?.id
                      ? CandidateState.Promoted
                      : CandidateState.Draft
                  }
                />
              </Flex>
              <Text fontSize={28} fontWeight="display">
                {latestVersion?.title ||
                  (candidateNumberLabel
                    ? `Candidate #${candidateNumberLabel}`
                    : 'Candidate')}
              </Text>
              <Flex gap="x2" wrap align="center">
                <Text color="text3">By</Text>
                <WalletIdentityWithPreview
                  address={candidate.proposer as `0x${string}`}
                  displayName={walletSnippet(candidate.proposer)}
                />
                {createdAtLabel && <Text color="text3">· {createdAtLabel}</Text>}
                {latestVersion && (
                  <Text color="text3">
                    · V{latestVersion.versionNumber.toString()} ·{' '}
                    {latestVersion.signatureCount.toString()}{' '}
                    {Number(latestVersion.signatureCount) === 1
                      ? 'signature'
                      : 'signatures'}
                  </Text>
                )}
              </Flex>
              {latestVersion?.proposal?.id && (
                <Flex
                  align="center"
                  justify="space-between"
                  gap="x4"
                  py="x4"
                  px="x6"
                  borderRadius="curved"
                  borderWidth="thin"
                  borderColor="accent"
                  backgroundColor="background2"
                  wrap="wrap"
                  style={{ width: '100%' }}
                >
                  <Flex align="center" gap="x3">
                    <Text fontWeight="label" color="text1">
                      Promoted to Proposal: Proposal #
                      {latestVersion.proposal.proposalNumber}
                    </Text>
                  </Flex>
                  <Button
                    as={Link}
                    href={`/dao/${chain.slug}/${addresses.token}/vote/${latestVersion.proposal.proposalNumber}`}
                    variant="outline"
                    size="sm"
                    style={{ fontSize: '16px' }}
                  >
                    View Proposal
                  </Button>
                </Flex>
              )}
            </Stack>

            {!latestVersion?.proposal?.id && (
              <Flex direction={'row'} gap={'x2'} wrap style={{ width: '100%' }}>
                <Button onClick={() => setComposerOpen(true)}>
                  {hasUserSignaled || !hasVotingPower ? 'Comment' : 'Signal / comment'}
                </Button>
                {latestVersion &&
                  !!address &&
                  isAddressEqual(address, candidate.proposer) && (
                    <ContractButton
                      handleClick={handleEditCandidate}
                      variant="secondary"
                      chainId={chain.id}
                    >
                      Edit candidate
                    </ContractButton>
                  )}
              </Flex>
            )}

            {candidate?.versions && candidate.versions.length > 1 && (
              <CandidateEditedBanner
                proposer={candidate.proposer as `0x${string}`}
                versions={candidate.versions}
              />
            )}

            {latestVersion &&
              !latestVersion.proposal?.id &&
              latestVersion.targets &&
              latestVersion.values &&
              latestVersion.calldatas && (
                <CandidatePromoteCard
                  candidateId={latestVersion.candidateId as `0x${string}`}
                  proposalHash={latestVersion.proposalHash as `0x${string}`}
                  proposer={candidate.proposer as `0x${string}`}
                  targets={latestVersion.targets as string[]}
                  values={latestVersion.values.map((v) =>
                    typeof v === 'string' ? BigInt(v) : v
                  )}
                  calldatas={latestVersion.calldatas as `0x${string}`[]}
                  description={latestVersion.metadata || ''}
                  governorAddress={addresses.governor as `0x${string}`}
                  onPromoteSuccess={async () => {
                    // Refresh candidate data in background (subgraph has already synced at this point)
                    void mutateCandidate()

                    // Redirect to the newly created proposal using proposalId
                    if (latestVersion.proposalHash) {
                      await push({
                        pathname: '/dao/[network]/[token]/vote/[id]',
                        query: {
                          network: chain.slug,
                          token: addresses.token,
                          id: latestVersion.proposalHash,
                        },
                      })
                    }
                  }}
                />
              )}

            <CandidateSignalBreakdown
              forVotes={candidate.currentForCount}
              againstVotes={candidate.currentAgainstCount}
              abstainVotes={candidate.currentAbstainCount}
            />
          </Flex>
        </Flex>
      </Flex>

      {latestVersion && tokenSymbol && (
        <AnimatedModal
          open={composerOpen}
          close={handleClose}
          size={isSuccess ? 'small' : 'large'}
        >
          {isSuccess ? (
            <SuccessModalContent
              success={true}
              title={
                submissionType === 'reply'
                  ? 'Reply Submitted'
                  : submissionType === 'comment'
                    ? 'Comment Submitted'
                    : submissionType === 'signal_signature'
                      ? 'Signal & Signature Added'
                      : 'Signal Submitted'
              }
              subtitle={
                submissionType === 'reply'
                  ? 'Your reply has been recorded.'
                  : submissionType === 'comment'
                    ? 'Your comment has been recorded.'
                    : submissionType === 'signal_signature'
                      ? 'Your signal and signature have been recorded.'
                      : 'Your signal has been recorded.'
              }
            />
          ) : (
            <Box p={{ '@initial': 'x4', '@768': 'x6' }}>
              <Stack gap="x4">
                <Text fontSize={20} fontWeight="display">
                  {replyingToComment
                    ? 'Reply to comment'
                    : hasUserSignaled || !hasVotingPower
                      ? 'Comment'
                      : 'Signal / comment'}
                </Text>
                <CandidateCommentForm
                  candidateId={latestVersion.candidateId as `0x${string}`}
                  proposalHash={latestVersion.proposalHash as `0x${string}`}
                  proposer={candidate.proposer as `0x${string}`}
                  governorAddress={addresses.governor as `0x${string}`}
                  tokenSymbol={String(tokenSymbol)}
                  onSuccess={handleComposerSuccess}
                  hasUserSignaled={hasUserSignaled}
                  hasVotingPower={hasVotingPower}
                  parentCommentUID={replyingToComment?.id as `0x${string}` | undefined}
                  replyTo={
                    replyingToComment
                      ? {
                          id: replyingToComment.id as `0x${string}`,
                          commenter: replyingToComment.commenter as `0x${string}`,
                          comment: replyingToComment.comment,
                          support: replyingToComment.support,
                          voteWeight: replyingToComment.voteWeight,
                        }
                      : undefined
                  }
                />
              </Stack>
            </Box>
          )}
        </AnimatedModal>
      )}

      <Box mt="x12" pb="x30">
        <Flex direction="column" w="100%" mx="auto" className={votePageWrapper}>
          <SectionHandler
            sections={sections}
            activeTab={activeTab}
            onTabChange={(tab) => openTab(tab, false)}
          />
        </Flex>
      </Box>
    </Flex>
  )
}

CandidateDetailPage.getLayout = getDaoLayout

export const getServerSideProps: GetServerSideProps = async (context) => {
  const network = context.params?.network as string
  const token = context.params?.token as AddressType
  const candidateId = context.params?.candidateId as string

  // Validate network
  const validChain = PUBLIC_DEFAULT_CHAINS.find(
    (chain) => chain.slug === network || String(chain.id) === network
  )

  if (!validChain) {
    return { notFound: true }
  }

  const addresses = await getDAOAddresses(validChain.id, token)

  if (!addresses) {
    return { notFound: true }
  }

  // Fetch candidate data server-side
  let initialData: CandidateGroup | undefined
  try {
    initialData = await getCandidateGroup(validChain.id as CHAIN_ID, candidateId, token)
    if (!initialData) {
      return { notFound: true }
    }
  } catch (error) {
    console.error('Error fetching candidate:', error)
    // Continue without initial data, let client fetch
  }

  if (candidateId.startsWith('0x')) {
    if (!initialData) {
      return { notFound: true }
    }

    return {
      redirect: {
        destination: `/dao/${network}/${token}/candidate/${initialData.candidateNumber.toString()}`,
        permanent: false,
      },
    }
  }

  // Set cache headers
  context.res.setHeader(
    'Cache-Control',
    `public, s-maxage=${CACHE_TIMES.DAO_FEED}, stale-while-revalidate`
  )

  return {
    props: {
      addresses,
      candidateId,
      initialData: initialData || null,
      chainId: validChain.id,
    },
  }
}

export default CandidateDetailPage
