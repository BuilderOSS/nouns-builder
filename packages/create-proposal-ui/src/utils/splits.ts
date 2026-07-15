import { isAddress } from 'viem'

/**
 * 0xSplits (v1) helpers — recipient/config types, validation, and SDK config
 * prep. Ported from the production Gnars website pattern (r4topunk/gnars-website)
 * so a droposal's funds recipient can be a multi-recipient split.
 */

export interface SplitRecipient {
  address: string
  /** 0–100 with up to 4 decimals. */
  percentAllocation: number
}

export interface SplitConfig {
  recipients: SplitRecipient[]
  /** 0–10 with up to 4 decimals. Usually 0. */
  distributorFeePercent: number
  /** Controller address; `0x0` = immutable split. */
  controller?: string
}

export interface SplitValidationError {
  field: string
  message: string
}

/** Controller sentinel for immutable (non-editable) splits. */
export const IMMUTABLE_CONTROLLER = '0x0000000000000000000000000000000000000000' as const

const MAX_RECIPIENTS = 500
const MAX_DECIMALS = 4
const PERCENT_EPSILON = 0.0001

const decimalPlaces = (n: number): number => (n.toString().split('.')[1] || '').length

/** Validate a split's recipient list. Returns an empty array when valid. */
export const validateSplitRecipients = (
  recipients: SplitRecipient[]
): SplitValidationError[] => {
  const errors: SplitValidationError[] = []

  if (recipients.length < 2) {
    errors.push({
      field: 'recipients',
      message: 'A split must have at least 2 recipients',
    })
    return errors
  }

  if (recipients.length > MAX_RECIPIENTS) {
    errors.push({
      field: 'recipients',
      message: `A split cannot have more than ${MAX_RECIPIENTS} recipients`,
    })
  }

  recipients.forEach((r, i) => {
    if (!r.address) {
      errors.push({
        field: `recipients[${i}].address`,
        message: `Recipient ${i + 1}: address is required`,
      })
    } else if (!isAddress(r.address, { strict: false })) {
      errors.push({
        field: `recipients[${i}].address`,
        message: `Recipient ${i + 1}: invalid address`,
      })
    }
    if (r.percentAllocation <= 0) {
      errors.push({
        field: `recipients[${i}].percentAllocation`,
        message: `Recipient ${i + 1}: percentage must be greater than 0`,
      })
    }
    if (r.percentAllocation > 100) {
      errors.push({
        field: `recipients[${i}].percentAllocation`,
        message: `Recipient ${i + 1}: percentage cannot exceed 100%`,
      })
    }
    if (decimalPlaces(r.percentAllocation) > MAX_DECIMALS) {
      errors.push({
        field: `recipients[${i}].percentAllocation`,
        message: `Recipient ${i + 1}: max ${MAX_DECIMALS} decimal places`,
      })
    }
  })

  const seen = new Set<string>()
  for (const r of recipients) {
    const key = r.address.toLowerCase()
    if (!key) continue
    if (seen.has(key)) {
      errors.push({
        field: 'recipients',
        message: 'Duplicate recipient addresses are not allowed',
      })
      break
    }
    seen.add(key)
  }

  const total = recipients.reduce((sum, r) => sum + r.percentAllocation, 0)
  if (Math.abs(total - 100) > PERCENT_EPSILON) {
    errors.push({
      field: 'recipients',
      message: `Allocations must total 100% (currently ${total.toFixed(4)}%)`,
    })
  }

  return errors
}

/** Shorten a split address for display. */
export const formatSplitAddress = (address: string): string =>
  !address || address.length < 10
    ? address
    : `${address.slice(0, 6)}...${address.slice(-4)}`

/** Convert a validated SplitConfig to the shape the 0xSplits SDK expects. */
export const prepareSplitConfigForSDK = (
  config: SplitConfig
): {
  recipients: Array<{ address: string; percentAllocation: number }>
  distributorFeePercent: number
  controller: string
} => ({
  recipients: config.recipients.map((r) => ({
    address: r.address,
    percentAllocation: r.percentAllocation,
  })),
  distributorFeePercent: config.distributorFeePercent,
  controller: config.controller || IMMUTABLE_CONTROLLER,
})
