import { HERO_CONTENT_LAYER } from '@buildeross/constants'
import { useScrollDirection } from '@buildeross/hooks/useScrollDirection'
import { ProposalNavigation } from '@buildeross/proposal-ui'
import { useProposalStore } from '@buildeross/stores'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React, { useState } from 'react'

import { ProposalHelpLinks } from '../ProposalHelpLinks'
import { Queue } from '../Queue'
import { ResetConfirmationModal } from '../ResetConfirmationModal'

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
  hideActionsOnMobile?: boolean
  handleBack: () => void
  queueButtonClassName?: string
}

export const CreateProposalHeading: React.FC<CreateProposalHeadingProps> = ({
  title,
  align = 'left',
  showDocsLink = false,
  showHelpLinks = false,
  hideActionsOnMobile = false,
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
  const scrollDirection = useScrollDirection()
  const continueHandler = onContinue || onOpenProposalReview

  // Keep sticky row aligned below the global nav.
  // Global nav is 80px tall and hidden while scrolling down.
  const stickyTopOffset = scrollDirection === 'down' ? 0 : 80

  return (
    <>
      <Box
        position={'sticky'}
        pb={'x6'}
        borderBottomColor={'border'}
        borderBottomStyle={'solid'}
        borderBottomWidth={'normal'}
        style={{
          top: `${stickyTopOffset}px`,
          transition: 'top 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: HERO_CONTENT_LAYER,
        }}
        backgroundColor={'background1'}
      >
        <ProposalNavigation handleBack={handleBack}>
          {(showQueue || showContinue || showStepBack || showReset) && (
            <Flex
              align="center"
              direction="row"
              justify="flex-end"
              w="100%"
              display={
                hideActionsOnMobile ? { '@initial': 'none', '@768': 'flex' } : 'flex'
              }
            >
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
      </Box>

      <Stack mx={'auto'} pb={'x3'} w={'100%'}>
        <AnimatedModal close={() => setQueueModalOpen(false)} open={queueModalOpen}>
          <Queue setQueueModalOpen={setQueueModalOpen} />
        </AnimatedModal>

        {showReset && onReset && (
          <ResetConfirmationModal
            open={resetModalOpen}
            onConfirm={() => {
              onReset()
              setResetModalOpen(false)
            }}
            onCancel={() => setResetModalOpen(false)}
          />
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
    </>
  )
}
