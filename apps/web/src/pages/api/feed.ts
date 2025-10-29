import { CHAIN_ID } from '@buildeross/types'
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  fetchFeedDataService,
  fetchUserActivityFeedService,
  getTtlByScope,
} from 'src/services/feedService'
import { isAddress, keccak256, toHex } from 'viem'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'OPTIONS') return res.status(200).end()

    const limit =
      Number(req.query.limit) > 0 ? Math.min(Number(req.query.limit), 100) : 20
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined
    const chainId = req.query.chainId
      ? (Number(req.query.chainId) as CHAIN_ID)
      : undefined
    const daoAddress =
      req.query.daoAddress &&
      typeof req.query.daoAddress === 'string' &&
      isAddress(req.query.daoAddress, { strict: false })
        ? req.query.daoAddress.toLowerCase()
        : undefined
    const actor =
      req.query.actor &&
      typeof req.query.actor === 'string' &&
      isAddress(req.query.actor, { strict: false })
        ? req.query.actor.toLowerCase()
        : undefined

    // Early conditional GET check (optional optimization)
    const requestKey = keccak256(
      toHex(JSON.stringify({ chainId, daoAddress, actor, cursor, limit }))
    )
    res.setHeader('ETag', requestKey)
    if (req.headers['if-none-match'] === requestKey) {
      res.status(304).end()
      return
    }

    let result

    if (actor) {
      // User activity feed
      result = await fetchUserActivityFeedService({
        actor,
        chainId,
        cursor,
        limit,
      })
    } else {
      // Global / Chain / DAO feed
      result = await fetchFeedDataService({
        chainId,
        daoAddress,
        cursor,
        limit,
      })
    }

    // Determine TTL based on scope
    const ttl = getTtlByScope({
      chainId,
      daoAddress,
      actor,
    })

    // Cache-Control: browser/CDN caching hints
    res.setHeader(
      'Cache-Control',
      `public, max-age=${ttl}, stale-while-revalidate=${Math.floor(ttl * 0.5)}, no-transform`
    )

    return res.status(200).json(result)
  } catch (err) {
    console.error('Feed API error:', err)
    return res.status(500).json({ error: 'Failed to fetch feed' })
  }
}
