import { beforeEach, describe, expect, it, vi } from 'vitest'

const { generateTextMock, redisMock } = vi.hoisted(() => ({
  generateTextMock: vi.fn(),
  redisMock: { get: vi.fn(), setex: vi.fn() },
}))

vi.mock('ai', () => ({ generateText: generateTextMock }))
vi.mock('@ai-sdk/groq', () => ({
  createGroq: () => (modelId: string) => ({ provider: 'groq', modelId }),
}))
vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: () => (modelId: string) => ({ provider: 'google', modelId }),
}))
vi.mock('@ai-sdk/gateway', () => ({
  createGateway: () => (modelId: string) => ({ provider: 'gateway', modelId }),
}))
vi.mock('src/services/redisConnection', () => ({ getRedisConnection: () => redisMock }))

import {
  AiUnavailableError,
  cleanAiText,
  generateAiText,
  generateCachedAiText,
  getAiCacheKey,
  getAiProviderChain,
  isAiConfigured,
} from './summaries'

const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv

const allKeys = env({
  GROQ_API_KEY: 'groq-key',
  GOOGLE_GENERATIVE_AI_API_KEY: 'google-key',
  AI_GATEWAY_API_KEY: 'gateway-key',
})

describe('getAiProviderChain', () => {
  it('uses the default free-first chain, skipping providers without keys', () => {
    expect(getAiProviderChain(allKeys).map((c) => c.provider)).toEqual([
      'groq',
      'google',
      'gateway',
    ])
    expect(getAiProviderChain(env({ GOOGLE_GENERATIVE_AI_API_KEY: 'k' }))).toEqual([
      { provider: 'google', modelId: 'gemini-3.5-flash-lite' },
    ])
  })

  it('respects AI_PROVIDER_CHAIN and ignores invalid entries', () => {
    const customChain = env({
      ...(allKeys as Record<string, string>),
      AI_PROVIDER_CHAIN: 'gateway:openai/gpt-4o-mini, bogus:model, groq:',
    })

    expect(getAiProviderChain(customChain)).toEqual([
      { provider: 'gateway', modelId: 'openai/gpt-4o-mini' },
    ])
  })

  it('reports whether any provider is configured', () => {
    expect(isAiConfigured(env({}))).toBe(false)
    expect(isAiConfigured(env({ GROQ_API_KEY: ' ' }))).toBe(false)
    expect(isAiConfigured(allKeys)).toBe(true)
  })
})

describe('cleanAiText', () => {
  it('strips markdown, labels and quotes', () => {
    expect(cleanAiText('**Summary:** "Sends 1 ETH to 0xabc."\n')).toBe(
      'Sends 1 ETH to 0xabc.'
    )
    expect(cleanAiText('<think>hmm</think>Mints 2 NFTs.')).toBe('Mints 2 NFTs.')
  })

  it('caps long output at a sentence boundary', () => {
    const text = `${'A'.repeat(200)}. ${'B'.repeat(200)}.`
    expect(cleanAiText(text)).toBe(`${'A'.repeat(200)}.`)
  })
})

describe('generateAiText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('falls back to the next provider when one fails or returns nothing', async () => {
    generateTextMock
      .mockRejectedValueOnce(new Error('429 rate limited'))
      .mockResolvedValueOnce({ text: '   ' })
      .mockResolvedValueOnce({ text: 'Sends 1 ETH.' })

    await expect(generateAiText({ prompt: 'p', env: allKeys })).resolves.toBe(
      'Sends 1 ETH.'
    )
    expect(generateTextMock.mock.calls.map(([args]) => args.model.provider)).toEqual([
      'groq',
      'google',
      'gateway',
    ])
    expect(generateTextMock.mock.calls[1][0].providerOptions).toEqual({
      google: { thinkingConfig: { thinkingLevel: 'minimal' } },
    })
  })

  it('throws an aggregated error when every provider fails', async () => {
    generateTextMock.mockRejectedValue(new Error('boom'))

    await expect(generateAiText({ prompt: 'p', env: allKeys })).rejects.toThrow(
      'All AI providers failed. groq:llama-3.3-70b-versatile: boom'
    )
  })

  it('throws AiUnavailableError without any keys', async () => {
    await expect(generateAiText({ prompt: 'p', env: env({}) })).rejects.toBeInstanceOf(
      AiUnavailableError
    )
  })
})

describe('generateCachedAiText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GROQ_API_KEY', 'groq-key')
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', '')
    vi.stubEnv('AI_GATEWAY_API_KEY', '')
  })

  it('returns cached text without calling a provider', async () => {
    redisMock.get.mockResolvedValueOnce('Cached summary.')

    await expect(
      generateCachedAiText({ namespace: 'ns', data: 'x', prompt: 'p' })
    ).resolves.toBe('Cached summary.')
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('generates once for concurrent identical requests and caches the result', async () => {
    redisMock.get.mockResolvedValue(null)
    generateTextMock.mockResolvedValue({ text: 'Fresh summary.' })

    const [a, b] = await Promise.all([
      generateCachedAiText({ namespace: 'ns', data: 'same', prompt: 'p' }),
      generateCachedAiText({ namespace: 'ns', data: 'same', prompt: 'p' }),
    ])

    expect([a, b]).toEqual(['Fresh summary.', 'Fresh summary.'])
    expect(generateTextMock).toHaveBeenCalledTimes(1)
    expect(redisMock.setex).toHaveBeenCalledWith(
      getAiCacheKey('ns', 'same'),
      60 * 60 * 24 * 30,
      'Fresh summary.'
    )
  })
})
