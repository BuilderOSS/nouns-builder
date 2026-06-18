import {
  CandidateCommentForm,
  CandidateEditedBanner,
  CandidateSigners,
} from '@buildeross/candidate-ui'
import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { SectionHandler } from '@buildeross/dao-ui'
import { decodeTransactions, useEnsData } from '@buildeross/hooks'
import {
  proposalDescription,
  ProposalNavigation,
  TransactionTypeIcon,
} from '@buildeross/proposal-ui'
import type { CandidateGroup } from '@buildeross/sdk'
import { getCandidateGroup } from '@buildeross/sdk'
import { getDAOAddresses, tokenAbi } from '@buildeross/sdk/contract'
import { CandidateVoteSupport, getCandidateComments } from '@buildeross/sdk/subgraph'
import {
  type DaoContractAddresses,
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
import { DecodedTransactions } from '@buildeross/ui/DecodedTransactions'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { WalletIdentityWithPreview } from '@buildeross/ui/WalletIdentity'
import { formatTimeAgo } from '@buildeross/utils/formatTime'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Stack, Text, theme } from '@buildeross/zord'
import dayjs from 'dayjs'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import { votePageWrapper } from 'src/styles/vote.css'
import useSWR from 'swr'
import { zeroHash } from 'viem'
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

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box mb={{ '@initial': 'x6', '@768': 'x13' }}>
    <Box fontSize={20} mb={{ '@initial': 'x4', '@768': 'x5' }} fontWeight="display">
      {title}
    </Box>
    {children}
  </Box>
)

