import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import type { CHAIN_ID } from '@buildeross/types'
import * as Sentry from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import {
  BackendFailedError,
  InvalidRequestError,
  NotFoundError,
} from 'src/services/errors'
import { getAddress, isAddress } from 'viem'

/**
 * Standard error response format
 */
interface ErrorResponse {
  error: string
  code?: string
  details?: unknown
}

/**
 * Maps service layer errors to appropriate HTTP status codes and responses
 */
export function handleApiError(error: unknown, res: NextApiResponse): void {
  // Handle known service errors
  if (error instanceof InvalidRequestError) {
    res.status(400).json({ error: error.message } as ErrorResponse)
    return
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message } as ErrorResponse)
    return
  }

  if (error instanceof BackendFailedError) {
    // Log backend failures to Sentry for investigation
    Sentry.captureException(error)
    res.status(500).json({ error: error.message } as ErrorResponse)
    return
  }

  // Handle unexpected errors
  console.error('Unexpected API error:', error)
  Sentry.captureException(error)

  // Don't expose internal error details to clients
  res.status(500).json({
    error: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      details: error instanceof Error ? error.message : String(error),
    }),
  } as ErrorResponse)
}

/**
 * Async wrapper that automatically handles errors using handleApiError
 */
export function withErrorHandling(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res)
    } catch (error) {
      handleApiError(error, res)
    }
  }
}

/**
 * Validation helper that throws InvalidRequestError for common validation cases
 */
export const validate = {
  required: (value: unknown, fieldName: string): void => {
    if (value === undefined || value === null || value === '') {
      throw new InvalidRequestError(`${fieldName} is required`)
    }
  },

  chainId: (chainId: unknown): CHAIN_ID => {
    if (!chainId) {
      throw new InvalidRequestError('chainId is required')
    }

    const parsed = typeof chainId === 'string' ? parseInt(chainId, 10) : Number(chainId)

    if (isNaN(parsed) || parsed <= 0) {
      throw new InvalidRequestError('chainId must be a valid positive number')
    }

    if (!PUBLIC_ALL_CHAINS.some((chain) => chain.id === parsed)) {
      throw new InvalidRequestError('chainId must be a valid supported chain ID')
    }

    return parsed as CHAIN_ID
  },

  address: (address: unknown): string => {
    if (!address || typeof address !== 'string') {
      throw new InvalidRequestError('address is required and must be a string')
    }

    if (!isAddress(address, { strict: false })) {
      throw new InvalidRequestError('address must be a valid Ethereum address')
    }

    return getAddress(address)
  },

  pagination: (page?: unknown, limit?: unknown) => {
    const parsedPage = page ? parseInt(String(page), 10) : 1
    const parsedLimit = limit ? parseInt(String(limit), 10) : 20

    if (isNaN(parsedPage) || parsedPage < 1) {
      throw new InvalidRequestError('page must be a positive number')
    }

    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw new InvalidRequestError('limit must be between 1 and 100')
    }

    return { page: parsedPage, limit: parsedLimit }
  },
}
