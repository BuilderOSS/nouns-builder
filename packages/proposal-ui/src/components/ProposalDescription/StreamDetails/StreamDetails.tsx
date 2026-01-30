import { useStreamData } from '@buildeross/hooks/useStreamData'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore } from '@buildeross/stores'
import { Accordion } from '@buildeross/ui/Accordion'
import { Spinner } from '@buildeross/zord'
import { useState } from 'react'

import { StreamItem } from './StreamItem'

interface StreamDetailsProps {
  proposal: Proposal
  onOpenProposalReview: () => Promise<void>
}

export const StreamDetails = ({ proposal, onOpenProposalReview }: StreamDetailsProps) => {
  const { chain } = useChainStore()

  const {
    streamData,
    streamIds,
    liveStreams,
    lockupLinearAddress,
    isLoadingStreamIds,
    isLoadingLiveData,
  } = useStreamData(chain.id, proposal)

  const { tokenMetadata } = useTokenMetadataSingle(chain.id, streamData?.tokenAddress)

  const isExecuted =
    !!proposal.executionTransactionHash && !!streamIds && streamIds.length > 0
  const isLoading = isExecuted && (isLoadingStreamIds || isLoadingLiveData)

  const [withdrawingStreamId, setWithdrawingStreamId] = useState<bigint | null>(null)
  const [cancelingStreamId, setCancelingStreamId] = useState<bigint | null>(null)

  if (!streamData) {
    return null
  }

  return (
    <>
      {isLoading && <Spinner size="md" />}

      {!isLoading && streamData.streams && (
        <Accordion
          items={streamData.streams.map((stream, index) => {
            const liveData = isExecuted && liveStreams ? liveStreams[index] : null
            const streamId = isExecuted && streamIds ? streamIds[index] : null

            return StreamItem({
              stream,
              index,
              isDurationsMode: streamData.isDurationsMode,
              liveData,
              streamId,
              isExecuted,
              tokenMetadata,
              lockupLinearAddress,
              withdrawingStreamId,
              setWithdrawingStreamId,
              cancelingStreamId,
              setCancelingStreamId,
              onOpenProposalReview,
            })
          })}
        />
      )}
    </>
  )
}
