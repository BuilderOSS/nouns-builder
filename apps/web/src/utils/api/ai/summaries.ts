import { gateway } from '@ai-sdk/gateway'
import { generateText } from 'ai'
import { getRedisConnection } from 'src/services/redisConnection'

export const AI_MODEL = process.env.AI_MODEL || 'openai/gpt-4-turbo'
const DEFAULT_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30
const MAX_DAO_DESCRIPTION_LENGTH = 2200

const safeStringify = (value: unknown) =>
  JSON.stringify(value, (_key, item) =>
    typeof item === 'bigint' ? item.toString() : item
  )

export const getAiCacheKey = (
  namespace: string,
  data: unknown,
  model: string = AI_MODEL
) => {
  const payload = `${namespace}:${model}:${safeStringify(data)}`
  let hash = 2166136261

  for (let i = 0; i < payload.length; i += 1) {
    hash ^= payload.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return `${namespace}:${(hash >>> 0).toString(16)}`
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

  if (!redisConnection) {
    console.warn(
      `[ai-cache] Redis unavailable for namespace=${namespace} key=${cacheKey}; skipping cache.`
    )
  }

  const cachedText = redisConnection ? await redisConnection.get(cacheKey) : null

  if (cachedText) {
    return cachedText
  }

  const result = await generateText({
    model: gateway(model),
    prompt,
    abortSignal: AbortSignal.timeout(30000),
  })

  const text = result.text.trim().replace(/\s+/g, ' ')

  if (redisConnection) {
    await redisConnection.setex(cacheKey, ttlSeconds, text)
  }

  return text
}

const trimDescription = (description: string, maxChars = MAX_DAO_DESCRIPTION_LENGTH) =>
  description.trim().replace(/\s+/g, ' ').slice(0, maxChars)

const sanitizeDescription = (description: string) =>
  description.replace(/###|assistant\s*:|system\s*:|user\s*:/gi, '')

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

export const summarizeDaoDescription = async (description: string) => {
  if (description.length > MAX_DAO_DESCRIPTION_LENGTH) {
    console.warn(
      `[ai-cache] DAO description exceeded ${MAX_DAO_DESCRIPTION_LENGTH} chars; truncating before summarization.`
    )
  }

  const cleaned = sanitizeDescription(trimDescription(description))

  if (!cleaned.trim()) {
    throw new Error('DAO description is empty after trimming/sanitization')
  }

  return generateCachedAiText({
    namespace: 'ai:daoDescription',
    data: { description: cleaned },
    prompt: buildDaoDescriptionPrompt(cleaned),
  })
}