const VoteBreakdown = ({
  forVotes,
  againstVotes,
  abstainVotes,
}: {
  forVotes: bigint
  againstVotes: bigint
  abstainVotes: bigint
}) => {
  const voteTally = [
    { label: 'For', value: Number(forVotes.toString()), color: theme.colors.positive },
    {
      label: 'Against',
      value: Number(againstVotes.toString()),
      color: theme.colors.negative,
    },
    {
      label: 'Abstain',
      value: Number(abstainVotes.toString()),
      color: theme.colors.text4,
    },
  ]

  const totalVotes = voteTally.reduce((sum, vote) => sum + vote.value, 0)

  return (
    <Box
      p={{ '@initial': 'x4', '@768': 'x6' }}
      mb={{ '@initial': 'x4', '@768': 'x5' }}
      borderWidth="normal"
      borderColor="border"
      borderStyle="solid"
      borderRadius="curved"
      style={{ background: theme.colors.background1 }}
    >
      <Flex justify="space-between" align="center" gap="x3" mb="x3" wrap>
        <Text fontSize={16} fontWeight="display">
          Vote breakdown
        </Text>
        <Text color="text3" fontSize={14}>
          {totalVotes > 0 ? `${totalVotes} total votes` : 'No votes yet'}
        </Text>
      </Flex>

      <Box
        style={{
          display: 'flex',
          width: '100%',
          height: 16,
          overflow: 'hidden',
          borderRadius: 999,
          border: `1px solid ${theme.colors.border}`,
          background: theme.colors.background2,
        }}
      >
        {totalVotes > 0 ? (
          voteTally.map((vote) => {
            if (vote.value === 0) return null

            return (
              <Box
                key={vote.label}
                style={{
                  flex: `${vote.value} 1 0%`,
                  background: vote.color,
                }}
              />
            )
          })
        ) : (
          <Box style={{ width: '100%', background: 'transparent' }} />
        )}
      </Box>

      <Flex gap="x4" wrap mt="x3">
        {voteTally.map((vote) => (
          <Flex key={vote.label} align="center" gap="x2">
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: vote.color,
                flexShrink: 0,
              }}
            />
            <Text color="text3" fontSize={14}>
              {vote.label}: {vote.value}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  )
}

type CandidateComment = Awaited<
  ReturnType<typeof getCandidateComments>
>['comments'][number]

const candidateSupportMeta: Record<
  CandidateVoteSupport,
  { label: string; color: string }
> = {
  [CandidateVoteSupport.For]: { label: 'For', color: theme.colors.positive },
  [CandidateVoteSupport.Against]: { label: 'Against', color: theme.colors.negative },
  [CandidateVoteSupport.Abstain]: { label: 'Abstain', color: theme.colors.text4 },
  [CandidateVoteSupport.None]: { label: 'None', color: theme.colors.text4 },
}

const CandidateCommentCard = ({
  comment,
  depth = 0,
}: {
  comment: CandidateComment
  depth?: number
}) => {
  const { displayName, ensAvatar } = useEnsData(comment.commenter as `0x${string}`)
  const support =
    candidateSupportMeta[comment.support] ??
    candidateSupportMeta[CandidateVoteSupport.None]

  return (
    <Box
      p="x4"
      borderWidth="normal"
      borderColor="border"
      borderStyle="solid"
      borderRadius="curved"
      style={{
        marginLeft: depth > 0 ? 24 : 0,
        background: theme.colors.background1,
        borderLeftWidth: depth > 0 ? 3 : undefined,
        borderLeftColor: depth > 0 ? theme.colors.border : undefined,
      }}
    >
      <Flex justify="space-between" align="center" gap="x3" wrap mb="x2">
        <WalletIdentityWithPreview
          address={comment.commenter as `0x${string}`}
          displayName={displayName || walletSnippet(comment.commenter as `0x${string}`)}
          avatarSrc={ensAvatar}
        />
        <Flex align="center" gap="x2" wrap>
          {support.label !== 'None' && (
            <>
              <Box
                style={{
                  padding: '4px 8px',
                  borderRadius: 999,
                  background: support.color,
                  color: theme.colors.onAccent,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {support.label}
              </Box>
              <Text color="text3" fontSize={12}>
                {comment.voteWeight.toString()} votes
              </Text>
            </>
          )}
          <Text color="text3" fontSize={12}>
            {formatTimeAgo(comment.createdAt)}
          </Text>
        </Flex>
      </Flex>

      <Text style={{ whiteSpace: 'pre-wrap' }}>{comment.comment}</Text>
    </Box>
  )
}

const CandidateCommentsPanel = ({
  comments,
  error,
  isLoading,
  commentCount,
}: {
  comments: CandidateComment[]
  error?: unknown
  isLoading: boolean
  commentCount: bigint
}) => {
  const topLevelComments = React.useMemo(
    () =>
      comments
        .filter((comment) => !comment.parentComment?.id)
        .sort((a, b) => b.createdAt - a.createdAt),
    [comments]
  )
  const repliesByParentId = React.useMemo(() => {
    const map = new Map<string, CandidateComment[]>()

    for (const comment of comments) {
      const parentId = comment.parentComment?.id
      if (!parentId) continue

      const existing = map.get(parentId) || []
      existing.push(comment)
      map.set(parentId, existing)
    }

    for (const replyList of map.values()) {
      replyList.sort((a, b) => b.createdAt - a.createdAt)
    }

    return map
  }, [comments])

  const renderThread = React.useCallback(
    (comment: CandidateComment, depth = 0): React.ReactNode => (
      <Stack key={comment.id} gap="x3">
        <CandidateCommentCard comment={comment} depth={depth} />
        {repliesByParentId
          .get(comment.id)
          ?.map((reply) => renderThread(reply, depth + 1))}
      </Stack>
    ),
    [repliesByParentId]
  )

  return (
    <Stack gap="x4">
      <Flex justify="space-between" align="center" wrap gap="x3">
        <Text fontSize={20} fontWeight="display">
          Comments ({commentCount.toString()})
        </Text>
        <Text color="text3" fontSize={14}>
          {comments.length > 0 ? `${comments.length} loaded` : 'Loading discussion'}
        </Text>
      </Flex>

      {error && <Text color="negative">Failed to load comments.</Text>}

      {isLoading && comments.length === 0 && (
        <Text color="text3">Loading comments...</Text>
      )}

      {!isLoading && comments.length === 0 && !error && (
        <Text color="text3">No comments yet. Be the first to comment.</Text>
      )}

      {topLevelComments.length > 0 && (
        <Stack gap="x3">{topLevelComments.map((comment) => renderThread(comment))}</Stack>
      )}
    </Stack>
  )
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
  const { query, push, pathname } = router
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const startCandidateDraft = useCandidateStore((state) => state.startCandidateDraft)
  const [composerOpen, setComposerOpen] = React.useState(false)
  const activeTab = (query.tab as string) || 'Details'

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

  const {
    data: candidateComments,
    error: candidateCommentsError,
    mutate: mutateComments,
  } = useSWR(
    candidate?.id ? ['candidate-comments', chain.id, candidate.id] : null,
    () => getCandidateComments(chain.id, candidate!.id, 100),
    { revalidateOnFocus: false }
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

  const handleComposerSuccess = React.useCallback(() => {
    void mutateCandidate()
    void mutateComments()
    setComposerOpen(false)
  }, [mutateCandidate, mutateComments])

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

  const comments = candidateComments?.comments || []

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
    <Stack gap="x6">
      <Section title="Description">
        <Box className={proposalDescription}>
          <MarkdownDisplay>{latestVersion?.description || ''}</MarkdownDisplay>
        </Box>
      </Section>

      {safeDiscussionUrl && (
        <Section title="Discussion">
          <a href={safeDiscussionUrl} rel="noreferrer" target="_blank">
            {safeDiscussionUrl}
          </a>
        </Section>
      )}

      <Section title="Proposed Transactions">
        {latestVersion ? (
          decodedTransactions?.length ? (
            <DecodedTransactions
              chainId={chain.id as CHAIN_ID}
              addresses={addresses}
              decodedTransactions={decodedTransactions}
              proposalMetadata={proposalMetadata}
              isDecoding={isDecodingTransactions}
            />
          ) : (
            <Text color="text3">No transactions in this candidate.</Text>
          )
        ) : null}
      </Section>

      {candidate.versions && candidate.versions.length > 0 && (
        <Section title={`Edit History (${candidate.versions.length})`}>
          <Stack gap="x4">
            {candidate.versions.map((version) => (
              <Stack
                key={version.id}
                p="x3"
                gap="x3"
                borderColor="border"
                borderStyle="solid"
                borderWidth="normal"
                borderRadius="curved"
              >
                <Flex align="center" gap="x2">
                  <TransactionTypeIcon transactionType={TransactionType.CUSTOM} />
                  <Stack gap="x1">
                    <Text fontWeight="heading">
                      Version {version.versionNumber.toString()}
                    </Text>
                    <Text color="text3">
                      {version.signatureCount.toString()} signatures
                    </Text>
                  </Stack>
                </Flex>
                {version.title && <Text>{version.title}</Text>}
              </Stack>
            ))}
          </Stack>
        </Section>
      )}
    </Stack>
  )

  const discussionContent = (
    <Stack gap="x6">
      {latestVersion && tokenSymbol && (
        <Section title="Sponsors">
          <CandidateSigners
            candidateVersionUID={latestVersion.id as `0x${string}`}
            proposer={candidate.proposer as `0x${string}`}
            governorAddress={addresses.governor as `0x${string}`}
            tokenSymbol={String(tokenSymbol)}
            description={latestVersion.metadata || ''}
            targets={(latestVersion.targets || []) as string[]}
            values={(latestVersion.values || []) as bigint[]}
            calldatas={(latestVersion.calldatas || []) as `0x${string}`[]}
            signatureCount={latestVersion.signatureCount}
          />
        </Section>
      )}

      <Section title="Comments">
        <CandidateCommentsPanel
          comments={comments}
          error={candidateCommentsError}
          isLoading={!candidateComments && !!candidate}
          commentCount={candidate.commentCount}
        />
      </Section>
    </Stack>
  )

  const sections = [
    { title: 'Details', component: [detailsContent] },
    { title: 'Discussion', component: [discussionContent] },
  ]

  return (
    <Flex position="relative" direction="column">
      <Flex className={votePageWrapper} gap={{ '@initial': 'x2', '@768': 'x4' }}>
        <Flex direction="column" gap={{ '@initial': 'x4', '@768': 'x7' }} mb="x2">
          <ProposalNavigation handleBack={() => router.back()} />
          <Flex gap="x4" direction="column">
            <Flex
              direction={{ '@initial': 'column', '@768': 'row' }}
              justify="space-between"
              align={{ '@initial': 'flex-start', '@768': 'flex-start' }}
              gap="x4"
            >
              <Stack gap="x2">
                <Text fontSize={20} color="text3" fontWeight="display">
                  Candidate
                </Text>
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
                      {latestVersion.signatureCount.toString()} signatures
                    </Text>
                  )}
                </Flex>
                {latestVersion?.proposalId && (
                  <Text color="text3" fontSize={14}>
                    Promoted to{' '}
                    <Link
                      href={`/dao/${chain.slug}/${addresses.token}/vote/${latestVersion.proposalId}`}
                    >
                      proposal
                    </Link>
                  </Text>
                )}
              </Stack>

              <Flex gap="x2" wrap>
                <Button onClick={() => setComposerOpen(true)}>Vote / comment</Button>
                {latestVersion?.proposalId && latestVersion.proposalId !== zeroHash && (
                  <Button
                    as={Link}
                    href={`/dao/${chain.slug}/${addresses.token}/vote/${latestVersion.proposalId}`}
                    variant="secondaryOutline"
                  >
                    View proposal
                  </Button>
                )}
                {latestVersion && (
                  <Button onClick={handleEditCandidate} variant="secondary">
                    Edit candidate
                  </Button>
                )}
              </Flex>
            </Flex>

            {candidate?.versions && candidate.versions.length > 1 && (
              <CandidateEditedBanner
                proposer={candidate.proposer as `0x${string}`}
                versions={candidate.versions}
              />
            )}

            <VoteBreakdown
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
          close={() => setComposerOpen(false)}
          size="large"
        >
          <Box p="x6">
            <Stack gap="x4">
              <Text fontSize={20} fontWeight="display">
                Vote / comment
              </Text>
              <CandidateCommentForm
                candidateId={candidate.id as `0x${string}`}
                candidateVersionUID={latestVersion.id as `0x${string}`}
                proposer={candidate.proposer as `0x${string}`}
                governorAddress={addresses.governor as `0x${string}`}
                tokenSymbol={String(tokenSymbol)}
                proposalId={latestVersion.proposalId as `0x${string}`}
                onSuccess={handleComposerSuccess}
              />
            </Stack>
          </Box>
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
