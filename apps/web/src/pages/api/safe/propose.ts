import { SAFE_SERVICE_URL } from '@buildeross/constants/safe'
import SafeApiKit from '@safe-global/api-kit'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getAddress, isAddress } from 'viem'

interface ProposalRequest {
  chainId: number
  safeAddress: string
  safeTransactionData: {
    to: string
    value: string
    data: string
    operation?: number
    safeTxGas?: string
    baseGas?: string
    gasPrice?: string
    gasToken?: string
    refundReceiver?: string
    nonce: number
  }
  safeTxHash: string
  senderAddress: string
  senderSignature: string
}

type ProposalErrorCode =
  | 'SAFE_SERVICE_REJECTED'
  | 'SAFE_SERVICE_UNAVAILABLE'
  | 'SAFE_SERVICE_CONFIG_ERROR'

function getUpstreamError(error: unknown): { code: ProposalErrorCode; message: string } {
  const status =
    typeof error === 'object' && error !== null && 'response' in error
      ? (error.response as { status?: number } | undefined)?.status
      : undefined

  if (status === 401 || status === 403) {
    return {
      code: 'SAFE_SERVICE_CONFIG_ERROR',
      message: 'Safe Service is not configured correctly. Please try again later.',
    }
  }

  if (status === 408 || status === 429 || !status || status >= 500) {
    return {
      code: 'SAFE_SERVICE_UNAVAILABLE',
      message:
        'Safe Service is temporarily unavailable. Check your connection and try again.',
    }
  }

  if (status && status >= 400 && status < 500) {
    return {
      code: 'SAFE_SERVICE_REJECTED',
      message:
        'Safe Service rejected this proposal. Check the transaction details and try again.',
    }
  }

  return {
    code: 'SAFE_SERVICE_UNAVAILABLE',
    message:
      'Safe Service is temporarily unavailable. Check your connection and try again.',
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.SAFE_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Safe API is not configured' })
  }

  const body = req.body as Partial<ProposalRequest>
  if (
    !body ||
    typeof body.chainId !== 'number' ||
    typeof body.safeAddress !== 'string' ||
    typeof body.senderAddress !== 'string' ||
    typeof body.safeTxHash !== 'string' ||
    typeof body.senderSignature !== 'string' ||
    !body.safeTransactionData ||
    !isAddress(body.safeAddress) ||
    !isAddress(body.senderAddress)
  ) {
    return res.status(400).json({ error: 'Invalid Safe proposal' })
  }

  const serviceUrl = SAFE_SERVICE_URL[body.chainId as keyof typeof SAFE_SERVICE_URL]
  if (!serviceUrl) {
    return res.status(400).json({ error: 'Unsupported Safe chain' })
  }

  try {
    const apiKit = new SafeApiKit({ chainId: BigInt(body.chainId), apiKey })
    await apiKit.proposeTransaction({
      safeAddress: getAddress(body.safeAddress),
      safeTransactionData: body.safeTransactionData as Parameters<
        SafeApiKit['proposeTransaction']
      >[0]['safeTransactionData'],
      safeTxHash: body.safeTxHash as `0x${string}`,
      senderAddress: getAddress(body.senderAddress),
      senderSignature: body.senderSignature,
    })

    return res.status(200).json({ safeTxHash: body.safeTxHash })
  } catch (error) {
    console.error('Failed to propose transaction to Safe Service', error)
    const upstreamError = getUpstreamError(error)
    const statusCode =
      upstreamError.code === 'SAFE_SERVICE_REJECTED'
        ? 422
        : upstreamError.code === 'SAFE_SERVICE_CONFIG_ERROR'
          ? 500
          : 502
    return res.status(statusCode).json({
      code: upstreamError.code,
      error: upstreamError.message,
    })
  }
}
