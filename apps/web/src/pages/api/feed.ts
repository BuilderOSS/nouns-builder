import { FeedEventType } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import type { NextApiRequest, NextApiResponse } from 'next'
import { InvalidRequestError } from 'src/services/errors'
import { fetchFeedDataService, getTtlByScope } from 'src/services/feedService'
import { isAddress } from 'viem'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now()

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validate and parse limit
  let limit = 20 // default
  if (req.query.limit) {
    const parsed = parseInt(req.query.limit as string, 10)
    if (isNaN(parsed) || parsed < 1 || parsed > 33) {
      return res.status(400).json({ error: 'limit must be between 1 and 33' })
    }
    limit = parsed
  }

  // Validate and parse cursor
  let cursor: number | undefined
  if (req.query.cursor) {
    const parsed = Number(req.query.cursor)
    if (isNaN(parsed) || parsed < 0) {
      return res.status(400).json({ error: 'cursor must be a valid positive number' })
    }
    cursor = parsed
  }

  // Validate and parse chainId
  let chainId: CHAIN_ID | undefined
  if (req.query.chainId) {
    const parsed = Number(req.query.chainId)
    if (isNaN(parsed)) {
      return res.status(400).json({ error: 'chainId must be a valid number' })
    }
    chainId = parsed as CHAIN_ID
  }

  // Validate and parse actor
  let actor: string | undefined
  if (req.query.actor) {
    if (typeof req.query.actor !== 'string') {
      return res.status(400).json({ error: 'actor must be a string' })
    }
    if (!isAddress(req.query.actor, { strict: false })) {
      return res.status(400).json({ error: 'Invalid actor address format' })
    }
    actor = req.query.actor.toLowerCase()
  }

  // Validate and parse daos (comma-separated addresses)
  let daos: string[] | undefined
  if (req.query.daos) {
    if (typeof req.query.daos !== 'string') {
      return res.status(400).json({ error: 'daos must be a comma-separated string' })
    }
    const daoAddresses = req.query.daos.split(',').map((d) => d.trim())

    // Validate each address
    for (const dao of daoAddresses) {
      if (!isAddress(dao, { strict: false })) {
        return res.status(400).json({ error: `Invalid DAO address format: ${dao}` })
      }
    }

    daos = daoAddresses.map((d) => d.toLowerCase())
  }

  // Validate and parse eventTypes (comma-separated event types)
  let eventTypes: FeedEventType[] | undefined
  if (req.query.eventTypes) {
    if (typeof req.query.eventTypes !== 'string') {
      return res
        .status(400)
        .json({ error: 'eventTypes must be a comma-separated string' })
    }
    const types = req.query.eventTypes.split(',').map((t) => t.trim())

    // Validate each event type
    const validTypes = Object.values(FeedEventType)
    for (const type of types) {
      if (!validTypes.includes(type as FeedEventType)) {
        return res.status(400).json({
          error: `Invalid event type: ${type}. Valid types: ${validTypes.join(', ')}`,
        })
      }
    }

    eventTypes = types as FeedEventType[]
  }

  try {
    // Fetch data (unified function for all feed types)
    const result = await fetchFeedDataService({
      chainId,
      daos,
      eventTypes,
      actor,
      cursor,
      limit,
    })

    // Determine TTL based on scope
    const ttl = getTtlByScope({ chainId, daos, eventTypes, actor })

    // Set cache headers
    res.setHeader(
      'Cache-Control',
      `public, max-age=${ttl}, stale-while-revalidate=${Math.floor(ttl * 0.5)}`
    )

    // Log request (development only)
    const duration = Date.now() - startTime
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('Feed API success', {
        chainId,
        daos,
        eventTypes,
        actor,
        cursor,
        limit,
        itemCount: result.items.length,
        hasMore: result.hasMore,
        duration,
      })
    }

    return res.status(200).json(result)
  } catch (err) {
    const duration = Date.now() - startTime
    console.error('Feed API error:', {
      method: req.method,
      query: req.query,
      duration,
      error: err,
    })

    // Handle validation errors from service
    if (err instanceof InvalidRequestError) {
      return res.status(400).json({ error: err.message })
    }

    // Log to Sentry if available
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(err)
      await sentry.flush(2000)
    } catch (_) {}

    return res.status(500).json({ error: 'Internal server error' })
  }
}
