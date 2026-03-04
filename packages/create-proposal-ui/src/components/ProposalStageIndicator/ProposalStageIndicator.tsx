import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { useAccount } from 'wagmi'

type ProposalStage = 'draft' | 'transactions' | 'review'

type ProposalStageIndicatorProps = {
  currentStage: ProposalStage
  showOnboardingCallout?: boolean
  onStageSelect?: (stage: ProposalStage) => void
  isStageClickable?: (stage: ProposalStage) => boolean
}

const STAGES = [
  {
    id: 'draft' as const,
    title: 'Write proposal',
    description: 'Draft the core idea with a clear title and markdown summary.',
  },
  {
    id: 'transactions' as const,
    title: 'Add transactions',
    description: 'Define what the DAO will execute if the vote passes.',
  },
  {
    id: 'review' as const,
    title: 'Review and submit',
    description: 'Final checks, simulation results, timeline, and on-chain submission.',
  },
]

const ONBOARDING_VERSION = 'v1'
const NETWORK_TYPE = process.env.NEXT_PUBLIC_NETWORK_TYPE || 'testnet'

const getOnboardingStorageKey = (address?: string) => {
  const account = address?.toLowerCase() || 'disconnected'
  return `nouns-builder-proposal-onboarding-${ONBOARDING_VERSION}-${NETWORK_TYPE}-${account}`
}

export const ProposalStageIndicator: React.FC<ProposalStageIndicatorProps> = ({
  currentStage,
  showOnboardingCallout = false,
  onStageSelect,
  isStageClickable,
}) => {
  const { address } = useAccount()
  const [showCallout, setShowCallout] = React.useState(false)
  const currentStepIndex = STAGES.findIndex((stage) => stage.id === currentStage)

  React.useEffect(() => {
    if (!showOnboardingCallout || typeof window === 'undefined') return

    const key = getOnboardingStorageKey(address)
    const hasDismissed = window.localStorage.getItem(key)
    setShowCallout(!hasDismissed)
  }, [address, showOnboardingCallout])

  const dismissCallout = React.useCallback(() => {
    if (typeof window === 'undefined') return
    const key = getOnboardingStorageKey(address)
    window.localStorage.setItem(key, JSON.stringify({ dismissedAt: Date.now() }))
    setShowCallout(false)
  }, [address])

  return (
    <Stack gap={'x4'} mb={'x8'}>
      {showCallout && (
        <Flex
          direction={{ '@initial': 'column', '@768': 'row' }}
          gap={'x3'}
          justify={'space-between'}
          align={{ '@initial': 'flex-start', '@768': 'center' }}
          p={'x4'}
          borderColor={'border'}
          borderStyle={'solid'}
          borderWidth={'normal'}
          borderRadius={'curved'}
          backgroundColor={'background2'}
        >
          <Stack gap={'x1'}>
            <Text fontWeight={'display'}>First time creating a proposal?</Text>
            <Text color={'text3'}>
              Start with the written proposal, then add transactions, then do a final
              preflight before submitting.
            </Text>
          </Stack>
          <Button variant="secondary" onClick={dismissCallout}>
            Got it
          </Button>
        </Flex>
      )}

      <Flex direction={{ '@initial': 'column', '@768': 'row' }} gap={'x3'}>
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentStepIndex
          const isActive = index === currentStepIndex
          const clickable =
            !!onStageSelect &&
            (isStageClickable ? isStageClickable(stage.id) : isCompleted)
          const isLocked = !clickable && !isActive
          const onStageActivate = () => {
            if (!clickable || isLocked) return
            onStageSelect(stage.id)
          }

          return (
            <Stack
              key={stage.id}
              flex={1}
              gap={'x2'}
              p={'x4'}
              borderColor={isActive ? 'text1' : 'border'}
              borderStyle={'solid'}
              borderWidth={'normal'}
              borderRadius={'curved'}
              backgroundColor={isActive ? 'background2' : 'background1'}
              style={{
                cursor: clickable ? 'pointer' : isLocked ? 'not-allowed' : 'default',
                opacity: isLocked ? 0.6 : 1,
              }}
              role="button"
              tabIndex={clickable && !isLocked ? 0 : -1}
              aria-disabled={isLocked}
              onClick={clickable ? onStageActivate : undefined}
              onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                if (!clickable || isLocked) return
                if (event.key === 'Enter' || event.key === ' ') {
                  if (event.key === ' ') {
                    event.preventDefault()
                  }
                  onStageActivate()
                }
              }}
            >
              <Flex align={'center'} justify={'space-between'}>
                <Flex align={'center'} gap={'x2'}>
                  <Box
                    borderRadius={'round'}
                    px={'x2'}
                    py={'x1'}
                    borderColor={isCompleted || isActive ? 'text1' : 'border'}
                    borderStyle={'solid'}
                    borderWidth={'normal'}
                  >
                    {index + 1}
                  </Box>
                  <Text fontWeight={'display'}>{stage.title}</Text>
                </Flex>
              </Flex>
              <Text color={'text3'}>{stage.description}</Text>
            </Stack>
          )
        })}
      </Flex>
    </Stack>
  )
}
