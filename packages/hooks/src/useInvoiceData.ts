import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import type { Proposal } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import {
  decodeEscrowData,
  decodeEscrowDataV1,
  deployEscrowAbi,
  getEscrowBundler,
  getEscrowBundlerV1,
} from '@buildeross/utils/escrow'
import { fetchFromURI } from '@buildeross/utils/fetch'
import { getProvider } from '@buildeross/utils/provider'
import { type InvoiceMetadata } from '@smartinvoicexyz/types'
import find from 'lodash/find'
import get from 'lodash/get'
import toLower from 'lodash/toLower'
import { useMemo } from 'react'
import useSWR from 'swr'
import { decodeEventLog, decodeFunctionData, Hex, isHex } from 'viem'

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

export const useInvoiceData = (chainId: CHAIN_ID, proposal: Proposal): InvoiceData => {
  // Find escrow transaction in proposal
  const escrowTransactionIndex = useMemo(() => {
    if (!proposal.targets) return -1

    const escrowBundler = getEscrowBundler(chainId)
    const escrowBundlerV1 = getEscrowBundlerV1(chainId)

    return proposal.targets.findIndex(
      (target) =>
        toLower(target) === toLower(escrowBundler) ||
        toLower(target) === toLower(escrowBundlerV1)
    )
  }, [proposal.targets, chainId])

  // Extract invoice data from calldata
  const { invoiceCid, clientAddress, milestoneAmounts, tokenAddress } = useMemo(() => {
    if (escrowTransactionIndex === -1 || !proposal.calldatas || !proposal.targets)
      return {}

    const calldata = proposal.calldatas[escrowTransactionIndex]
    const target = proposal.targets[escrowTransactionIndex]

    if (!calldata || !target) return {}

    try {
      // Decode the deployEscrow function call
      const decoded = decodeFunctionData({
        abi: deployEscrowAbi,
        data: calldata as Hex,
      })

      if (decoded.functionName !== 'deployEscrow' || !decoded.args) return {}

      const [, _milestoneAmounts, _escrowData] = decoded.args as readonly [
        unknown,
        bigint[],
        Hex,
      ]

      // Determine if it's V1 based on target address
      const isEscrowV1 = toLower(target) === toLower(getEscrowBundlerV1(chainId))

      // Decode the escrow data
      const { ipfsCid, clientAddress, tokenAddress } = isEscrowV1
        ? decodeEscrowDataV1(_escrowData as Hex)
        : decodeEscrowData(_escrowData as Hex)

      return {
        invoiceCid: ipfsCid,
        clientAddress: clientAddress as AddressType,
        tokenAddress: tokenAddress as AddressType,
        milestoneAmounts: (_milestoneAmounts as bigint[]).map((x) => BigInt(x)),
      }
    } catch (error) {
      console.error('Failed to decode escrow calldata:', error)
      return {}
    }
  }, [escrowTransactionIndex, proposal.calldatas, proposal.targets, chainId])

  const { data: invoiceAddress, isValidating: isLoadingInvoiceAddress } = useSWR(
    proposal.executionTransactionHash && isHex(proposal.executionTransactionHash)
      ? ([
          SWR_KEYS.INVOICE_LOG_NEW_INVOICE,
          chainId,
          proposal.executionTransactionHash,
        ] as const)
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

      const parsedEvent = find(parsedLogs, { eventName: 'LogNewInvoice' })

      // find data by provided key
      return get(parsedEvent, `args.invoice`) as AddressType | undefined
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
