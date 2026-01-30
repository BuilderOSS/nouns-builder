import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { SAFE_APP_URL, SAFE_HOME_URL } from '@buildeross/constants/safe'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { useInvoiceData } from '@buildeross/hooks/useInvoiceData'
import { useIsGnosisSafe } from '@buildeross/hooks/useIsGnosisSafe'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { useVotes } from '@buildeross/hooks/useVotes'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { AddressType, CHAIN_ID, TransactionType } from '@buildeross/types'
import { Accordion } from '@buildeross/ui/Accordion'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { atoms, Box, Button, Icon, Spinner, Stack, Text } from '@buildeross/zord'
import { Milestone as MilestoneMetadata } from '@smartinvoicexyz/types'
import { useCallback, useMemo, useState } from 'react'
import { encodeFunctionData, formatUnits, Hex } from 'viem'
import { useAccount, useConfig, useReadContract } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

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
  proposal: Proposal
  onOpenProposalReview: () => Promise<void>
}

export const MilestoneDetails = ({
  proposal,
  onOpenProposalReview,
}: MilestoneDetailsProps) => {
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const { addTransaction } = useProposalStore()
  const { address } = useAccount()
  const config = useConfig()

  const { hasThreshold } = useVotes({
    chainId: chain.id,
    governorAddress: addresses.governor,
    signerAddress: address,
    collectionAddress: addresses.token,
  })

  const {
    invoiceAddress,
    clientAddress,
    tokenAddress,
    milestoneAmounts,
    invoiceData,
    isLoadingInvoice,
  } = useInvoiceData(chain.id, proposal)

  const { tokenMetadata } = useTokenMetadataSingle(chain.id, tokenAddress)

  const invoiceUrl = !!invoiceAddress
    ? createSmartInvoiceUrl(chain.id, invoiceAddress)
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
    chainId: chain.id,
  })

  const { isGnosisSafe: isClientAGnosisSafe } = useIsGnosisSafe(clientAddress, chain.id)

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

      addTransaction(releaseEscrowTxnData)
      onOpenProposalReview()
    },
    [
      onOpenProposalReview,
      addTransaction,
      invoiceData?.title,
      invoiceAddress,
      currentMilestone,
    ]
  )

  const [isReleasing, setIsReleasing] = useState(false)

  const handleReleaseMilestoneDirect = useCallback(
    async (milestone: number) => {
      if (!invoiceAddress) return

      try {
        setIsReleasing(true)
        const data = await simulateContract(config, {
          address: invoiceAddress,
          abi: RELEASE_FUNCTION_ABI,
          functionName: 'release',
          args: [milestone],
        })

        const txHash = await writeContract(config, data.request)
        await waitForTransactionReceipt(config, {
          hash: txHash,
          chainId: chain.id,
        })
      } catch (error) {
        console.error('Error releasing milestone:', error)
      } finally {
        setIsReleasing(false)
      }
    },
    [config, chain.id, invoiceAddress]
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
              const amount = milestoneAmounts?.[index] ?? 0n
              const decimals = tokenMetadata?.decimals ?? 18
              const amountDisplay = tokenMetadata?.symbol
                ? `${formatUnits(amount, decimals)} ${tokenMetadata.symbol}`
                : amount.toString()
              return {
                title: <Text>{`${index + 1}. ${milestone.title}`}</Text>,
                description: (
                  <Stack gap="x5">
                    <Stack direction="row" align="center" justify="space-between">
                      <Text variant="label-xs" color="tertiary">
                        {`Amount: ${amountDisplay}`}
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
                          <a
                            key={doc.src}
                            href={href}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            {doc.src}
                          </a>
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
                              <ContractButton
                                chainId={chain.id}
                                variant="primary"
                                handleClick={() =>
                                  isClientConnected
                                    ? handleReleaseMilestoneDirect(index)
                                    : handleReleaseMilestoneAsProposal(index)
                                }
                                disabled={isClientConnected ? isReleasing : !hasThreshold}
                                loading={isReleasing}
                              >
                                Release Milestone
                              </ContractButton>
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
                  ? createSafeUrl(chain.id, clientAddress)
                  : `${ETHERSCAN_BASE_URL[chain.id]}/address/${clientAddress}`
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
                    href={createSafeAppUrl(chain.id, clientAddress, invoiceUrl)}
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
                        chain.id,
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
