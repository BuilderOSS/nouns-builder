import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { SAFE_APP_URL, SAFE_HOME_URL } from '@buildeross/constants/safe'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { useIsGnosisSafe } from '@buildeross/hooks/useIsGnosisSafe'
import { type StreamBatchData, useStreamData } from '@buildeross/hooks/useStreamData'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { CHAIN_ID } from '@buildeross/types'
import { Accordion } from '@buildeross/ui/Accordion'
import { atoms, Box, Button, Icon, Spinner, Stack, Text } from '@buildeross/zord'
import { useMemo, useState } from 'react'
import { Address, isAddressEqual } from 'viem'
import { useAccount } from 'wagmi'

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

  const {
    streamBatches,
    lockupAddress,
    isLoadingStreamIds,
    isLoadingLiveData,
    refetchLiveData,
  } = useStreamData(chain.id, proposal)

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
            lockupAddress={lockupAddress}
            withdrawingStreamId={withdrawingStreamId}
            setWithdrawingStreamId={setWithdrawingStreamId}
            cancelingStreamId={cancelingStreamId}
            setCancelingStreamId={setCancelingStreamId}
            onOpenProposalReview={onOpenProposalReview}
            proposal={proposal}
            refetchLiveData={refetchLiveData}
          />
        ))}
    </>
  )
}

interface StreamBatchProps {
  batch: StreamBatchData
  batchIndex: number
  totalBatches: number
  lockupAddress: Address | null
  withdrawingStreamId: bigint | null
  setWithdrawingStreamId: (id: bigint | null) => void
  cancelingStreamId: bigint | null
  setCancelingStreamId: (id: bigint | null) => void
  onOpenProposalReview: () => Promise<void>
  proposal: Proposal
  refetchLiveData: () => Promise<unknown>
}

const StreamBatch = ({
  batch,
  batchIndex,
  totalBatches,
  lockupAddress,
  withdrawingStreamId,
  setWithdrawingStreamId,
  cancelingStreamId,
  setCancelingStreamId,
  onOpenProposalReview,
  proposal,
  refetchLiveData,
}: StreamBatchProps) => {
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const { address } = useAccount()

  const { streamData, streamIds, liveStreams } = batch

  const { tokenMetadata } = useTokenMetadataSingle(chain.id, streamData?.tokenAddress)

  const isExecuted =
    !!proposal.executionTransactionHash && !!streamIds && streamIds.length > 0

  // Get sender from first stream (all streams in a batch have the same sender)
  const senderAddress = useMemo(() => {
    if (!streamData?.streams || streamData.streams.length === 0) return null

    // Try to get sender from live data first, then fall back to stream config
    const firstLiveData = isExecuted && liveStreams ? liveStreams[0] : null
    return firstLiveData?.sender || streamData.streams[0]?.sender || null
  }, [streamData, liveStreams, isExecuted])

  const { displayName: senderDisplayName } = useEnsData(senderAddress ?? undefined)

  const { isGnosisSafe: isSenderAGnosisSafe } = useIsGnosisSafe(
    senderAddress ?? undefined,
    chain.id
  )

  const isSenderTreasury =
    senderAddress &&
    addresses.treasury &&
    isAddressEqual(senderAddress, addresses.treasury)

  const isSenderConnected =
    senderAddress && address && isAddressEqual(senderAddress, address)

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

            // CreateStreamItem is a factory function that returns { title, description }
            // for the Accordion component, not a traditional React component
            return CreateStreamItem({
              stream,
              index,
              isDurationsMode: streamData.isDurationsMode,
              liveData,
              streamId,
              isExecuted,
              tokenMetadata,
              lockupAddress,
              withdrawingStreamId,
              setWithdrawingStreamId,
              cancelingStreamId,
              setCancelingStreamId,
              onOpenProposalReview,
              refetchLiveData,
              isSenderAGnosisSafe,
            })
          })}
        />
      )}

      {!!senderAddress && !isSenderTreasury && (
        <Stack direction="row" align="center">
          <Text variant="label-sm" color="primary" mr="x2">
            Stream Delegated to
          </Text>
          <Box color={'secondary'} className={atoms({ textDecoration: 'underline' })}>
            <a
              href={
                isSenderAGnosisSafe
                  ? createSafeUrl(chain.id, senderAddress)
                  : `${ETHERSCAN_BASE_URL[chain.id]}/address/${senderAddress}`
              }
              rel="noreferrer"
              target="_blank"
            >
              <Text variant="label-sm">{senderDisplayName || senderAddress}</Text>
            </a>
          </Box>
        </Stack>
      )}
      {!!senderAddress &&
        isSenderAGnosisSafe &&
        !isSenderConnected &&
        !isSenderTreasury && (
          <Stack direction="column" fontWeight={'heading'} mt="x2" ml="x4" gap="x2">
            <a
              href={createSafeAppUrl(chain.id, senderAddress, window.location.href)}
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
  )
}
