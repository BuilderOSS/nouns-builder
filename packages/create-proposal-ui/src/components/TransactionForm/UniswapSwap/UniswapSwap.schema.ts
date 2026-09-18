import type { AddressType } from '@buildeross/types'
import * as yup from 'yup'

import { TokenMetadataFormValidated, TokenMetadataSchema } from '../../shared'

export type SwapDirection = 'buy' | 'sell'
export type SlippageType = 'preset' | 'custom'
export type SlippagePreset = 5 | 10 | 15

export interface UniswapSwapFormValues {
  // Swap direction:
  // - buy = exactOut (specify output amount you want to receive)
  // - sell = exactIn (specify input amount you want to sell)
  swapDirection: SwapDirection

  // Input token (from treasury)
  inputTokenAddress?: AddressType
  inputTokenMetadata?: TokenMetadataFormValidated

  // Output token (manual address input)
  outputTokenAddress: string
  outputTokenMetadata?: TokenMetadataFormValidated

  // Amount to swap
  // - For 'buy' mode: this is the OUTPUT amount (how much you want to receive)
  // - For 'sell' mode: this is the INPUT amount (how much you want to sell)
  amountIn: string

  // Slippage tolerance
  slippageType: SlippageType
  slippagePreset?: SlippagePreset
  slippageCustom?: string

  // Deadline (duration from proposal execution)
  deadline: {
    days?: number
    hours?: number
    minutes?: number
    seconds?: number
  }
}

// Helper to normalize addresses for comparison
const normalizeAddr = (a?: string | null): string =>
  a ? String(a).trim().toLowerCase() : ''

const UniswapSwapSchema = () =>
  yup.object({
    swapDirection: yup
      .string()
      .oneOf(['buy', 'sell'] as SwapDirection[])
      .required('Swap direction is required.'),

    inputTokenAddress: yup
      .string()
      .optional()
      .test(
        'no-duplicate-token',
        'Input and output tokens cannot be the same',
        function (value) {
          const { outputTokenAddress } = this.parent
          if (!value || !outputTokenAddress) return true
          return normalizeAddr(value) !== normalizeAddr(outputTokenAddress)
        }
      ),

    inputTokenMetadata: TokenMetadataSchema.optional(),

    outputTokenAddress: yup
      .string()
      .required('Output token address is required.')
      .test(
        'no-duplicate-token',
        'Output and input tokens cannot be the same',
        function (value) {
          const { inputTokenAddress } = this.parent
          if (!value || !inputTokenAddress) return true
          return normalizeAddr(value) !== normalizeAddr(inputTokenAddress)
        }
      ),

    outputTokenMetadata: TokenMetadataSchema.optional(),

    amountIn: yup
      .string()
      .required('Amount is required.')
      .test(
        'is-valid-decimal',
        'Amount must be a valid decimal number (no scientific notation)',
        (value) => {
          if (!value) return false
          // Reject scientific notation, only allow standard decimal format
          const decimalRegex = /^(\d+\.?\d*|\.\d+)$/
          return decimalRegex.test(value)
        }
      )
      .test('is-greater-than-0', 'Amount must be greater than 0', (value) => {
        if (!value) return false
        const num = parseFloat(value)
        return !isNaN(num) && num > 0
      }),

    slippageType: yup
      .string()
      .oneOf(['preset', 'custom'] as SlippageType[])
      .required('Slippage type is required.'),

    slippagePreset: yup.number().when('slippageType', {
      is: 'preset',
      then: (schema) =>
        schema
          .oneOf([5, 10, 15] as SlippagePreset[])
          .required('Slippage preset is required when type is preset.'),
      otherwise: (schema) => schema.optional(),
    }),

    slippageCustom: yup.string().when('slippageType', {
      is: 'custom',
      then: (schema) =>
        schema
          .required('Custom slippage is required when type is custom.')
          .test(
            'is-valid-decimal',
            'Slippage must be a valid decimal number',
            (value) => {
              if (!value) return false
              const decimalRegex = /^(\d+\.?\d*|\.\d+)$/
              return decimalRegex.test(value)
            }
          )
          .test('is-valid-range', 'Slippage must be between 0.1% and 50%', (value) => {
            if (!value) return false
            const num = parseFloat(value)
            return !isNaN(num) && num >= 0.1 && num <= 50
          }),
      otherwise: (schema) => schema.optional(),
    }),

    deadline: yup
      .object({
        days: yup.number().integer('Days must be a whole number').min(0).optional(),
        hours: yup
          .number()
          .integer('Hours must be a whole number')
          .min(0)
          .max(23)
          .optional(),
        minutes: yup
          .number()
          .integer('Minutes must be a whole number')
          .min(0)
          .max(59)
          .optional(),
        seconds: yup
          .number()
          .integer('Seconds must be a whole number')
          .min(0)
          .max(59)
          .optional(),
      })
      .required('Deadline is required.')
      .test('has-value', 'Deadline must be at least 1 hour.', (value) => {
        if (!value) return false
        const { days = 0, hours = 0, minutes = 0, seconds = 0 } = value
        const totalHours = days * 24 + hours + minutes / 60 + seconds / 3600
        return totalHours >= 1
      })
      .test('max-value', 'Deadline cannot exceed 30 days.', (value) => {
        if (!value) return false
        const { days = 0, hours = 0, minutes = 0, seconds = 0 } = value
        const totalHours = days * 24 + hours + minutes / 60 + seconds / 3600
        return totalHours <= 720 // 30 days
      }),
  })

export default UniswapSwapSchema
