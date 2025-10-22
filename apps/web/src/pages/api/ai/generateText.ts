import { gateway } from '@ai-sdk/gateway'
import * as Sentry from '@sentry/nextjs'
import { generateText } from 'ai'
import { NextApiRequest, NextApiResponse } from 'next'
import { getRedisConnection } from 'src/services/redisConnection'
import { withCors } from 'src/utils/api/cors'
import { keccak256, toHex } from 'viem'

const getGenerateTextCacheKey = (prompt: string, model: string) => {
  const hash = keccak256(toHex(`${prompt}:${model}`))
  return `ai:generateText:${hash}`
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { prompt } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' })
    }

    if (typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt must be a string' })
    }

    const model = process.env.AI_MODEL || 'xai/grok-3'
    const redisConnection = getRedisConnection()
    const cacheKey = getGenerateTextCacheKey(prompt, model)

    // Check cache first
    let cachedText = await redisConnection?.get(cacheKey)

    if (cachedText) {
      return res.status(200).json({ text: cachedText })
    }

    // Generate new text if not in cache
    const result = await generateText({
      model: gateway(model),
      prompt,
      abortSignal: AbortSignal.timeout(30000),
    })

    // Cache the generated text for 24 hours
    await redisConnection?.setex(cacheKey, 60 * 60 * 24, result.text)

    res.status(200).json({ text: result.text })
  } catch (error) {
    console.error(error)

    Sentry.captureException(error)
    await Sentry.flush(2000)

    return res.status(500).json({ error: 'text generation failed' })
  }
}

export default withCors(['POST'])(handler)
