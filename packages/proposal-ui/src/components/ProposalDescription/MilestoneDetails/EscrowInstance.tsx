import { BASE_URL } from '@buildeross/constants/baseUrl'
import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { type EscrowInstanceData } from '@buildeross/hooks/useInvoiceData'
import { useIsGnosisSafe } from '@buildeross/hooks/useIsGnosisSafe'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { AddressType, CHAIN_ID, TransactionType } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { createSafeAppUrl, createSafeUrl } from '@buildeross/utils/safe'
import { atoms, Box, Button, Icon, Spinner, Stack, Text } from '@buildeross/zord'
import { useCallback, useMemo, useState } from 'react'
import { encodeFunctionData, Hex } from 'viem'
import { useAccount, useConfig, useReadContract } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { MilestoneItem } from './MilestoneItem'

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

interface EscrowInstanceProps {
  escrow: EscrowInstanceData
  escrowIndex: number
  totalEscrows: number
  onOpenProposalReview: () => Promise<void>
  hasThreshold: boolean
  proposalId: string
}

export const EscrowInstance = ({
  escrow,
  escrowIndex,
  totalEscrows,
  onOpenProposalReview,
  hasThreshold,
  proposalId,
}: EscrowInstanceProps) => {
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const { addTransaction } = useProposalStore()
  const { address } = useAccount()
  const config = useConfig()
  const { getProposalLink } = useLinks()

  const { invoiceAddress, clientAddress, tokenAddress, milestoneAmounts, invoiceData } =
    escrow

  const { tokenMetadata } = useTokenMetadataSingle(chain.id, tokenAddress)

  const invoiceUrl = !!invoiceAddress
    ? createSmartInvoiceUrl(chain.id, invoiceAddress)
    : undefined

  const proposalUrl = useMemo(() => {
    if (!addresses.token || !proposalId) return ''
    const proposalLink = getProposalLink(chain.id, addresses.token, proposalId)
    // Add BASE_URL if the href is a relative path
    return proposalLink.href.startsWith('http')
      ? proposalLink.href
      : `${BASE_URL}${proposalLink.href}`
  }, [chain.id, addresses.token, proposalId])

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
      !!clientAddress &&
      !!addresses.treasury &&
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

  const isLoading = !invoiceData && isLoadingMilestone

  return (
    <>
      {totalEscrows > 1 && (
        <Box mb="x4">
          <Text variant="heading-sm">Escrow #{escrowIndex + 1}</Text>
        </Box>
      )}

      {isLoading && <Spinner size="md" />}

      {!isLoading && !!invoiceData?.milestones && (
        <Stack>
          {invoiceData.milestones.map((milestone, index) => (
            <MilestoneItem
              key={index}
              milestone={milestone}
              index={index}
              invoiceAddress={invoiceAddress}
              currentMilestone={currentMilestone}
              milestoneAmounts={milestoneAmounts}
              tokenMetadata={tokenMetadata}
              isClientConnected={isClientConnected}
              isClientTreasury={isClientTreasury}
              hasThreshold={hasThreshold}
              isReleasing={isReleasing}
              handleReleaseMilestoneDirect={handleReleaseMilestoneDirect}
              handleReleaseMilestoneAsProposal={handleReleaseMilestoneAsProposal}
            />
          ))}
        </Stack>
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
                      href={createSafeAppUrl(chain.id, clientAddress, proposalUrl)}
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
