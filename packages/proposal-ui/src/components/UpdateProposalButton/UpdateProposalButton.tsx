import { useProposalState, useProposalTimeline } from '@buildeross/hooks'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import type { AddressType, BytesType } from '@buildeross/types'
import { Tooltip } from '@buildeross/ui'
import { Button, ButtonProps, Flex, Icon, Stack } from '@buildeross/zord'
import { useAccount } from 'wagmi'

export interface UpdateProposalButtonProps extends Omit<ButtonProps, 'onClick'> {
  proposalId: BytesType
  proposerAddress: AddressType
  onUpdateClick?: () => void
}

export function UpdateProposalButton({
  proposalId,
  proposerAddress,
  onUpdateClick,
  ...buttonProps
}: UpdateProposalButtonProps) {
  const { address: connectedAddress } = useAccount()
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)

  // Check proposal state
  const { isUpdatable, isLoading: isLoadingState } = useProposalState({
    chainId: chain.id,
    governorAddress: addresses.governor as AddressType,
    proposalId,
  })

  // Check if we're in updatable period
  const {
    isInUpdatablePeriod,
    updateDeadline,
    isLoading: isLoadingTimeline,
  } = useProposalTimeline({
    chainId: chain.id,
    governorAddress: addresses.governor as AddressType,
    proposalId,
  })

  const isLoading = isLoadingState || isLoadingTimeline

  // Determine if user can update
  const isProposer =
    connectedAddress && proposerAddress.toLowerCase() === connectedAddress.toLowerCase()
  const canUpdate = isUpdatable && isInUpdatablePeriod && isProposer

  // Don't show button if proposal is not updatable
  if (!isUpdatable && !isLoading) {
    return null
  }

  // Generate tooltip message when button is disabled
  const getDisabledReason = (): string | undefined => {
    if (isLoading) return undefined
    if (!isProposer) return 'Only the proposer can update this proposal'
    if (!isInUpdatablePeriod) {
      if (updateDeadline) {
        return `Update period ended ${updateDeadline.toLocaleString()}`
      }
      return 'Update period has ended'
    }
    return undefined
  }

  const disabledReason = getDisabledReason()
  const isDisabled = !canUpdate || isLoading

  const handleClick = () => {
    if (onUpdateClick) {
      onUpdateClick()
    }
  }

  const button = (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      variant="secondary"
      size="sm"
      {...buttonProps}
    >
      <Flex align="center" gap="x2" fontSize="16">
        <Icon id="pencil" size="sm" />
        Update Proposal
      </Flex>
    </Button>
  )

  // Wrap with tooltip wrapper if there's a disabled reason
  if (disabledReason) {
    return (
      <Stack position="relative" display="inline-flex">
        {button}
        <Tooltip>{disabledReason}</Tooltip>
      </Stack>
    )
  }

  return button
}
