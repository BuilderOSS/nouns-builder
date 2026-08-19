import { useVotes } from '@buildeross/hooks/useVotes'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { Flex } from '@buildeross/zord'
import React, { Fragment, useMemo } from 'react'
import { getAddress } from 'viem'
import { useAccount } from 'wagmi'

import { parseProposalTransactions } from '../../utils/parseProposalTransactions'
import { OverwriteDraftModal } from '../OverwriteDraftModal'
import { UpdateProposalButton } from '../UpdateProposalButton'
import { CancelButton } from './CancelButton'
import { ConnectWalletAction } from './ConnectWalletAction'
import { SuccessfulProposalActions } from './SuccessfulProposalActions'
import { VetoAction } from './VetoAction'
import { VoteStatus } from './VoteStatus'

interface ProposalActionsProps {
  daoName?: string
  proposal: Proposal
  onNavigateToUpdateProposal?: () => Promise<void>
}

export const ProposalActions: React.FC<ProposalActionsProps> = ({
  daoName,
  proposal,
  onNavigateToUpdateProposal,
}) => {
  const { address: userAddress } = useAccount()
  const addresses = useDaoStore((state) => state.addresses)
  const chain = useChainStore((state) => state.chain)
  const {
    startProposalDraft,
    title: draftTitle,
    summary: draftSummary,
    transactions: draftTransactions,
    representedAddress: draftRepresentedAddress,
    discussionUrl: draftDiscussionUrl,
  } = useProposalStore()
  const [showOverwriteModal, setShowOverwriteModal] = React.useState(false)

  const { isLoading, isVetoer, votes } = useVotes({
    chainId: chain.id,
    collectionAddress: addresses.token,
    governorAddress: addresses.governor,
    signerAddress: userAddress,
    timestamp: BigInt(proposal.timeCreated),
  })

  const { votesAvailable, isProposer, signerVote } = useMemo(() => {
    const votesAvailable = !!votes ? Number(votes) : 0

    const isProposer =
      !!userAddress && getAddress(proposal.proposer) == getAddress(userAddress)

    const signerVote = !!userAddress
      ? proposal.votes?.find((vote) => getAddress(vote.voter) === getAddress(userAddress))
      : undefined

    return {
      votesAvailable,
      isProposer,
      signerVote,
    }
  }, [userAddress, votes, proposal.votes, proposal.proposer])

  const loadProposalForUpdate = React.useCallback(async () => {
    // Parse proposal data to reconstruct TransactionBundle[]
    // Use metadata (the full JSON) instead of description (the parsed text)
    const parsed = parseProposalTransactions(
      proposal.metadata || '',
      proposal.targets || [],
      proposal.values || [],
      proposal.calldatas || []
    )

    // Load the full proposal data into the store
    startProposalDraft({
      title: parsed.title || proposal.title || '',
      summary: parsed.summary || proposal.description || '',
      discussionUrl: parsed.discussionUrl || proposal.discussionUrl || '',
      representedAddress:
        parsed.representedAddress || proposal.representedAddress || undefined,
      representedAddressEnabled:
        !!parsed.representedAddress || !!proposal.representedAddress,
      transactions: parsed.transactions, // ✅ Full transaction bundles!
      updateProposalId: proposal.proposalId,
    })

    // Navigate to create page using callback
    if (onNavigateToUpdateProposal) {
      await onNavigateToUpdateProposal()
    }
  }, [proposal, startProposalDraft, onNavigateToUpdateProposal])

  const handleUpdateProposal = React.useCallback(() => {
    // Check if there's existing draft data
    const hasExistingDraft =
      !!draftTitle ||
      !!draftSummary ||
      draftTransactions.length > 0 ||
      !!draftRepresentedAddress ||
      !!draftDiscussionUrl

    // If there's existing draft data, show confirmation modal
    if (hasExistingDraft) {
      setShowOverwriteModal(true)
      return
    }

    // No existing draft, proceed directly
    loadProposalForUpdate()
  }, [
    loadProposalForUpdate,
    draftTitle,
    draftSummary,
    draftTransactions.length,
    draftRepresentedAddress,
    draftDiscussionUrl,
  ])

  const handleConfirmOverwrite = React.useCallback(() => {
    setShowOverwriteModal(false)
    loadProposalForUpdate()
  }, [loadProposalForUpdate])

  const handleCancelOverwrite = React.useCallback(() => {
    setShowOverwriteModal(false)
  }, [])

  if (!userAddress) return <ConnectWalletAction />
  if (isLoading) return null

  return (
    <Fragment>
      <SuccessfulProposalActions proposal={proposal} />

      <Flex
        direction={{ '@initial': 'column', '@768': 'row' }}
        w={'100%'}
        align={'center'}
        justify={'space-between'}
        p={{ '@initial': 'x4', '@768': 'x6' }}
        gap={'x3'}
        borderStyle={'solid'}
        borderWidth={'normal'}
        borderColor={'border'}
        borderRadius={'curved'}
      >
        <VoteStatus
          signerVote={signerVote}
          votesAvailable={votesAvailable}
          proposalId={proposal.proposalId}
          voteStart={proposal.voteStart}
          timeCreated={proposal.timeCreated}
          state={proposal.state}
          daoName={daoName}
          title={proposal.title || ''}
          updateDeadline={proposal.updatePeriodEnd}
          candidateVersion={proposal.candidateVersion}
        />

        <Flex gap="x2" direction={'row'} style={{ flexShrink: 0 }}>
          {isProposer && (
            <UpdateProposalButton
              proposalId={proposal.proposalId}
              proposerAddress={proposal.proposer as AddressType}
              onUpdateClick={handleUpdateProposal}
              candidateVersion={proposal.candidateVersion}
            />
          )}
          {isProposer && <CancelButton proposalId={proposal.proposalId} />}
        </Flex>
      </Flex>

      {isVetoer && (
        <VetoAction
          proposalId={proposal.proposalId}
          proposalNumber={proposal.proposalNumber}
        />
      )}

      <OverwriteDraftModal
        isOpen={showOverwriteModal}
        onClose={handleCancelOverwrite}
        onConfirm={handleConfirmOverwrite}
        draftTitle={draftTitle}
      />
    </Fragment>
  )
}
