import { ProposalNavigation } from '@buildeross/proposal-ui'
import { useProposalStore } from '@buildeross/stores'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React, { useState } from 'react'

import { ProposalHelpLinks } from '../ProposalHelpLinks'
import { Queue } from '../Queue'

interface CreateProposalHeadingProps {
  title: string
  align?: 'center' | 'left'
  showQueue?: boolean
  showContinue?: boolean
  onOpenProposalReview?: () => void
  onContinue?: () => void
  showStepBack?: boolean
  onStepBack?: () => void
  backDisabled?: boolean
  showReset?: boolean
  onReset?: () => void
  resetLabel?: string
  continueDisabled?: boolean
  backLabel?: string
  continueLabel?: string
  showDocsLink?: boolean
  showHelpLinks?: boolean
  handleBack: () => void
  queueButtonClassName?: string
}

export const CreateProposalHeading: React.FC<CreateProposalHeadingProps> = ({
  title,
  align = 'left',
  showDocsLink = false,
  showHelpLinks = false,
  showQueue = false,
  showContinue = true,
  handleBack,
  onOpenProposalReview,
  onContinue,
  showStepBack = false,
  onStepBack,
  backDisabled = false,
  showReset = false,
  onReset,
  resetLabel = 'Reset proposal',
  continueDisabled,
  backLabel = 'Back',
  continueLabel = 'Continue',
  queueButtonClassName,
}) => {
  const [queueModalOpen, setQueueModalOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const transactions = useProposalStore((state) => state.transactions)
  const continueHandler = onContinue || onOpenProposalReview
  return (
    <Stack mx={'auto'} pb={'x3'} w={'100%'}>
      <ProposalNavigation handleBack={handleBack}>
        {(showQueue || showContinue || showStepBack || showReset) && (
          <Flex align="center" direction="row" justify="flex-end" w="100%">
            <Flex>
              {showQueue && (
                <Button
                  mr="x6"
                  variant="secondary"
                  onClick={() => setQueueModalOpen(true)}
                  disabled={!transactions.length}
                  className={queueButtonClassName}
                >
                  {`${transactions.length} transaction${transactions.length === 1 ? '' : 's'} queued`}
                </Button>
              )}
              {showStepBack && onStepBack && (
                <Button
                  mr="x3"
                  variant="secondary"
                  onClick={onStepBack}
                  disabled={backDisabled}
                  aria-label={backLabel}
                >
                  <Icon id="arrowLeft" />
                </Button>
              )}
              {showReset && onReset && (
                <Button
                  mr="x3"
                  variant="secondary"
                  onClick={() => setResetModalOpen(true)}
                  aria-label={resetLabel}
                >
                  <Icon id="trash" />
                </Button>
              )}
              {showContinue && continueHandler && (
                <Button
                  disabled={continueDisabled ?? !transactions.length}
                  onClick={continueHandler}
                >
                  {continueLabel}
                </Button>
              )}
            </Flex>
          </Flex>
        )}
      </ProposalNavigation>
      <AnimatedModal close={() => setQueueModalOpen(false)} open={queueModalOpen}>
        <Queue setQueueModalOpen={setQueueModalOpen} />
      </AnimatedModal>

      {showReset && onReset && (
        <AnimatedModal close={() => setResetModalOpen(false)} open={resetModalOpen}>
          <Flex direction={'column'} align={'center'} gap={'x2'} w={'100%'}>
            <Flex fontSize={28} fontWeight={'display'} mb="x2">
              Reset proposal?
            </Flex>
            <Flex color={'text3'} mb="x2">
              This will clear your title, summary, and queued transactions.
            </Flex>
            <Flex direction={'column'} align={'stretch'} w={'100%'}>
              <Button
                onClick={() => {
                  onReset()
                  setResetModalOpen(false)
                }}
                mb="x2"
              >
                Reset
              </Button>
              <Button variant={'secondary'} onClick={() => setResetModalOpen(false)}>
                Cancel
              </Button>
            </Flex>
          </Flex>
        </AnimatedModal>
      )}
      <Flex
        direction="column"
        align={align === 'center' ? 'center' : 'flex-start'}
        mt={'x8'}
        mb={'x4'}
        gap={'x4'}
      >
        <Text
          fontSize={35}
          fontWeight={'label'}
          style={{ lineHeight: '44px' }}
          textAlign={align}
        >
          {title}
        </Text>
        {(showHelpLinks || showDocsLink) && <ProposalHelpLinks align={align} />}
      </Flex>
    </Stack>
  )
}
