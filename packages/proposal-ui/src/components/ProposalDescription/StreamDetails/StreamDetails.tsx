import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { SAFE_APP_URL, SAFE_HOME_URL } from '@buildeross/constants/safe'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { useIsGnosisSafe } from '@buildeross/hooks/useIsGnosisSafe'
import { type StreamBatchData, useStreamData } from '@buildeross/hooks/useStreamData'
import { useTokenMetadata } from '@buildeross/hooks/useTokenMetadata'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { CHAIN_ID } from '@buildeross/types'
import { Accordion } from '@buildeross/ui/Accordion'
import { atoms, Box, Button, Icon, Spinner, Stack, Text } from '@buildeross/zord'
import { useMemo, useState } from 'react'
import { Address, isAddressEqual } from 'viem'
import { useAccount } from 'wagmi'

import { Section } from '../Section'
import { CreateStreamItem } from './StreamItem'

const createSafeAppUrl = (chainId: CHAIN_ID, safeAddress: Address, appUrl: string) => {
  const safeUrl = SAFE_APP_URL[chainId]
  const encodedUrl = encodeURIComponent(appUrl)
  return `${safeUrl}:${safeAddress}&appUrl=${encodedUrl}`
}

const createSafeUrl = (chainId: CHAIN_ID, safeAddress: Address) => {
  const safeUrl = SAFE_HOME_URL[chainId]
  return `${safeUrl}:${safeAddress}`
}

interface StreamDetailsProps {
  proposal: Proposal
  onOpenProposalReview: () => Promise<void>
}

export const StreamDetails = ({ proposal, onOpenProposalReview }: StreamDetailsProps) => {
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const { address } = useAccount()

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

  const { displayName: commonSenderDisplayName } = useEnsData(commonSender ?? undefined)

  const { isGnosisSafe: isCommonSenderAGnosisSafe } = useIsGnosisSafe(
    commonSender ?? undefined,
    chain.id
  )

  const isCommonSenderTreasury =
    commonSender && addresses.treasury && isAddressEqual(commonSender, addresses.treasury)

  const isCommonSenderConnected =
    commonSender && address && isAddressEqual(commonSender, address)

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
            <>
              <Stack direction="row" align="center" mt="x4">
                <Text variant="label-sm" color="primary" mr="x2">
                  Stream Delegated to
                </Text>
                <Box
                  color={'secondary'}
                  className={atoms({ textDecoration: 'underline' })}
                >
                  <a
                    href={
                      isCommonSenderAGnosisSafe
                        ? createSafeUrl(chain.id, commonSender)
                        : `${ETHERSCAN_BASE_URL[chain.id]}/address/${commonSender}`
                    }
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Text variant="label-sm">
                      {commonSenderDisplayName || commonSender}
                    </Text>
                  </a>
                </Box>
              </Stack>
              {isCommonSenderAGnosisSafe &&
                !isCommonSenderConnected &&
                !isCommonSenderTreasury && (
                  <Stack
                    direction="column"
                    fontWeight={'heading'}
                    mt="x2"
                    ml="x4"
                    gap="x2"
                  >
                    <a
                      href={createSafeAppUrl(
                        chain.id,
                        commonSender,
                        window.location.href
                      )}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Button variant="secondary" size="sm">
                        View Proposal As Safe App
                        <Icon id="arrowTopRight" />
                      </Button>
                    </a>
                  </Stack>
                )}
            </>
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
          flattenedStreams.map((s) => s.tokenAddress).filter((t): t is Address => !!t)
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
    <Accordion
      items={streamsWithMetadata.map((streamData, index) =>
        CreateStreamItem({
          stream: streamData.stream,
          index,
          isDurationsMode: streamData.isDurationsMode,
          liveData: streamData.liveData,
          streamId: streamData.streamId,
          isExecuted,
          tokenMetadata: streamData.tokenMetadata,
          lockupAddress,
          withdrawingStreamId,
          setWithdrawingStreamId,
          cancelingStreamId,
          setCancelingStreamId,
          onOpenProposalReview,
          refetchLiveData,
          senderAddress: streamData.senderAddress,
          showIndividualSenders,
        })
      )}
    />
  )
}
