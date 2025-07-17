import { getFetchableUrls } from '@buildeross/ipfs-service'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Box, Button, Spinner, Stack, Text, atoms } from '@buildeross/zord'
import { Milestone as MilestoneMetadata } from '@smartinvoicexyz/types'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import { Hex, encodeFunctionData } from 'viem'
import { useAccount, useConfig, useReadContract } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import Accordion from 'src/components/Home/accordian'
import { Icon } from 'src/components/Icon'
import { ETHERSCAN_BASE_URL } from 'src/constants/etherscan'
import { SAFE_APP_URL, SAFE_HOME_URL } from 'src/constants/safe'
import { DecodedTransaction } from 'src/hooks/useDecodedTransactions'
import { useEnsData } from 'src/hooks/useEnsData'
import { useIsGnosisSafe } from 'src/hooks/useIsGnosisSafe'
import { useVotes } from 'src/hooks/useVotes'
import { TransactionType } from 'src/modules/create-proposal'
import { useProposalStore } from 'src/modules/create-proposal/stores'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'

import { useInvoiceData } from './useInvoiceData'

const RELEASE_FUNCTION_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: '_milestone', type: 'uint256' }],
    name: 'release',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

const createSmartInvoiceUrl = (chainId: CHAIN_ID, invoiceAddress: Hex) => {
  return `https://app.smartinvoice.xyz/invoice/${chainId}/${invoiceAddress}`
}

const createSafeAppUrl = (chainId: CHAIN_ID, safeAddress: Hex, appUrl: string) => {
  const safeUrl = SAFE_APP_URL[chainId]
  const encodedUrl = encodeURIComponent(appUrl)
  return `${safeUrl}:${safeAddress}&appUrl=${encodedUrl}`
}

const createSafeUrl = (chainId: CHAIN_ID, safeAddress: Hex) => {
  const safeUrl = SAFE_HOME_URL[chainId]
  return `${safeUrl}:${safeAddress}`
}

interface MilestoneDetailsProps {
  decodedTransaction: DecodedTransaction
  executionTransactionHash?: string
}

