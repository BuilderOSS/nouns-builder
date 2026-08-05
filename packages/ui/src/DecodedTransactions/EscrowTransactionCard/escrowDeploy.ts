import type { CHAIN_ID } from '@buildeross/types'
import {
  type DecodedEscrowData,
  decodeEscrowData,
  decodeEscrowDataLegacy,
  deployEscrowAbi,
  deployEscrowAbiLegacy,
  getEscrowBundler,
  getEscrowBundlerLegacy,
} from '@buildeross/utils/escrow'
import { decodeFunctionData, type Hex } from 'viem'

export type EscrowVersion = 'v2' | 'legacy'

export interface ParsedEscrowDeploy {
  version: EscrowVersion
  /** The provider (service side) — present on v2 deploys only. */
  provider?: string
  /** Per-milestone amounts, in the escrow token's smallest unit. */
  milestoneAmounts: bigint[]
  /** Sum of all milestone amounts. */
  totalAmount: bigint
  /** The escrow's initial funding amount (`_fundAmount`). */
  fundAmount: bigint
  /** Decoded escrow parties/config (client, resolver, token, recipients, dates…). */
  escrow: DecodedEscrowData
}

const eq = (a?: string, b?: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase()

/**
 * Returns the escrow version if `target` is a known Smart Invoice escrow bundler
 * for the chain, else null. The generic ABI-fetch decoder doesn't recognise these
 * bundlers (they render as "Raw only"), so we match them by their known address.
 */
export const matchEscrowBundler = (
  chainId: CHAIN_ID,
  target?: string
): EscrowVersion | null => {
  if (!target) return null
  try {
    if (eq(getEscrowBundler(chainId), target)) return 'v2'
  } catch {}
  try {
    if (eq(getEscrowBundlerLegacy(chainId), target)) return 'legacy'
  } catch {}
  return null
}

/**
 * Decode a `deployEscrow` calldata targeting a known bundler into a structured
 * escrow summary (milestones + total + parties). Pure and deterministic — the
 * whole rich view is driven off this. Returns null if `target` isn't a known
 * bundler or the calldata can't be decoded.
 */
export const parseEscrowDeploy = (
  chainId: CHAIN_ID,
  target: string,
  calldata: string
): ParsedEscrowDeploy | null => {
  const version = matchEscrowBundler(chainId, target)
  if (!version) return null

  try {
    if (version === 'v2') {
      const { args } = decodeFunctionData({
        abi: deployEscrowAbi,
        data: calldata as Hex,
      })
      const [provider, milestoneAmounts, escrowData, , fundAmount] = args as unknown as [
        string,
        readonly bigint[],
        Hex,
        Hex,
        bigint,
      ]
      const milestones = [...milestoneAmounts]
      return {
        version,
        provider,
        milestoneAmounts: milestones,
        totalAmount: milestones.reduce((sum, a) => sum + a, 0n),
        fundAmount,
        escrow: decodeEscrowData(escrowData),
      }
    }

    const { args } = decodeFunctionData({
      abi: deployEscrowAbiLegacy,
      data: calldata as Hex,
    })
    const [milestoneAmounts, escrowData, fundAmount] = args as unknown as [
      readonly bigint[],
      Hex,
      bigint,
    ]
    const milestones = [...milestoneAmounts]
    return {
      version,
      milestoneAmounts: milestones,
      totalAmount: milestones.reduce((sum, a) => sum + a, 0n),
      fundAmount,
      escrow: decodeEscrowDataLegacy(escrowData),
    }
  } catch {
    return null
  }
}
