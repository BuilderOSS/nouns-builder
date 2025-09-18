import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { uploadJson } from '@buildeross/ipfs-service'
import { erc20Abi } from '@buildeross/sdk/contract'
import { getProposals, ProposalsResponse } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { getEnsAddress } from '@buildeross/utils/ens'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Stack } from '@buildeross/zord'
import { InvoiceMetadata, Milestone as MilestoneMetadata } from '@smartinvoicexyz/types'
import { FormikHelpers } from 'formik'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { TransactionType } from 'src/modules/create-proposal/constants'
import { useProposalStore } from 'src/modules/create-proposal/stores'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import useSWR from 'swr'
import { Address, encodeFunctionData, formatUnits, parseUnits } from 'viem'

import EscrowForm from './EscrowForm'
import { EscrowFormValues, NULL_ADDRESS } from './EscrowForm.schema'
import {
  deployEscrowAbi,
  encodeEscrowData,
  ESCROW_TYPE,
  getEscrowBundler,
} from './EscrowUtils'

export const Escrow: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ipfsUploadError, setIpfsUploadError] = useState<Error | null>(null)

  const { query, isReady } = useRouter()

  const chain = useChainStore((state) => state.chain)

  const addTransaction = useProposalStore((state) => state.addTransaction)

  const {
    addresses: { treasury },
  } = useDaoStore()

  const { data } = useSWR<ProposalsResponse>(
    isReady ? [SWR_KEYS.PROPOSALS, chain.id, query.token, '0'] : null,
    ([_key, chainId, token, _page]) =>
      getProposals(chainId as CHAIN_ID, token as string, 1, Number(0))
  )

  const lastProposalId = data?.proposals?.[0]?.proposalNumber ?? 0

  const handleEscrowTransaction = useCallback(
    async (values: EscrowFormValues, actions: FormikHelpers<EscrowFormValues>) => {
      if (!treasury || !values.tokenAddress || !values.tokenMetadata) {
        return
      }

      // Determine if this is ETH or ERC20
      const isEthEscrow = values.tokenAddress.toLowerCase() === NULL_ADDRESS.toLowerCase()

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
        endDate: new Date(
          values.milestones[values.milestones.length - 1].endDate
        ).getTime(),
        milestones: values.milestones.map(
          (x, index) =>
            ({
              id: 'milestone-00' + index,
              title: x.title,
              description: x.description,
              endDate: new Date(x.endDate).getTime() / 1000, // in seconds
              createdAt: Date.now() / 1000, // in seconds
              // set start date 7 days from submission in seconds
              startDate:
                index === 0
                  ? Date.now() / 1000 + 7 * 24 * 60 * 60
                  : new Date(values.milestones[index - 1].endDate).getTime() / 1000,
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
                        createdAt: new Date().getTime() / 1000,
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
        setIsSubmitting(true)
        const response = await uploadJson(ipfsDataToUpload)
        cid = response.cid
        uri = response.uri
        setIsSubmitting(false)
        setIpfsUploadError(null)
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

      values.clientAddress = await getEnsAddress(values.clientAddress)
      values.recipientAddress = await getEnsAddress(values.recipientAddress)

      // create bundler transaction data
      const escrowData = encodeEscrowData(values, treasury, cid, chain.id)
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
          type: TransactionType.ESCROW,
          summary: `Create and fund new Escrow with ${formattedAmount} ${tokenSymbol}`,
          transactions,
        })
        actions.resetForm()
      } catch (err) {
        console.error('Error Adding Transaction', err)
      } finally {
        setIsSubmitting(false)
      }
    },
    [addTransaction, chain.id, lastProposalId, treasury]
  )

  return (
    <Stack>
      <EscrowForm onSubmit={handleEscrowTransaction} isSubmitting={isSubmitting} />
      {ipfsUploadError?.message && <div>Error: {ipfsUploadError.message}</div>}
    </Stack>
  )
}
