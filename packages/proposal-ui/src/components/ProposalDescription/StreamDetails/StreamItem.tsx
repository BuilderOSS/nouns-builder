import { BASE_URL } from '@buildeross/constants/baseUrl'
import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { useIsGnosisSafe } from '@buildeross/hooks/useIsGnosisSafe'
import { useVotes } from '@buildeross/hooks/useVotes'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { AddressType, TokenMetadata, TransactionType } from '@buildeross/types'
import { AccordionItem } from '@buildeross/ui/Accordion'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { walletSnippet } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { lockupAbi, StreamStatus } from '@buildeross/utils/sablier/constants'
import {
  calculateStreamTimes,
  createSablierStreamUrl,
  formatStreamDuration,
  getStatusLabel,
  StreamConfigDurations,
  StreamConfigTimestamps,
  StreamLiveData,
} from '@buildeross/utils/sablier/streams'
import { createSafeAppUrl, createSafeUrl } from '@buildeross/utils/safe'
import { atoms, Box, Button, Icon, Stack, Text } from '@buildeross/zord'
import { useCallback, useMemo } from 'react'
import { Address, encodeFunctionData, formatUnits, isAddressEqual } from 'viem'
import { useAccount, useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { linkStyle } from './StreamItem.css'

interface StreamItemProps {
  stream: StreamConfigDurations | StreamConfigTimestamps
  index: number
  isDurationsMode: boolean
  liveData: StreamLiveData | null
  streamId: bigint | null
  isExecuted: boolean
  tokenMetadata?: TokenMetadata
  lockupAddress: Address | null
  withdrawingStreamId: bigint | null
  setWithdrawingStreamId: (id: bigint | null) => void
  cancelingStreamId: bigint | null
  setCancelingStreamId: (id: bigint | null) => void
  onOpenProposalReview: () => Promise<void>
  refetchLiveData: () => Promise<unknown>
  senderAddress: Address | null
  showIndividualSenders: boolean
  proposalId: string
}

/**
 * StreamItem component that renders an AccordionItem for a Sablier stream.
 */
export const StreamItem = ({
  stream,
  index,
  isDurationsMode,
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
  senderAddress,
  showIndividualSenders,
  proposalId,
}: StreamItemProps) => {
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const { addTransaction } = useProposalStore()
  const { address } = useAccount()
  const config = useConfig()
  const { getProposalLink } = useLinks()

  const { hasThreshold } = useVotes({
    chainId: chain.id,
    governorAddress: addresses.governor,
    signerAddress: address,
    collectionAddress: addresses.token,
  })

  const { displayName: recipientName } = useEnsData(stream.recipient)

  // Sender info hooks (called at top level)
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

  const { startTime, cliffTime, endTime } = useMemo(
    () =>
      liveData
        ? {
            startTime: liveData.startTime,
            cliffTime: liveData.cliffTime,
            endTime: liveData.endTime,
          }
        : calculateStreamTimes(stream, isDurationsMode),
    [liveData, stream, isDurationsMode]
  )

  const decimals = tokenMetadata?.decimals ?? 18
  const totalAmount = stream.depositAmount

  const duration = endTime - startTime
  const hasCliff = cliffTime > 0

  const isRecipient = address && isAddressEqual(stream.recipient, address)

  const isSender = address && senderAddress && isAddressEqual(senderAddress, address)

  const handleWithdraw = useCallback(async () => {
    if (!lockupAddress || !address || !liveData) return

    try {
      setWithdrawingStreamId(liveData.streamId)
      const data = await simulateContract(config, {
        address: lockupAddress,
        abi: lockupAbi,
        functionName: 'withdrawMax',
        args: [liveData.streamId, address],
        value: liveData.minFeeWei,
      })

      const txHash = await writeContract(config, data.request)
      await waitForTransactionReceipt(config, {
        hash: txHash,
        chainId: chain.id,
      })
      refetchLiveData()
    } catch (error) {
      console.error('Error withdrawing from stream:', error)
    } finally {
      setWithdrawingStreamId(null)
    }
  }, [
    config,
    chain.id,
    lockupAddress,
    address,
    liveData,
    setWithdrawingStreamId,
    refetchLiveData,
  ])

  const handleCancelDirect = useCallback(async () => {
    if (!lockupAddress || !liveData) return

    try {
      setCancelingStreamId(liveData.streamId)
      const data = await simulateContract(config, {
        address: lockupAddress,
        abi: lockupAbi,
        functionName: 'cancel',
        args: [liveData.streamId],
      })

      const txHash = await writeContract(config, data.request)
      await waitForTransactionReceipt(config, {
        hash: txHash,
        chainId: chain.id,
      })
    } catch (error) {
      console.error('Error canceling stream:', error)
    } finally {
      setCancelingStreamId(null)
    }
  }, [config, chain.id, lockupAddress, liveData, setCancelingStreamId])

  const handleCancelAsProposal = useCallback(async () => {
    if (!lockupAddress || !liveData) return

    const cancelTransaction = {
      target: lockupAddress as AddressType,
      functionSignature: 'cancel(uint256)',
      calldata: encodeFunctionData({
        abi: lockupAbi,
        functionName: 'cancel',
        args: [liveData.streamId],
      }),
      value: '',
    }

    const cancelTxnData = {
      type: TransactionType.CUSTOM,
      summary: `Cancel Sablier Stream #${liveData.streamId}`,
      transactions: [cancelTransaction],
    }

    addTransaction(cancelTxnData)
    onOpenProposalReview()
  }, [onOpenProposalReview, addTransaction, lockupAddress, liveData])

  const recipientDisplay = recipientName || walletSnippet(stream.recipient)

  const sablierUrl = useMemo(() => {
    if (!isExecuted || !streamId || !lockupAddress) return null
    return createSablierStreamUrl({
      chainId: chain.id,
      streamId,
      contractAddress: lockupAddress,
    })
  }, [isExecuted, streamId, chain.id, lockupAddress])

  const amountDisplay = tokenMetadata?.symbol
    ? `${formatCryptoVal(formatUnits(totalAmount, decimals))} ${tokenMetadata.symbol}`
    : formatUnits(totalAmount, decimals)

  const amountPart = tokenMetadata?.symbol ? `: ${amountDisplay}` : ''

  // Get proposal link for Safe app integration
  const proposalUrl = useMemo(() => {
    if (!addresses.token || !proposalId) return ''
    const proposalLink = getProposalLink(chain.id, addresses.token, proposalId)
    // Add BASE_URL if the href is a relative path
    return proposalLink.href.startsWith('http')
      ? proposalLink.href
      : `${BASE_URL}${proposalLink.href}`
  }, [chain.id, addresses.token, proposalId])

  const title = <Text>{`Stream ${index + 1}${amountPart} - ${recipientDisplay}`}</Text>

  const description = (
    <Stack gap="x3">
      <Stack
        direction="row"
        align="center"
        justify="space-between"
        flexWrap="wrap"
        gap="x2"
      >
        <Stack direction="row" align="center" gap="x2">
          <Text variant="label-xs" color="tertiary">
            Recipient:
          </Text>
          <Box color={'secondary'} className={atoms({ textDecoration: 'underline' })}>
            <a href={`/profile/${stream.recipient}`}>
              <Text variant="label-xs">{recipientDisplay}</Text>
            </a>
          </Box>
        </Stack>
        <Text variant="label-xs" color="tertiary">
          Total: {amountDisplay}
        </Text>
      </Stack>
      <Stack
        direction="row"
        align="center"
        justify="space-between"
        flexWrap="wrap"
        gap="x2"
      >
        {hasCliff && (
          <Text variant="label-xs" color="tertiary">
            Cliff: {new Date(cliffTime * 1000).toLocaleDateString()}
          </Text>
        )}
        <Text variant="label-xs" color="tertiary">
          Duration: {formatStreamDuration(duration)}
        </Text>
      </Stack>
      <Stack
        direction="row"
        align="center"
        justify="space-between"
        flexWrap="wrap"
        gap="x2"
      >
        <Text variant="label-xs" color="tertiary">
          Cancelable: {stream.cancelable ? 'Yes' : 'No'}
        </Text>
        <Text variant="label-xs" color="tertiary">
          Transferable: {stream.transferable ? 'Yes' : 'No'}
        </Text>
      </Stack>
      {(!isDurationsMode || isExecuted) && (
        <Stack
          direction="row"
          align="center"
          justify="space-between"
          flexWrap="wrap"
          gap="x2"
        >
          <Text variant="label-xs" color="tertiary">
            Start: {new Date(startTime * 1000).toLocaleDateString()}
          </Text>
          <Text variant="label-xs" color="tertiary">
            End: {new Date(endTime * 1000).toLocaleDateString()}
          </Text>
        </Stack>
      )}

      {liveData && (
        <>
          {/* Prominent withdrawal info cards */}
          <Stack direction={{ '@initial': 'column', '@768': 'row' }} gap="x3" mt="x4">
            {/* Currently Withdrawable - Most Important */}
            <Box
              flex="1"
              backgroundColor="background2"
              p="x4"
              borderRadius="curved"
              borderWidth="normal"
              borderStyle="solid"
              borderColor={
                liveData.status === StreamStatus.STREAMING &&
                liveData.withdrawableAmount > 0n
                  ? 'positive'
                  : 'border'
              }
            >
              <Text variant="label-xs" color="tertiary" mb="x2">
                Available to Withdraw
              </Text>
              <Text fontSize={28} fontWeight="heading">
                {liveData.withdrawableAmount > 0n
                  ? formatCryptoVal(formatUnits(liveData.withdrawableAmount, decimals))
                  : '0'}
              </Text>
              <Text variant="label-sm" color="tertiary">
                {tokenMetadata?.symbol}
              </Text>
            </Box>

            {/* Already Withdrawn */}
            <Box
              flex="1"
              backgroundColor="background2"
              p="x4"
              borderRadius="curved"
              borderWidth="normal"
              borderStyle="solid"
              borderColor="border"
            >
              <Text variant="label-xs" color="tertiary" mb="x2">
                Already Withdrawn
              </Text>
              <Text fontSize={28} fontWeight="heading">
                {formatCryptoVal(formatUnits(liveData.withdrawnAmount, decimals))}
              </Text>
              <Text variant="label-sm" color="tertiary">
                {tokenMetadata?.symbol}
              </Text>
            </Box>
          </Stack>

          {/* Status and remaining details */}
          <Stack direction="column" gap="x2" mt="x3">
            <Stack direction="row" align="center" justify="space-between">
              <Text variant="label-xs" color="tertiary">
                Status:
              </Text>
              <Box
                backgroundColor={
                  liveData.status === StreamStatus.STREAMING
                    ? 'positive'
                    : liveData.status === StreamStatus.CANCELED
                      ? 'negative'
                      : 'background2'
                }
                px="x2"
                py="x1"
                borderRadius="curved"
              >
                <Text variant="label-xs" color="primary">
                  {getStatusLabel(liveData.status)}
                </Text>
              </Box>
            </Stack>
            {/* TODO: When stream is canceled, display link to cancel transaction or proposal */}
            {/* TODO: Add withdrawal transaction history display/links for this stream */}
            <Stack direction="row" align="center" justify="space-between">
              <Text variant="label-xs" color="tertiary">
                Total Deposited:
              </Text>
              <Text variant="label-xs">
                {formatCryptoVal(formatUnits(liveData.depositedAmount, decimals))}{' '}
                {tokenMetadata?.symbol}
              </Text>
            </Stack>
            <Stack direction="row" align="center" justify="space-between">
              <Text variant="label-xs" color="tertiary">
                Remaining in Stream:
              </Text>
              <Text variant="label-xs">
                {formatCryptoVal(
                  formatUnits(
                    liveData.depositedAmount - liveData.withdrawnAmount,
                    decimals
                  )
                )}{' '}
                {tokenMetadata?.symbol}
              </Text>
            </Stack>
          </Stack>

          {/* Withdraw button for recipient */}
          {isRecipient &&
            liveData.withdrawableAmount > 0n &&
            !liveData.wasCanceled &&
            !liveData.isDepleted && (
              <ContractButton
                chainId={chain.id}
                variant="primary"
                handleClick={() => handleWithdraw()}
                disabled={withdrawingStreamId === liveData.streamId}
                loading={withdrawingStreamId === liveData.streamId}
              >
                Withdraw Available Funds
              </ContractButton>
            )}

          {/* Cancel button for sender */}
          {stream.cancelable &&
            !liveData.wasCanceled &&
            !liveData.isDepleted &&
            liveData.status !== StreamStatus.SETTLED && (
              <>
                {isSender && (
                  <ContractButton
                    chainId={chain.id}
                    variant="destructive"
                    handleClick={handleCancelDirect}
                    disabled={cancelingStreamId === liveData.streamId}
                    loading={cancelingStreamId === liveData.streamId}
                  >
                    Cancel Stream
                  </ContractButton>
                )}
                {isSenderTreasury && !isSender && (
                  <Stack direction="column" gap="x1">
                    <Text variant="label-xs" color="tertiary">
                      Create a proposal to cancel this stream
                    </Text>
                    <ContractButton
                      chainId={chain.id}
                      variant="destructive"
                      handleClick={handleCancelAsProposal}
                      disabled={!hasThreshold}
                      fontSize={12}
                    >
                      Create Proposal to Cancel Stream
                    </ContractButton>
                    {!hasThreshold && (
                      <Text variant="label-xs" color="negative">
                        You do not have enough votes to create a proposal
                      </Text>
                    )}
                  </Stack>
                )}
              </>
            )}

          {/* Link to Sablier app */}
          {!!sablierUrl && !!liveData.sender && (
            <Stack direction="column" gap="x2">
              {isSenderTreasury ? (
                <a
                  href={sablierUrl}
                  rel="noreferrer"
                  target="_blank"
                  className={linkStyle}
                >
                  <Button variant="secondary" size="sm">
                    View Stream on Sablier
                    <Icon id="arrowTopRight" />
                  </Button>
                </a>
              ) : (
                <>
                  {isSenderAGnosisSafe ? (
                    <a
                      href={createSafeAppUrl(chain.id, liveData.sender, proposalUrl)}
                      rel="noreferrer"
                      target="_blank"
                      className={linkStyle}
                    >
                      <Button variant="secondary" size="sm">
                        View Proposal As Safe App
                        <Icon id="arrowTopRight" />
                      </Button>
                    </a>
                  ) : (
                    <a
                      href={sablierUrl}
                      rel="noreferrer"
                      target="_blank"
                      className={linkStyle}
                    >
                      <Button variant="secondary" size="sm">
                        View Stream on Sablier
                        <Icon id="arrowTopRight" />
                      </Button>
                    </a>
                  )}
                </>
              )}
            </Stack>
          )}
        </>
      )}

      {/* Links before execution */}
      {!isExecuted && (
        <Stack direction="column" gap="x2" mt="x3">
          <Text variant="label-sm" color="tertiary">
            Stream will be created when proposal is executed
          </Text>
        </Stack>
      )}

      {/* Individual sender display - shown when senders differ across streams */}
      {showIndividualSenders && senderAddress && !isSenderTreasury && (
        <>
          <Stack direction="row" align="center" mt="x4">
            <Text variant="label-sm" color="primary" mr="x2">
              Delegated to
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
          {isSenderAGnosisSafe && !isSenderConnected && !isSenderTreasury && (
            <Stack direction="column" fontWeight={'heading'} mt="x2" ml="x4" gap="x2">
              <a
                href={createSafeAppUrl(chain.id, senderAddress, proposalUrl)}
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
    </Stack>
  )

  return <AccordionItem title={title} description={description} />
}