export const MilestoneDetails = ({
  decodedTransaction,
  executionTransactionHash,
}: MilestoneDetailsProps) => {
  const router = useRouter()
  const { chain: invoiceChain } = useChainStore()
  const { addresses } = useDaoStore()
  const { addTransaction } = useProposalStore()
  const { address } = useAccount()
  const config = useConfig()

  const { hasThreshold } = useVotes({
    chainId: invoiceChain.id,
    governorAddress: addresses?.governor,
    signerAddress: address,
    collectionAddress: addresses?.token,
  })

  const {
    invoiceAddress,
    clientAddress,
    milestoneAmounts,
    invoiceData,
    isLoadingInvoice,
  } = useInvoiceData(invoiceChain.id, decodedTransaction, executionTransactionHash)

  const invoiceUrl = !!invoiceAddress
    ? createSmartInvoiceUrl(invoiceChain.id, invoiceAddress)
    : undefined

  const { data: currentMilestoneData, isLoading: isLoadingMilestone } = useReadContract({
    address: invoiceAddress,
    query: {
      enabled: !!invoiceAddress,
    },
    abi: [
      {
        inputs: [],
        name: 'milestone',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'milestone',
    chainId: invoiceChain.id,
  })

  const { isGnosisSafe: isClientAGnosisSafe } = useIsGnosisSafe(
    clientAddress,
    invoiceChain.id
  )

  const currentMilestone = useMemo(
    () => Number(currentMilestoneData ?? 0),
    [currentMilestoneData]
  )

  const isClientTreasury = useMemo(
    () =>
      clientAddress &&
      addresses.treasury &&
      clientAddress.toLowerCase() === addresses.treasury.toLowerCase(),
    [clientAddress, addresses.treasury]
  )

  const isClientConnected = useMemo(
    () =>
      !!clientAddress &&
      !!address &&
      clientAddress.toLowerCase() === address.toLowerCase(),
    [clientAddress, address]
  )

  const { displayName: clientDisplayName } = useEnsData(clientAddress)

  const handleReleaseMilestoneAsProposal = useCallback(
    async (milestone: number) => {
      if (!invoiceAddress) return
      if (milestone < currentMilestone) return

      const releaseMilestone = {
        target: invoiceAddress as AddressType,
        functionSignature: 'release(_milestone)',
        calldata: encodeFunctionData({
          abi: RELEASE_FUNCTION_ABI,
          functionName: 'release',
          args: [milestone],
        }),
        value: '',
      }

      const releaseEscrowTxnData = {
        type: TransactionType.RELEASE_ESCROW_MILESTONE,
        summary: `Release Milestone #${milestone + 1} for ${invoiceData?.title}`,
        transactions: [releaseMilestone],
      }

      setTimeout(() => addTransaction(releaseEscrowTxnData), 3000)

      router.push({
        pathname: `/dao/[network]/[token]/proposal/review`,
        query: {
          network: router.query?.network,
          token: router.query?.token,
        },
      })
    },
    [router, addTransaction, invoiceData?.title, invoiceAddress, currentMilestone]
  )

  const [releasing, setReleasing] = useState(false)

  const handleReleaseMilestoneDirect = useCallback(
    async (milestone: number) => {
      if (!invoiceAddress) return

      try {
        setReleasing(true)
        const data = await simulateContract(config, {
          address: invoiceAddress,
          abi: RELEASE_FUNCTION_ABI,
          functionName: 'release',
          args: [milestone],
        })

        const txHash = await writeContract(config, data.request)
        await waitForTransactionReceipt(config, {
          hash: txHash,
          chainId: invoiceChain.id,
        })
      } catch (error) {
        console.error('Error releasing milestone:', error)
      } finally {
        setReleasing(false)
      }
    },
    [config, invoiceChain.id, invoiceAddress]
  )

  const isLoading = !invoiceData && (isLoadingInvoice || isLoadingMilestone)

  return (
    <>
      {isLoading && <Spinner size="md" />}

      {!isLoading && !!invoiceData?.milestones && (
        <Accordion
          items={invoiceData?.milestones?.map(
            (milestone: MilestoneMetadata, index: number) => {
              const isReleased = currentMilestone > index
              const isNext = currentMilestone === index
              return {
                title: <Text>{`${index + 1}. ${milestone.title}`}</Text>,
                description: (
                  <Stack gap="x5">
                    <Stack direction="row" align="center" justify="space-between">
                      <Text variant="label-xs" color="tertiary">
                        {`Amount: ${milestoneAmounts?.[index]} ETH`}
                      </Text>
                      <Text variant="label-xs" color="tertiary">
                        {`Due by: ${new Date(
                          (milestone?.endDate as number) * 1000
                        ).toLocaleDateString()}`}
                      </Text>
                    </Stack>

                    <Text>{milestone.description || 'No Description'}</Text>

                    <Stack>
                      {milestone.documents?.map((doc) => {
                        if (!doc.src) return null

                        const href =
                          doc.type === 'ipfs' ? getFetchableUrls(doc.src)?.[0] : doc.src

                        if (!href) return null

                        return (
                          <Link key={doc.src} href={href}>
                            {href}
                          </Link>
                        )
                      })}
                    </Stack>

                    {!!invoiceAddress &&
                      (() => {
                        if (isReleased) {
                          return (
                            <Button variant="secondary" disabled>
                              <Icon id="checkInCircle" />
                              Milestone Released
                            </Button>
                          )
                        }

                        if (isClientConnected || isClientTreasury) {
                          return (
                            <Stack direction="column" gap="x1">
                              <Text variant="label-xs" color="tertiary">
                                {isNext
                                  ? 'Release funds for the next milestone'
                                  : `Release funds for all milestones up to Milestone ${index + 1}`}
                              </Text>
                              <Button
                                variant="primary"
                                onClick={() =>
                                  isClientConnected
                                    ? handleReleaseMilestoneDirect(index)
                                    : handleReleaseMilestoneAsProposal(index)
                                }
                                disabled={isClientConnected ? releasing : !hasThreshold}
                              >
                                {releasing ? 'Releasing...' : 'Release Milestone'}
                              </Button>
                              {!hasThreshold && !isClientConnected && (
                                <Text variant="label-xs" color="negative">
                                  You do not have enough votes to create a proposal
                                </Text>
                              )}
                            </Stack>
                          )
                        }

                        return null
                      })()}
                  </Stack>
                ),
              }
            }
          )}
        />
      )}
      {!!clientAddress && !isClientTreasury && (
        <Stack direction="row" align="center">
          <Text variant="label-sm" color="primary" mr="x2">
            Escrow Release Delegated to
          </Text>
          <Box color={'secondary'} className={atoms({ textDecoration: 'underline' })}>
            <a
              href={
                isClientAGnosisSafe
                  ? createSafeUrl(invoiceChain.id, clientAddress)
                  : `${ETHERSCAN_BASE_URL[invoiceChain.id]}/address/${clientAddress}`
              }
              rel="noreferrer"
              target="_blank"
            >
              <Text variant="label-sm">{clientDisplayName}</Text>
            </a>
          </Box>
        </Stack>
      )}
      {!!invoiceUrl && !!clientAddress && (
        <Stack direction="column" fontWeight={'heading'} mt="x2" ml="x4" gap="x2">
          {isClientTreasury ? (
            <a href={invoiceUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm">
                View Smart Invoice
                <Icon id="arrowTopRight" />
              </Button>
            </a>
          ) : (
            <>
              {isClientAGnosisSafe ? (
                <>
                  <a
                    href={createSafeAppUrl(invoiceChain.id, clientAddress, invoiceUrl)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Button variant="secondary" size="sm">
                      View Smart Invoice As Safe App
                      <Icon id="arrowTopRight" />
                    </Button>
                  </a>
                  {!isClientConnected && (
                    <a
                      href={createSafeAppUrl(
                        invoiceChain.id,
                        clientAddress,
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
                  )}
                </>
              ) : (
                <a href={invoiceUrl} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="sm">
                    View Smart Invoice
                    <Icon id="arrowTopRight" />
                  </Button>
                </a>
              )}
            </>
          )}
        </Stack>
      )}
    </>
  )
}
