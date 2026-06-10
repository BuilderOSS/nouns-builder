import { CandidateDraftForm, CandidateSubmitForm } from '@buildeross/candidate-ui'
import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { Queue, TransactionForm, TwoColumnLayout } from '@buildeross/create-proposal-ui'
import { useCandidateStore } from '@buildeross/stores'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import { NextPageWithLayout } from 'src/pages/_app'

type CreateStage = 'draft' | 'transactions' | 'review'

const CreateCandidatePage: NextPageWithLayout = () => {
  const router = useRouter()
  const [createStage, setCreateStage] = useState<CreateStage>('draft')
  const [furthestStage, setFurthestStage] = useState<CreateStage>('draft')

  const { title, summary, transactions, clearCandidate } = useCandidateStore()

  // Update stage from URL query param
  React.useEffect(() => {
    const stage = router.query.stage as CreateStage | undefined
    if (stage && ['draft', 'transactions', 'review'].includes(stage)) {
      setCreateStage(stage)
    }
  }, [router.query.stage])

  // Update URL when stage changes
  const updateStage = (stage: CreateStage) => {
    setCreateStage(stage)
    if (shouldUpdateFurthestStage(stage)) {
      setFurthestStage(stage)
    }
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, stage },
      },
      undefined,
      { shallow: true }
    )
  }

  const shouldUpdateFurthestStage = (stage: CreateStage): boolean => {
    const stageOrder: CreateStage[] = ['draft', 'transactions', 'review']
    const currentIndex = stageOrder.indexOf(furthestStage)
    const newIndex = stageOrder.indexOf(stage)
    return newIndex > currentIndex
  }

  const handleDraftNext = () => {
    updateStage('transactions')
  }

  const handleTransactionsNext = () => {
    updateStage('review')
  }

  const handleReviewBack = () => {
    updateStage('transactions')
  }

  const handleSubmitSuccess = async (candidateId: string, _attestationUID: string) => {
    // Navigate to candidate detail page
    const { network, token } = router.query
    await router.push({
      pathname: '/dao/[network]/[token]/candidate/[candidateId]',
      query: {
        network,
        token,
        candidateId,
      },
    })
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to clear this candidate draft?')) {
      clearCandidate()
      updateStage('draft')
      setFurthestStage('draft')
    }
  }

  const canProceedFromDraft = Boolean(title && summary)
  const canProceedFromTransactions = transactions.length > 0

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="x6">
        <Text variant="heading-sm" style={{ fontWeight: 800 }}>
          Create Candidate
        </Text>
        <Button variant="ghost" onClick={handleReset}>
          Clear Draft
        </Button>
      </Flex>

      {/* Stage Indicator */}
      <Flex gap="x4" mb="x8">
        <StageButton
          label="1. Draft"
          active={createStage === 'draft'}
          completed={furthestStage !== 'draft'}
          onClick={() => updateStage('draft')}
        />
        <StageButton
          label="2. Transactions"
          active={createStage === 'transactions'}
          completed={
            furthestStage === 'review' ||
            (furthestStage === 'transactions' && createStage !== 'transactions')
          }
          onClick={() => canProceedFromDraft && updateStage('transactions')}
          disabled={!canProceedFromDraft}
        />
        <StageButton
          label="3. Review"
          active={createStage === 'review'}
          completed={false}
          onClick={() =>
            canProceedFromDraft && canProceedFromTransactions && updateStage('review')
          }
          disabled={!canProceedFromDraft || !canProceedFromTransactions}
        />
      </Flex>

      <TwoColumnLayout
        leftColumn={
          <Box>
            {createStage === 'draft' && (
              <Stack gap="x6">
                <Text fontSize={28} fontWeight="label">
                  Candidate Details
                </Text>
                <CandidateDraftForm onNext={handleDraftNext} />
                <Flex justify="flex-end">
                  <Button onClick={handleDraftNext} disabled={!canProceedFromDraft}>
                    Next: Add Transactions
                  </Button>
                </Flex>
              </Stack>
            )}

            {createStage === 'transactions' && (
              <Stack gap="x6">
                <Flex justify="space-between" align="center">
                  <Text fontSize={28} fontWeight="label">
                    Add Transactions
                  </Text>
                  <Button variant="secondary" onClick={() => updateStage('draft')}>
                    Back to Draft
                  </Button>
                </Flex>
                <TransactionForm />
                <Flex justify="space-between">
                  <Button variant="secondary" onClick={() => updateStage('draft')}>
                    Back
                  </Button>
                  <Button
                    onClick={handleTransactionsNext}
                    disabled={!canProceedFromTransactions}
                  >
                    Next: Review
                  </Button>
                </Flex>
              </Stack>
            )}

            {createStage === 'review' && (
              <Stack gap="x6">
                <Text fontSize={28} fontWeight="label">
                  Review Candidate
                </Text>
                <CandidateSubmitForm
                  onSuccess={handleSubmitSuccess}
                  onBack={handleReviewBack}
                />
              </Stack>
            )}
          </Box>
        }
        rightColumn={
          <Box>
            <Queue />
          </Box>
        }
      />
    </Box>
  )
}

// Stage Button Component
interface StageButtonProps {
  label: string
  active: boolean
  completed: boolean
  onClick: () => void
  disabled?: boolean
}

const StageButton: React.FC<StageButtonProps> = ({
  label,
  active,
  completed,
  onClick,
  disabled,
}) => {
  return (
    <Button
      variant={active ? 'primary' : completed ? 'secondary' : 'ghost'}
      onClick={onClick}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {label}
    </Button>
  )
}

CreateCandidatePage.getLayout = getDaoLayout

export const getServerSideProps: GetServerSideProps = async (context) => {
  const network = context.params?.network as string
  const token = context.params?.token as string

  // Validate network
  const validChain = PUBLIC_DEFAULT_CHAINS.find(
    (chain) => chain.slug === network || String(chain.id) === network
  )

  if (!validChain) {
    return { notFound: true }
  }

  // Set cache headers
  context.res.setHeader(
    'Cache-Control',
    `public, s-maxage=${CACHE_TIMES.DAO_FEED}, stale-while-revalidate`
  )

  return {
    props: {
      network: validChain.slug,
      token: token.toLowerCase(),
    },
  }
}

export default CreateCandidatePage
