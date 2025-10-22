import { SWR_KEYS } from '@buildeross/constants'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import {
  decodeEscrowData,
  decodeEscrowDataV1,
  fetchFromURI,
  getEscrowBundlerV1,
  getProvider,
} from '@buildeross/utils'
import { type InvoiceMetadata } from '@smartinvoicexyz/types'
import _ from 'lodash'
import { useMemo } from 'react'
import useSWR from 'swr'
import { decodeEventLog, Hex, isHex } from 'viem'

import { DecodedTransaction } from './useDecodedTransactions'

type InvoiceData = {
  invoiceAddress: Hex | undefined
  clientAddress: Hex | undefined
  tokenAddress: Hex | undefined
  milestoneAmounts: bigint[] | undefined
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
  const { invoiceCid, clientAddress, milestoneAmounts, tokenAddress } = useMemo(() => {
    if (!decodedTransaction || decodedTransaction.isNotDecoded) return {}

    const isEscrowV1 =
      _.toLower(decodedTransaction.target) === _.toLower(getEscrowBundlerV1(chainId))

    const decodedTxnArgs = decodedTransaction.transaction?.args

    const { ipfsCid, clientAddress, tokenAddress } = isEscrowV1
      ? decodeEscrowDataV1(decodedTxnArgs?._escrowData?.value as Hex)
      : decodeEscrowData(decodedTxnArgs?._escrowData?.value as Hex)

    return {
      invoiceCid: ipfsCid,
      clientAddress: clientAddress as AddressType,
      tokenAddress: tokenAddress as AddressType,
      milestoneAmounts: decodedTxnArgs['_milestoneAmounts']['value']
        .toString()
        .split(',')
        .map((x: string) => BigInt(x)),
    }
  }, [decodedTransaction, chainId])

  const { data: invoiceAddress, isValidating: isLoadingInvoiceAddress } = useSWR(
    executionTransactionHash && isHex(executionTransactionHash)
      ? ([SWR_KEYS.INVOICE_LOG_NEW_INVOICE, chainId, executionTransactionHash] as const)
      : null,
    async ([, _chainId, _txHash]) => {
      const provider = getProvider(_chainId)
      const { logs } = await provider.getTransactionReceipt({
        hash: _txHash,
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
    invoiceCid ? ([SWR_KEYS.ESCROW_MILESTONES_IPFS_DATA, invoiceCid] as const) : null,
    async ([, _invoiceCid]) => {
      try {
        const text = await fetchFromURI(`ipfs://${_invoiceCid}`)
        return JSON.parse(text) as InvoiceMetadata
      } catch (error) {
        console.error('Failed to fetch invoice data:', error)
        return undefined
      }
    }
  )

  return {
    invoiceAddress,
    tokenAddress,
    clientAddress,
    milestoneAmounts,
    invoiceData,
    isLoadingInvoice: isLoadingInvoiceAddress || isLoadingInvoiceData,
  }
}
