import { useDropData } from '@buildeross/hooks/useDropData'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore } from '@buildeross/stores'
import { Spinner, Stack } from '@buildeross/zord'

import { Section } from '../Section'
import { DropItem } from './DropItem'

interface DropDetailsProps {
  proposal: Proposal
  onOpenProposalReview: () => Promise<void>
}

export const DropDetails = ({ proposal }: DropDetailsProps) => {
  const { chain } = useChainStore()

  const { drops, isLoading, isCreateTx } = useDropData(chain.id, proposal)

  if (!isCreateTx) return null

  const isExecuted = !!proposal.executionTransactionHash

  return (
    <Section title="Drop Creations">
      {isLoading && <Spinner size="md" />}

      {!isLoading && (
        <Stack>
          {drops.map((drop, index) => (
            <DropItem
              key={index}
              drop={drop}
              index={index}
              isExecuted={isExecuted}
              chainId={chain.id}
            />
          ))}
        </Stack>
      )}
    </Section>
  )
}
