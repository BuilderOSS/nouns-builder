import { type StreamBatchData, useStreamData } from '@buildeross/hooks/useStreamData'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore } from '@buildeross/stores'
import { Accordion } from '@buildeross/ui/Accordion'
import { Box, Spinner, Text } from '@buildeross/zord'
import { useState } from 'react'
import { Address } from 'viem'

import { StreamItem } from './StreamItem'

interface StreamDetailsProps {
  proposal: Proposal
  onOpenProposalReview: () => Promise<void>
}

export const StreamDetails = ({ proposal, onOpenProposalReview }: StreamDetailsProps) => {
  const { chain } = useChainStore()

  const { streamBatches, lockupLinearAddress, isLoadingStreamIds, isLoadingLiveData } =
    useStreamData(chain.id, proposal)

  const isLoading = isLoadingStreamIds || isLoadingLiveData

  const [withdrawingStreamId, setWithdrawingStreamId] = useState<bigint | null>(null)
  const [cancelingStreamId, setCancelingStreamId] = useState<bigint | null>(null)

  return (
    <>
      {isLoading && <Spinner size="md" />}

      {!isLoading &&
        streamBatches.map((batch: StreamBatchData, batchIndex: number) => (
          <StreamBatch
            key={batchIndex}
            batch={batch}
            batchIndex={batchIndex}
            totalBatches={streamBatches.length}
            lockupLinearAddress={lockupLinearAddress}
            withdrawingStreamId={withdrawingStreamId}
            setWithdrawingStreamId={setWithdrawingStreamId}
            cancelingStreamId={cancelingStreamId}
            setCancelingStreamId={setCancelingStreamId}
            onOpenProposalReview={onOpenProposalReview}
            proposal={proposal}
          />
        ))}
    </>
  )
}

interface StreamBatchProps {
  batch: StreamBatchData
  batchIndex: number
  totalBatches: number
  lockupLinearAddress: Address | null
  withdrawingStreamId: bigint | null
  setWithdrawingStreamId: (id: bigint | null) => void
  cancelingStreamId: bigint | null
  setCancelingStreamId: (id: bigint | null) => void
  onOpenProposalReview: () => Promise<void>
  proposal: Proposal
}

const StreamBatch = ({
  batch,
  batchIndex,
  totalBatches,
  lockupLinearAddress,
  withdrawingStreamId,
  setWithdrawingStreamId,
  cancelingStreamId,
  setCancelingStreamId,
  onOpenProposalReview,
  proposal,
}: StreamBatchProps) => {
  const { chain } = useChainStore()

  const { streamData, streamIds, liveStreams } = batch

  const { tokenMetadata } = useTokenMetadataSingle(chain.id, streamData?.tokenAddress)

  const isExecuted =
    !!proposal.executionTransactionHash && !!streamIds && streamIds.length > 0

  if (!streamData) {
    return null
  }

  return (
    <>
      {totalBatches > 1 && (
        <Box mb="x4">
          <Text variant="heading-sm">Stream Batch #{batchIndex + 1}</Text>
        </Box>
      )}

      {streamData.streams && (
        <Accordion
          items={streamData.streams.map((stream: any, index: number) => {
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
