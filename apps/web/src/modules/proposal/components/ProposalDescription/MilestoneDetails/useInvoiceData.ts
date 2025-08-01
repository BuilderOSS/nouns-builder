import SWR_KEYS from '@buildeross/constants/swrKeys'
import { DecodedTransaction } from '@buildeross/hooks/useDecodedTransactions'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { fetchFromURI } from '@buildeross/utils/fetch'
import { getProvider } from '@buildeross/utils/provider'
import { InvoiceMetadata } from '@smartinvoicexyz/types'
import _ from 'lodash'
import { useMemo } from 'react'
import {
  decodeEscrowData,
  decodeEscrowDataV1,
  getEscrowBundlerV1,
} from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'
import useSWR from 'swr'
import { decodeEventLog, formatEther, Hex, isHex } from 'viem'

type InvoiceData = {
  invoiceAddress: Hex | undefined
  clientAddress: Hex | undefined
  milestoneAmounts: string[] | undefined
  invoiceData: InvoiceMetadata | undefined
  isLoadingInvoice: boolean
}

const LOG_NEW_INVOICE_EVENT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'invoice',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'invoiceType',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'version',
        type: 'uint256',
      },
    ],
    name: 'LogNewInvoice',
    type: 'event',
  },
]

export const useInvoiceData = (
  chainId: CHAIN_ID,
  decodedTransaction?: DecodedTransaction,
  executionTransactionHash?: string
): InvoiceData => {
  const { invoiceCid, clientAddress, milestoneAmounts } = useMemo(() => {
    if (!decodedTransaction || decodedTransaction.isNotDecoded) return {}

    const isEscrowV1 =
      _.toLower(decodedTransaction.target) === _.toLower(getEscrowBundlerV1(chainId))

    const decodedTxnArgs = decodedTransaction.transaction?.args

    const { ipfsCid, clientAddress } = isEscrowV1
      ? decodeEscrowDataV1(decodedTxnArgs?._escrowData?.value as Hex)
      : decodeEscrowData(decodedTxnArgs?._escrowData?.value as Hex)

    return {
      invoiceCid: ipfsCid,
      clientAddress: clientAddress as AddressType,
      milestoneAmounts: decodedTxnArgs['_milestoneAmounts']['value']
        .toString()
        .split(',')
        .map((x: string) => formatEther(BigInt(x))),
    }
  }, [decodedTransaction, chainId])

  const { data: invoiceAddress, isValidating: isLoadingInvoiceAddress } = useSWR(
    executionTransactionHash
      ? [SWR_KEYS.INVOICE_LOG_NEW_INVOICE, chainId, executionTransactionHash]
      : null,
    async () => {
      if (!executionTransactionHash || !isHex(executionTransactionHash)) return undefined

      const provider = getProvider(chainId)
      const { logs } = await provider.getTransactionReceipt({
        hash: executionTransactionHash as Hex,
      })

      const parsedLogs = logs.map((log) => {
        try {
          return decodeEventLog({
            abi: LOG_NEW_INVOICE_EVENT_ABI,
            data: log?.data,
            topics: log?.topics,
          })
        } catch {
          return null
        }
      })

      const parsedEvent = _.find(parsedLogs, { eventName: 'LogNewInvoice' })

      // find data by provided key
      return _.get(parsedEvent, `args.invoice`) as AddressType | undefined
    }
  )

  const { data: invoiceData, isValidating: isLoadingInvoiceData } = useSWR(
    invoiceCid ? [SWR_KEYS.ESCROW_MILESTONES_IPFS_DATA, invoiceCid] : null,
    async () => {
      if (!invoiceCid) return undefined
      try {
        const text = await fetchFromURI(`ipfs://${invoiceCid}`)
        return JSON.parse(text) as InvoiceMetadata
      } catch (error) {
        console.error('Failed to fetch invoice data:', error)
        return undefined
      }
    }
  )

  return {
    invoiceAddress,
    clientAddress,
    milestoneAmounts,
    invoiceData,
    isLoadingInvoice: isLoadingInvoiceAddress || isLoadingInvoiceData,
  }
}
