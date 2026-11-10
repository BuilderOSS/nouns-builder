import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import * as Sentry from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { generateCachedAiText, isAiConfigured } from 'src/utils/api/ai/summaries'
import {
  buildTxSummaryPrompt,
  tryTemplateSummary,
  TX_SUMMARY_PROMPT_VERSION,
  TX_SUMMARY_SYSTEM_PROMPT,
  type TxSummaryRequest,
} from 'src/utils/api/ai/txSummaryPrompt'
import { type AuthContext, withAuth } from 'src/utils/api/authMiddleware'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { withSameOrigin } from 'src/utils/api/sameOrigin'

const validateRequest = (data: Partial<TxSummaryRequest> | undefined) => {
  if (!data?.chainId || !data.addresses) return 'chainId and addresses are required'

  if (!PUBLIC_DEFAULT_CHAINS.some((c) => c.id === data.chainId))
    return 'chainId not found'

  if (Object.values(data.addresses).filter(Boolean).length < 5)
    return 'addresses not found'

  if (!data.transaction || !data.target) return 'transaction and target are required'

  if (
    typeof data.transaction.functionName !== 'string' ||
    !data.transaction.functionName ||
    !data.transaction.args ||
    typeof data.transaction.args !== 'object'
  )
    return 'transaction must have functionName and args'

  if (data.value !== undefined && !/^\d+$/.test(String(data.value)))
    return 'value must be an integer string'

  return undefined
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  _authContext: AuthContext
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const requestData = req.body as TxSummaryRequest
    const validationError = validateRequest(requestData)

    if (validationError) {
      return res.status(400).json({ error: validationError })
    }

    res.setHeader('Cache-Control', 'private, no-store')

    const templateSummary = tryTemplateSummary(requestData)
    if (templateSummary) {
      return res.status(200).json({ text: templateSummary })
    }

    if (!isAiConfigured()) {
      return res.status(503).json({ error: 'ai_unavailable' })
    }

    // The prompt is a pure function of the request, so it doubles as the cache key
    // payload; unrelated request fields (e.g. full proposal metadata) don't bust the cache.
    const prompt = buildTxSummaryPrompt(requestData)

    const text = await generateCachedAiText({
      namespace: `ai:txSummary:${TX_SUMMARY_PROMPT_VERSION}`,
      data: prompt,
      system: TX_SUMMARY_SYSTEM_PROMPT,
      prompt,
    })

    res.status(200).json({ text })
  } catch (error) {
    console.error(`Error generating transaction summary:`, error)

    Sentry.captureException(error)
    await Sentry.flush(2000)

    return res.status(500).json({ error: 'transaction summary generation failed' })
  }
}

export default withRateLimit({
  keyPrefix: 'ai:txSummary',
})(withAuth(withSameOrigin(handler)))
