import { CHAIN_ID } from '@buildeross/types'
import { getAddress, Hex, isAddress } from 'viem'

import { SDK } from '../client'
import { isChainIdSupportedByEAS } from '../helpers'

const SMART_INVOICE_MULTISIG = `0xD609883e5eb442d364Aa57369224bE839A38C6f9`
const BUILDER_DAO_TREASURY = `0xcf325a4c78912216249b818521b0798a0f904c10`
const BUILDER_DAO_OPS_MULTISIG = `0x58eAEfBEd9EEFbC564E302D0AfAE0B113E42eAb3`

export async function getEscrowDelegate(
  tokenAddress: string,
  treasuryAddress: string,
  chainId: CHAIN_ID
): Promise<Hex | null> {
  // Input validation
  if (!isAddress(tokenAddress)) {
    console.error('Invalid DAO token address')
    return null
  }

  if (!isChainIdSupportedByEAS(chainId)) {
    console.error('Chain ID not supported by EAS')
    return null
  }

  try {
    const updateIssuerPriorityOrder =
      treasuryAddress.toLowerCase() === BUILDER_DAO_TREASURY.toLowerCase()
        ? [
            getAddress(BUILDER_DAO_TREASURY),
            getAddress(BUILDER_DAO_OPS_MULTISIG),
            getAddress(SMART_INVOICE_MULTISIG),
          ]
        : [
            getAddress(treasuryAddress),
            getAddress(BUILDER_DAO_TREASURY),
            getAddress(BUILDER_DAO_OPS_MULTISIG),
            getAddress(SMART_INVOICE_MULTISIG),
          ]

    const variables = {
      daoId: tokenAddress.toLowerCase(),
      creators: updateIssuerPriorityOrder.map((address) => address.toLowerCase()),
      first: 1000,
      skip: 0,
    }

    const { daoMultisigUpdates: updates } =
      await SDK.connect(chainId).daoMultisigs(variables)

    if (!updates || updates.length === 0) {
      return null
    }

    const sortedUpdates = updates.sort((a, b) => {
      const idxA = updateIssuerPriorityOrder.indexOf(getAddress(a.creator))
      const idxB = updateIssuerPriorityOrder.indexOf(getAddress(b.creator))
      const indexA = idxA === -1 ? Number.POSITIVE_INFINITY : idxA
      const indexB = idxB === -1 ? Number.POSITIVE_INFINITY : idxB

      // First sort by priority order
      if (indexA !== indexB) {
        return indexA - indexB
      }

      // If same priority, sort by timeCreated, latest first
      return Number(b.timestamp) - Number(a.timestamp)
    })

    try {
      // Get the first update from priority
      return getAddress(sortedUpdates[0].daoMultisig)
    } catch (parseError) {
      console.error('Error parsing update data:', parseError)
      return null
    }
  } catch (error) {
    console.error('Error fetching updates:', error)
    return null
  }
}
