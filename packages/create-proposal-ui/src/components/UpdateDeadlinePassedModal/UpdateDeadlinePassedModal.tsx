import { ProposalState } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Button, Flex, Heading, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

export interface UpdateDeadlinePassedModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitAsNew: () => void
  onSubmitAsNewAndCancel: () => void
  updateDeadline?: Date
  canCancelOldProposal: boolean
  oldProposalState?: ProposalState
}

const getStateReason = (state?: ProposalState): string => {
  switch (state) {
    case ProposalState.Executed:
      return 'executed'
    case ProposalState.Canceled:
      return 'already canceled'
    case ProposalState.Replaced:
      return 'replaced'
    case ProposalState.Vetoed:
      return 'vetoed'
    case ProposalState.Defeated:
      return 'defeated'
    default:
      return 'in a terminal state'
  }
}

export const UpdateDeadlinePassedModal: React.FC<UpdateDeadlinePassedModalProps> = ({
  isOpen,
  onClose,
  onSubmitAsNew,
  onSubmitAsNewAndCancel,
  updateDeadline,
  canCancelOldProposal,
  oldProposalState,
}) => {
  return (
    <AnimatedModal open={isOpen} close={onClose} size="medium">
      <Stack gap="x6" p="x6">
        <Flex justify="space-between" align="center">
          <Heading size="sm">Update Deadline Passed</Heading>
          <Button variant="ghost" size="sm" onClick={onClose} style={{ padding: '8px' }}>
            <Icon id="cross" />
          </Button>
        </Flex>

        <Stack gap="x4">
          <Flex direction="column" gap="x2">
            <Text variant="paragraph-md" color="text3">
              The update period for this proposal ended{' '}
              {updateDeadline ? (
                <Text as="span" fontWeight="label">
                  {updateDeadline.toLocaleString()}
                </Text>
              ) : (
                'recently'
              )}
              . You can no longer update this proposal.
            </Text>
          </Flex>

          {canCancelOldProposal ? (
            <Text variant="paragraph-md" color="text3">
              Instead, you can submit this as a new proposal. You should also cancel the
              original proposal to avoid confusion.
            </Text>
          ) : (
            <Text variant="paragraph-md" color="text3">
              The original proposal cannot be cancelled (already{' '}
              {getStateReason(oldProposalState)}). You can still submit this as a new
              proposal, but the original will remain in its current state.
            </Text>
          )}
        </Stack>

        <Stack gap="x3">
          {canCancelOldProposal ? (
            <>
              <Button variant="primary" onClick={onSubmitAsNewAndCancel} width="100%">
                <Flex align="center" gap="x2">
                  Submit as New & Cancel Old
                </Flex>
              </Button>

              <Button variant="secondary" onClick={onSubmitAsNew} width="100%">
                Submit as New Proposal Only
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={onSubmitAsNew} width="100%">
              <Flex align="center" gap="x2">
                Submit as New Proposal
              </Flex>
            </Button>
          )}

          <Button variant="ghost" onClick={onClose} width="100%">
            Go Back
          </Button>
        </Stack>
      </Stack>
    </AnimatedModal>
  )
}
