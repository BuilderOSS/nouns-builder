import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import type { Proposal } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import {
  decodeEscrowData,
  decodeEscrowDataLegacy,
  deployEscrowAbi,
  deployEscrowAbiLegacy,
  getEscrowBundler,
  getEscrowBundlerLegacy,
} from '@buildeross/utils/escrow'
import { fetchFromURI } from '@buildeross/utils/fetch'
import { getProvider } from '@buildeross/utils/provider'
import { type InvoiceMetadata } from '@smartinvoicexyz/types'
import get from 'lodash/get'
import toLower from 'lodash/toLower'
import { useMemo } from 'react'
import useSWR from 'swr'
import { decodeEventLog, decodeFunctionData, Hex, isHex } from 'viem'

export type EscrowInstanceData = {
  invoiceAddress: Hex | undefined
  clientAddress: AddressType | undefined
  tokenAddress: AddressType | undefined
  milestoneAmounts: bigint[] | undefined
  invoiceData: InvoiceMetadata | undefined
}

export type InvoiceData = {
  isDeployTx: boolean
  escrows: EscrowInstanceData[]
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
  // Find all escrow transaction indices in proposal
  const escrowTransactionIndices = useMemo(() => {
    if (!proposal.targets) return []

    const escrowBundler = getEscrowBundler(chainId)
    const escrowBundlerLegacy = getEscrowBundlerLegacy(chainId)

    const indices: number[] = []
    proposal.targets.forEach((target, index) => {
      if (
        toLower(target) === toLower(escrowBundler) ||
        toLower(target) === toLower(escrowBundlerLegacy)
      ) {
        indices.push(index)
      }
    })

    return indices
  }, [proposal.targets, chainId])

  // Extract invoice data from all escrow calldatas
  const escrowsStaticData = useMemo(() => {
    if (escrowTransactionIndices.length === 0 || !proposal.calldatas || !proposal.targets)
      return []

    return escrowTransactionIndices
      .map((index) => {
        const calldata = proposal.calldatas?.[index]
        const target = proposal.targets?.[index]

        if (!calldata || !target) return null

        // Determine if it's legacy escrow based on target address
        const isEscrowLegacy =
          toLower(target) === toLower(getEscrowBundlerLegacy(chainId))

        // Use the appropriate ABI and decoder based on contract version
        const abi = isEscrowLegacy ? deployEscrowAbiLegacy : deployEscrowAbi
        const decodeEscrowFn = isEscrowLegacy ? decodeEscrowDataLegacy : decodeEscrowData

        try {
          const decoded = decodeFunctionData({
            abi,
            data: calldata as Hex,
          })

          if (decoded.functionName !== 'deployEscrow' || !decoded.args) return null

          // Extract parameters based on ABI structure
          let milestoneAmounts: bigint[]
          let escrowData: Hex

          if (isEscrowLegacy) {
            // Legacy ABI: deployEscrow(_milestoneAmounts, _escrowData, _fundAmount)
            ;[milestoneAmounts, escrowData] = decoded.args as readonly [bigint[], Hex]
          } else {
            // Modern ABI: deployEscrow(_provider, _milestoneAmounts, _escrowData, _escrowType, _fundAmount)
            ;[, milestoneAmounts, escrowData] = decoded.args as readonly [
              Hex,
              bigint[],
              Hex,
            ]
          }

          // Decode the escrow data with the appropriate decoder
          const { ipfsCid, clientAddress, tokenAddress } = decodeEscrowFn(escrowData)

          return {
            invoiceCid: ipfsCid,
            clientAddress: clientAddress as AddressType,
            tokenAddress: tokenAddress as AddressType,
            milestoneAmounts: milestoneAmounts.map((x) => BigInt(x)),
          }
        } catch (error) {
          console.error('Failed to decode escrow calldata:', error)
          return null
        }
      })
      .filter((data): data is NonNullable<typeof data> => data !== null)
  }, [escrowTransactionIndices, proposal.calldatas, proposal.targets, chainId])

  // Fetch invoice addresses from execution transaction logs (if executed)
  const { data: invoiceAddresses, isValidating: isLoadingInvoiceAddresses } = useSWR(
    proposal.executionTransactionHash &&
      isHex(proposal.executionTransactionHash) &&
      escrowsStaticData.length > 0
      ? ([
          SWR_KEYS.INVOICE_LOG_NEW_INVOICE,
          chainId,
          proposal.executionTransactionHash,
          escrowsStaticData.length,
        ] as const)
      : null,
    async ([, _chainId, _txHash, _expectedCount]) => {
      const provider = getProvider(_chainId)
      const { logs } = await provider.getTransactionReceipt({
        hash: _txHash,
      })

      const parsedLogs = logs
        .map((log) => {
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
        .filter((log) => log !== null && log.eventName === 'LogNewInvoice')

      // Extract invoice addresses from events
      return parsedLogs
        .map((event) => get(event, `args.invoice`) as AddressType | undefined)
        .filter((address): address is AddressType => !!address)
        .slice(0, _expectedCount) // Limit to expected count
    }
  )

  // Fetch invoice metadata for all escrows
  // Deduplicate CIDs to avoid fetching the same data multiple times
  const invoiceCids = useMemo(
    () =>
      Array.from(
        new Set(
          escrowsStaticData
            .map((escrow) => escrow.invoiceCid)
            .filter((cid): cid is string => !!cid)
        )
      ),
    [escrowsStaticData]
  )

  const { data: invoiceDatas, isValidating: isLoadingInvoiceDatas } = useSWR(
    invoiceCids.length > 0
      ? ([SWR_KEYS.ESCROW_MILESTONES_IPFS_DATA, ...invoiceCids] as const)
      : null,
    async ([, ..._invoiceCids]) => {
      return Promise.all(
        _invoiceCids.map(async (cid) => {
          try {
            const text = await fetchFromURI(`ipfs://${cid}`)
            return JSON.parse(text) as InvoiceMetadata
          } catch (error) {
            console.error('Failed to fetch invoice data:', error)
            return undefined
          }
        })
      )
    }
  )

  // Build a Map from CID to fetched InvoiceMetadata for O(1) lookup
  const invoiceDataMap = useMemo(() => {
    if (!invoiceDatas) return new Map<string, InvoiceMetadata>()

    const map = new Map<string, InvoiceMetadata>()
    invoiceCids.forEach((cid, index) => {
      const data = invoiceDatas[index]
      if (data) {
        map.set(cid, data)
      }
    })
    return map
  }, [invoiceCids, invoiceDatas])

  // Combine static data with fetched data using Map lookup
  const escrows = useMemo(() => {
    return escrowsStaticData.map((staticData, index) => ({
      ...staticData,
      invoiceAddress: invoiceAddresses?.[index],
      invoiceData: staticData.invoiceCid
        ? invoiceDataMap.get(staticData.invoiceCid)
        : undefined,
    }))
  }, [escrowsStaticData, invoiceAddresses, invoiceDataMap])

  return {
    isDeployTx: escrowsStaticData.length > 0,
    escrows,
    isLoadingInvoice: isLoadingInvoiceAddresses || isLoadingInvoiceDatas,
  }
}
