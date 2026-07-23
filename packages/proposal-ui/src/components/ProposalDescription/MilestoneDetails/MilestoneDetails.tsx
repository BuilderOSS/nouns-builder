import { type EscrowInstanceData, useInvoiceData } from '@buildeross/hooks/useInvoiceData'
import { useVotes } from '@buildeross/hooks/useVotes'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useAuthStore, useChainStore, useDaoStore } from '@buildeross/stores'
import { Spinner } from '@buildeross/zord'

import { Section } from '../Section'
import { EscrowInstance } from './EscrowInstance'

interface MilestoneDetailsProps {
  proposal: Proposal
  onOpenProposalReview: () => Promise<void>
}

export const MilestoneDetails = ({
  proposal,
  onOpenProposalReview,
}: MilestoneDetailsProps) => {
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const { address } = useAuthStore()

  const { hasThreshold } = useVotes({
    chainId: chain.id,
    governorAddress: addresses.governor,
    signerAddress: address,
    collectionAddress: addresses.token,
  })

  const { escrows, isLoadingInvoice, isDeployTx } = useInvoiceData(chain.id, proposal)

  const isLoading = isLoadingInvoice && escrows.length === 0

  if (!isDeployTx) return null

  return (
    <Section title="Escrow Milestones">
      {isLoading && <Spinner size="md" />}

      {!isLoading &&
        escrows.map((escrow: EscrowInstanceData, escrowIndex: number) => (
          <EscrowInstance
            key={escrowIndex}
            escrow={escrow}
            escrowIndex={escrowIndex}
            totalEscrows={escrows.length}
            onOpenProposalReview={onOpenProposalReview}
            hasThreshold={hasThreshold}
            proposalId={proposal.proposalId}
          />
        ))}
    </Section>
  )
}
