import { BASE_URL } from '@buildeross/constants/baseUrl'
import { type StreamBatchData, useStreamData } from '@buildeross/hooks/useStreamData'
import { useTokenMetadata } from '@buildeross/hooks/useTokenMetadata'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { Spinner, Stack } from '@buildeross/zord'
import { useMemo, useState } from 'react'
import { Address, getAddress, isAddressEqual } from 'viem'

import { Section } from '../Section'
import { SenderDelegation } from './SenderDelegation'
import { StreamItem } from './StreamItem'

interface StreamDetailsProps {
  proposal: Proposal
  onOpenProposalReview: () => Promise<void>
}

export const StreamDetails = ({ proposal, onOpenProposalReview }: StreamDetailsProps) => {
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const { getProposalLink } = useLinks()

  const {
    streamBatches,
    lockupAddress,
    isLoadingStreamIds,
    isLoadingLiveData,
    refetchLiveData,
    isCreateTx,
  } = useStreamData(chain.id, proposal)

  const isLoading = isLoadingStreamIds || isLoadingLiveData

  const [withdrawingStreamId, setWithdrawingStreamId] = useState<bigint | null>(null)
  const [cancelingStreamId, setCancelingStreamId] = useState<bigint | null>(null)

  // Check if all senders are the same across all streams in all batches
  const { allSendersSame, commonSender } = useMemo(() => {
    if (streamBatches.length === 0) return { allSendersSame: true, commonSender: null }

    const senders: Address[] = []

    streamBatches.forEach((batch) => {
      if (!batch.streamData?.streams) return

      batch.streamData.streams.forEach((stream, streamIdx) => {
        const liveData = batch.liveStreams?.[streamIdx]
        const sender = liveData?.sender || stream?.sender
        if (sender) senders.push(sender)
      })
    })

    if (senders.length === 0) return { allSendersSame: true, commonSender: null }

    const first = senders[0]
    const allSame = senders.every((s) => isAddressEqual(s, first))

    return { allSendersSame: allSame, commonSender: allSame ? first : null }
  }, [streamBatches])

  const isCommonSenderTreasury =
    commonSender && addresses.treasury && isAddressEqual(commonSender, addresses.treasury)

  // Get proposal link for Safe app integration
  const proposalUrl = useMemo(() => {
    if (!addresses.token || !proposal.proposalId) return ''
    const proposalLink = getProposalLink(chain.id, addresses.token, proposal.proposalId)
    // Add BASE_URL if the href is a relative path
    return proposalLink.href.startsWith('http')
      ? proposalLink.href
      : `${BASE_URL}${proposalLink.href}`
  }, [chain.id, addresses.token, proposal.proposalId, getProposalLink])

  if (!isCreateTx) return null

  return (
    <Section title="Sablier Streams">
      {isLoading && <Spinner size="md" />}

      {!isLoading && (
        <>
          <FlattenedStreams
            streamBatches={streamBatches}
            lockupAddress={lockupAddress}
            withdrawingStreamId={withdrawingStreamId}
            setWithdrawingStreamId={setWithdrawingStreamId}
            cancelingStreamId={cancelingStreamId}
            setCancelingStreamId={setCancelingStreamId}
            onOpenProposalReview={onOpenProposalReview}
            proposal={proposal}
            refetchLiveData={refetchLiveData}
            showIndividualSenders={!allSendersSame}
          />
          {allSendersSame && !!commonSender && !isCommonSenderTreasury && (
            <SenderDelegation
              chainId={chain.id}
              senderAddress={commonSender}
              proposalUrl={proposalUrl}
            />
          )}
        </>
      )}
    </Section>
  )
}

interface FlattenedStreamsProps {
  streamBatches: StreamBatchData[]
  lockupAddress: Address | null
  withdrawingStreamId: bigint | null
  setWithdrawingStreamId: (id: bigint | null) => void
  cancelingStreamId: bigint | null
  setCancelingStreamId: (id: bigint | null) => void
  onOpenProposalReview: () => Promise<void>
  proposal: Proposal
  refetchLiveData: () => Promise<unknown>
  showIndividualSenders: boolean
}

const FlattenedStreams = ({
  streamBatches,
  lockupAddress,
  withdrawingStreamId,
  setWithdrawingStreamId,
  cancelingStreamId,
  setCancelingStreamId,
  onOpenProposalReview,
  proposal,
  refetchLiveData,
  showIndividualSenders,
}: FlattenedStreamsProps) => {
  const { chain } = useChainStore()

  const isExecuted = !!proposal.executionTransactionHash

  // Flatten all streams from all batches into a single array
  const flattenedStreams = useMemo(() => {
    const streams: Array<{
      stream: any
      liveData: any
      streamId: bigint | null
      tokenAddress: Address | null
      isDurationsMode: boolean
      senderAddress: Address | null
    }> = []

    streamBatches.forEach((batch) => {
      if (!batch.streamData?.streams) return

      batch.streamData.streams.forEach((stream, streamIdx) => {
        const liveData =
          isExecuted && batch.liveStreams ? batch.liveStreams[streamIdx] : null
        const streamId = isExecuted && batch.streamIds ? batch.streamIds[streamIdx] : null

        // Get sender for this specific stream
        const senderAddress = liveData?.sender || stream?.sender || null

        streams.push({
          stream,
          liveData,
          streamId,
          tokenAddress: batch.streamData.tokenAddress,
          isDurationsMode: batch.streamData.isDurationsMode,
          senderAddress,
        })
      })
    })

    return streams
  }, [streamBatches, isExecuted])

  // Fetch token metadata for all unique token addresses
  const uniqueTokenAddresses = useMemo(
    () =>
      Array.from(
        new Set(
          flattenedStreams
            .map((s) => (s.tokenAddress ? getAddress(s.tokenAddress) : null))
            .filter((t): t is Address => !!t)
        )
      ),
    [flattenedStreams]
  )

  // Fetch metadata for all unique tokens in a single call
  const { metadata: tokenMetadataArray } = useTokenMetadata(
    chain.id,
    uniqueTokenAddresses
  )

  // Map token metadata to streams
  const streamsWithMetadata = useMemo(
    () =>
      flattenedStreams.map((streamData) => {
        // Find the corresponding token metadata by matching addresses
        const tokenMeta = streamData.tokenAddress
          ? tokenMetadataArray?.find(
              (meta) =>
                meta.address &&
                isAddressEqual(
                  meta.address as Address,
                  streamData.tokenAddress as Address
                )
            )
          : undefined

        return {
          ...streamData,
          tokenMetadata: tokenMeta,
        }
      }),
    [flattenedStreams, tokenMetadataArray]
  )

  return (
    <Stack>
      {streamsWithMetadata.map((streamData, index) => (
        <StreamItem
          key={index + '-' + streamData.streamId}
          stream={streamData.stream}
          index={index}
          isDurationsMode={streamData.isDurationsMode}
          liveData={streamData.liveData}
          streamId={streamData.streamId}
          isExecuted={isExecuted}
          tokenMetadata={streamData.tokenMetadata}
          lockupAddress={lockupAddress}
          withdrawingStreamId={withdrawingStreamId}
          setWithdrawingStreamId={setWithdrawingStreamId}
          cancelingStreamId={cancelingStreamId}
          setCancelingStreamId={setCancelingStreamId}
          onOpenProposalReview={onOpenProposalReview}
          refetchLiveData={refetchLiveData}
          senderAddress={streamData.senderAddress}
          showIndividualSenders={showIndividualSenders}
          proposalId={proposal.proposalId}
        />
      ))}
    </Stack>
  )
}
