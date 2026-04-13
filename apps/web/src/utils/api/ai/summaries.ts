import { gateway } from '@ai-sdk/gateway'
import { generateText } from 'ai'
import { getRedisConnection } from 'src/services/redisConnection'
import { keccak256, toHex } from 'viem'

export const AI_MODEL = process.env.AI_MODEL || 'openai/gpt-4-turbo'
const DEFAULT_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30

const safeStringify = (value: unknown) =>
  JSON.stringify(value, (_key, item) =>
    typeof item === 'bigint' ? item.toString() : item
  )

export const getAiCacheKey = (
  namespace: string,
  data: unknown,
  model: string = AI_MODEL
) => {
  const hash = keccak256(toHex(`${safeStringify(data)}:${model}`))
  return `${namespace}:${hash}`
}

export const generateCachedAiText = async ({
  namespace,
  data,
  prompt,
  model = AI_MODEL,
  ttlSeconds = DEFAULT_CACHE_TTL_SECONDS,
}: {
  namespace: string
  data: unknown
  prompt: string
  model?: string
  ttlSeconds?: number
}) => {
  const redisConnection = getRedisConnection()
  const cacheKey = getAiCacheKey(namespace, data, model)

  const cachedText = await redisConnection?.get(cacheKey)

  if (cachedText) {
    return cachedText
  }

  const result = await generateText({
    model: gateway(model),
    prompt,
    abortSignal: AbortSignal.timeout(30000),
  })

  const text = result.text.trim().replace(/\s+/g, ' ')

  await redisConnection?.setex(cacheKey, ttlSeconds, text)

  return text
}

const trimDescription = (description: string, maxChars = 2200) =>
  description.trim().replace(/\s+/g, ' ').slice(0, maxChars)

const buildDaoDescriptionPrompt = (
  description: string
) => `You are writing concise directory copy for a DAO platform.
Summarize the DAO description below into 1-2 short sentences for a directory card.

Writing Rules:
- Keep it factual, clear, and neutral.
- Do not mention the DAO name.
- Do not use hype, markdown, bullet points, or line breaks.
- Prefer concrete activity, purpose, or community focus over abstract framing.
- Maximum 2 short sentences.

DAO description:
${trimDescription(description)}

Final Instruction:
Respond with only the 1-2 sentence summary.`

export const summarizeDaoDescription = async (description: string) =>
  generateCachedAiText({
    namespace: 'ai:daoDescription',
    data: { description },
    prompt: buildDaoDescriptionPrompt(description),
  })
