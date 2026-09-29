import { easAbi } from '@buildeross/constants/eas'
import type { Hex, TransactionReceipt } from 'viem'
import { decodeEventLog } from 'viem'

/**
 * Extract attestation UIDs from the Attested events in a transaction receipt
 * @param receipt - The transaction receipt containing the logs
 * @param easAddress - The EAS contract address to filter logs by
 * @returns Array of attestation UIDs extracted from Attested events
 */
export function extractAttestationUIDs(
  receipt: TransactionReceipt,
  easAddress: Hex
): Hex[] {
  const attestedEvents = receipt.logs
    .filter((log) => log.address.toLowerCase() === easAddress.toLowerCase())
    .map((log) => {
      try {
        return decodeEventLog({
          abi: easAbi,
          data: log.data,
          topics: log.topics,
        })
      } catch {
        return null
      }
    })
    .filter((event) => event !== null && event.eventName === 'Attested')

  return attestedEvents.map((event) => (event as any).args.uid as Hex)
}

/**
 * Extract a single attestation UID from transaction receipt
 * @param receipt - The transaction receipt containing the logs
 * @param easAddress - The EAS contract address to filter logs by
 * @returns The attestation UID
 * @throws Error if no Attested event is found
 */
export function extractSingleAttestationUID(
  receipt: TransactionReceipt,
  easAddress: Hex
): Hex {
  const uids = extractAttestationUIDs(receipt, easAddress)

  if (uids.length === 0) {
    throw new Error('Attested event not found in transaction logs')
  }

  if (uids.length > 1) {
    throw new Error(
      `Expected 1 Attested event but found ${uids.length}. Use extractAttestationUIDs instead.`
    )
  }

  return uids[0]
}
