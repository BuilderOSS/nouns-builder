import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { uploadJson } from '@buildeross/ipfs-service/upload'
import { erc20Abi } from '@buildeross/sdk/contract'
import { getProposals, ProposalsResponse } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { CHAIN_ID, TransactionType } from '@buildeross/types'
import { getEnsAddress } from '@buildeross/utils/ens'
import {
  deployEscrowAbi,
  ESCROW_TYPE,
  getEscrowBundler,
  NATIVE_TOKEN_ADDRESS,
} from '@buildeross/utils/escrow'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Stack } from '@buildeross/zord'
import { InvoiceMetadata, Milestone as MilestoneMetadata } from '@smartinvoicexyz/types'
import { FormikHelpers } from 'formik'
import { useCallback, useState } from 'react'
import useSWR from 'swr'
import { Address, encodeFunctionData, formatUnits, isAddress, parseUnits } from 'viem'

import { MilestonePaymentsFormValues } from './MilestonePayments.schema'
import MilestonePaymentsForm from './MilestonePaymentsForm'
import { encodeEscrowData } from './MilestonePaymentsUtils'

const LIMIT = 20
const PAGE = 1

export const MilestonePayments: React.FC = () => {
  const resetTransactionType = useProposalStore((state) => state.resetTransactionType)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ipfsUploadError, setIpfsUploadError] = useState<Error | null>(null)

  const chain = useChainStore((state) => state.chain)

  const addTransaction = useProposalStore((state) => state.addTransaction)

  const { addresses } = useDaoStore()

  const { data } = useSWR<ProposalsResponse>(
    addresses.token
      ? ([SWR_KEYS.PROPOSALS, chain.id, addresses.token, LIMIT, PAGE] as const)
      : null,
    ([, _chainId, _token, _limit, _page]: [string, CHAIN_ID, string, number, number]) =>
      getProposals(_chainId, _token, _limit, _page)
  )

  const lastProposalId = data?.proposals?.[0]?.proposalNumber ?? 0

  const handleEscrowTransaction = useCallback(
    async (
      values: MilestonePaymentsFormValues,
      actions: FormikHelpers<MilestonePaymentsFormValues>
    ) => {
      if (!addresses.treasury || !values.tokenAddress || !values.tokenMetadata) {
        return
      }

      setIsSubmitting(true)
      setIpfsUploadError(null)

      // Determine if this is ETH or ERC20
      const isEthEscrow =
        values.tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()

      // Use token metadata for decimals and symbol
      const tokenDecimals = values.tokenMetadata.decimals
      const tokenSymbol = values.tokenMetadata.symbol

      const newProposalId = lastProposalId + 1
      const escrowTitle = `Proposal #${newProposalId}`
      const escrowDescription = `${window?.location.href.replace(
        '/proposal/create',
        '/vote/' + newProposalId
      )}`

      const ipfsDataToUpload: InvoiceMetadata = {
        title: escrowTitle,
        description: escrowDescription,
        endDate: Math.floor(
          new Date(values.milestones[values.milestones.length - 1].endDate).getTime() /
            1000
        ),
        milestones: values.milestones.map(
          (x, index) =>
            ({
              id: 'milestone-00' + index,
              title: x.title,
              description: x.description,
              endDate: Math.floor(new Date(x.endDate).getTime() / 1000), // seconds
              createdAt: Math.floor(Date.now() / 1000), // seconds
              // set start date 7 days from submission in seconds
              startDate:
                index === 0
                  ? Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
                  : Math.floor(
                      new Date(values.milestones[index - 1].endDate).getTime() / 1000
                    ),
              resolverType: 'kleros',
              klerosCourt: 1,
              ...(x.mediaType && x.mediaUrl
                ? {
                    documents: [
                      {
                        id: 'doc-001',
                        type: 'ipfs',
                        src: x.mediaUrl,
                        mimeType: x.mediaType,
                        createdAt: Math.floor(new Date().getTime() / 1000),
                      },
                    ],
                  }
                : {}),
            }) as MilestoneMetadata
        ),
      }

      let cid: string, uri: string

      try {
        // eslint-disable-next-line no-console
        console.debug('Uploading to IPFS...')
        const response = await uploadJson(ipfsDataToUpload)
        cid = response.cid
        uri = response.uri
        // eslint-disable-next-line no-console
        console.debug('IPFS upload successful. CID:', cid, 'URI:', uri)
      } catch (err: any) {
        console.error('IPFS upload error:', err)
        setIsSubmitting(false)
        setIpfsUploadError(
          new Error(
            `Sorry, there was an error with our file uploading service. ${err?.message}`
          )
        )
        return
      }

      const clientAddress = await getEnsAddress(values.clientAddress)
      const recipientAddress = await getEnsAddress(values.recipientAddress)

      // Validate that the resolved values are actually valid addresses
      if (!clientAddress || !isAddress(clientAddress, { strict: false })) {
        console.error('Failed to resolve valid client address')
        setIsSubmitting(false)
        return
      }
      if (!recipientAddress || !isAddress(recipientAddress, { strict: false })) {
        console.error('Failed to resolve valid recipient address')
        setIsSubmitting(false)
        return
      }

      values.clientAddress = clientAddress
      values.recipientAddress = recipientAddress

      // create bundler transaction data
      const escrowData = encodeEscrowData(values, addresses.treasury, cid, chain.id)
      const milestoneAmounts = values.milestones.map((x) =>
        parseUnits(x.amount.toString(), tokenDecimals)
      )
      const fundAmount = milestoneAmounts.reduce((acc, x) => acc + x, 0n)

      const totalAmount = formatUnits(fundAmount, tokenDecimals)
      const formattedAmount = formatCryptoVal(totalAmount)

      const escrowBundlerAddress = getEscrowBundler(chain.id)

      const deployEscrowTransaction = {
        target: escrowBundlerAddress as Address,
        functionSignature: 'deployEscrow(address,uint256[],bytes,bytes32,uint256)',
        calldata: encodeFunctionData({
          abi: deployEscrowAbi,
          functionName: 'deployEscrow',
          args: [
            values.recipientAddress as Address,
            milestoneAmounts,
            escrowData,
            ESCROW_TYPE,
            fundAmount,
          ],
        }),
        value: isEthEscrow ? fundAmount.toString() : '0', // ETH value for native ETH, 0 for ERC20
      }

      const transactions = []

      // For ERC20 tokens, add approval transaction first
      if (!isEthEscrow) {
        // Approve 0 first to avoid issues with tokens such as USDT that require approved amount to be 0 before calling approve
        const approveZeroTransaction = {
          target: values.tokenAddress as Address,
          functionSignature: 'approve(address,uint256)',
          calldata: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [escrowBundlerAddress, 0n],
          }),
          value: '0',
        }
        transactions.push(approveZeroTransaction)

        const approveTransaction = {
          target: values.tokenAddress as Address,
          functionSignature: 'approve(address,uint256)',
          calldata: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [escrowBundlerAddress, fundAmount],
          }),
          value: '0',
        }
        transactions.push(approveTransaction)
      }

      // Add the deploy escrow transaction
      transactions.push(deployEscrowTransaction)

      try {
        addTransaction({
          type: TransactionType.MILESTONE_PAYMENTS,
          summary: `Create and fund new Escrow with ${formattedAmount} ${tokenSymbol}`,
          transactions,
        })
        actions.resetForm()
        resetTransactionType()
      } catch (err) {
        console.error('Error Adding Transaction', err)
      } finally {
        setIsSubmitting(false)
      }
    },
    [addTransaction, chain.id, lastProposalId, addresses.treasury, resetTransactionType]
  )

  return (
    <Stack>
      <MilestonePaymentsForm
        onSubmit={handleEscrowTransaction}
        isSubmitting={isSubmitting}
      />
      {ipfsUploadError?.message && <div>Error: {ipfsUploadError.message}</div>}
    </Stack>
  )
}
