import { ESCROW_DELEGATE_SCHEMA_UID } from '@buildeross/constants/eas'
import { CHAIN_ID } from '@buildeross/types'
import { Hex, getAddress, isAddress } from 'viem'

import { SDK } from 'src/data/eas/client'
import {
  DecodedData,
  getDecodedValue,
  isChainIdSupportedByEAS,
} from 'src/data/eas/helpers'

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
    const attestationIssuerPriorityOrder = [
      getAddress(treasuryAddress),
      getAddress(BUILDER_DAO_TREASURY),
      getAddress(BUILDER_DAO_OPS_MULTISIG),
      getAddress(SMART_INVOICE_MULTISIG),
    ]

    const variables = {
      schemaId: ESCROW_DELEGATE_SCHEMA_UID,
      recipient: getAddress(tokenAddress),
      attesters: attestationIssuerPriorityOrder,
    }

    const { attestations } = await SDK.connect(chainId).escrowDelegates(variables)

    if (!attestations || attestations.length === 0) {
      return null
    }

    const sortedAttestations = attestations.sort((a, b) => {
      const indexA = attestationIssuerPriorityOrder.indexOf(getAddress(a.attester))
      const indexB = attestationIssuerPriorityOrder.indexOf(getAddress(b.attester))

      // First sort by priority order
      if (indexA !== indexB) {
        return indexA - indexB
      }

      // If same priority, sort by timeCreated, latest first
      return b.timeCreated - a.timeCreated
    })

    try {
      // Get the first attestation from priority
      const decodedData = JSON.parse(
        sortedAttestations[0].decodedDataJson
      ) as DecodedData[]

      const escrowDelegateAddress = getDecodedValue(decodedData, 'daoMultiSig') as Hex

      return getAddress(escrowDelegateAddress)
    } catch (parseError) {
      console.error('Error parsing attestation data:', parseError)
      return null
    }
  } catch (error) {
    console.error('Error fetching attestations:', error)
    return null
  }
}
