import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import {
  type AddressLookupChainResult,
  type AddressPrefixLookupChainResult,
  GLOBAL_SEARCH_TYPES,
  globalAddressLookupRequest,
  globalAddressPrefixLookupRequest,
  type GlobalSearchChainResults,
  globalSearchRequest,
  type GlobalSearchResponse,
  type GlobalSearchResultsByType,
  type GlobalSearchTextType,
  type GlobalSearchType,
  globalTxLookupRequest,
  type ProfileGlobalSearchResult,
  type TxLookupChainResult,
} from '@buildeross/sdk/subgraph'
import { Chain, CHAIN_ID } from '@buildeross/types'
import { executeConcurrently } from '@buildeross/utils/concurrent'
import { getEnsAddress } from '@buildeross/utils/ens'
import { buildSearchText, classifyQuery } from '@buildeross/utils/search'
import { rankDao, rankText } from '@buildeross/utils/searchRank'
import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { isAddress } from 'viem'

const MIN_SEARCH_LENGTH = 3
const MAX_SEARCH_LENGTH = 100
const DEFAULT_LIMIT = 5
const MAX_LIMIT = 20
const MAX_PAGES = 5
// Fetch every chain in parallel; there are at most a handful of chains
const CHAIN_CONCURRENCY = 6

type Ranked<T> = { item: T; rank: number }

const emptyResults = (): GlobalSearchResultsByType => ({
  daos: [],
  profiles: [],
  proposals: [],
  candidates: [],
  votes: [],
  bids: [],
})

const noMore = (): Record<GlobalSearchType, boolean> => ({
  daos: false,
  profiles: false,
  proposals: false,
  candidates: false,
  votes: false,
  bids: false,
})

const parseCsv = (value: string | string[] | undefined): string[] =>
  typeof value === 'string'
    ? value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : []

/**
 * Runs `task` for each chain, collecting failures instead of throwing so one
 * unhealthy (or not yet migrated) subgraph never breaks the whole search.
 */
async function perChain<T>(
  chains: Chain[],
  task: (chainId: CHAIN_ID) => Promise<T>
): Promise<{ ok: T[]; failedChainIds: CHAIN_ID[] }> {
  const failedChainIds: CHAIN_ID[] = []
  const results = await executeConcurrently(
    chains.map((chain) => async () => {
      try {
        return await task(chain.id)
      } catch (error) {
        // graphql-request errors embed the whole query; log just the gist
        const status = (error as { response?: { status?: number } })?.response?.status
        const message = error instanceof Error ? error.message.slice(0, 200) : error
        console.error(`Global search failed for chain ${chain.id}:`, status ?? message)
        failedChainIds.push(chain.id)
        return null
      }
    }),
    CHAIN_CONCURRENCY
  )
  return { ok: results.filter((r): r is Awaited<T> => r !== null), failedChainIds }
}

/** Ranks items from every chain together, then cuts out the requested page. */
function paginate<T>(
  ranked: Ranked<T>[],
  page: number,
  limit: number
): { items: T[]; hasMore: boolean } {
  const sorted = ranked.sort((a, b) => b.rank - a.rank)
  const start = (page - 1) * limit
  const end = start + limit
  return {
    items: sorted.slice(start, end).map((r) => r.item),
    hasMore: page < MAX_PAGES && sorted.length > end,
  }
}

/** Sorts activity newest-first, then cuts out the requested page. */
function paginateByTime<T>(
  items: T[],
  time: (item: T) => number,
  page: number,
  limit: number
) {
  return paginate(
    items.map((item) => ({ item, rank: time(item) })),
    page,
    limit
  )
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { q, page, limit } = req.query

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({ error: 'Search query required' })
  }
  const rawQuery = q.trim()
  if (rawQuery.length < MIN_SEARCH_LENGTH) {
    return res
      .status(400)
      .json({ error: `Search must be at least ${MIN_SEARCH_LENGTH} characters` })
  }
  if (rawQuery.length > MAX_SEARCH_LENGTH) {
    return res
      .status(400)
      .json({ error: `Search must be less than ${MAX_SEARCH_LENGTH} characters` })
  }

  const pageInt = Math.max(1, parseInt(page as string) || 1)
  const limitInt = Math.max(1, parseInt(limit as string) || DEFAULT_LIMIT)
  if (pageInt > MAX_PAGES) {
    return res.status(400).json({ error: `Page cannot be greater than ${MAX_PAGES}` })
  }
  if (limitInt > MAX_LIMIT) {
    return res.status(400).json({ error: `Limit cannot be greater than ${MAX_LIMIT}` })
  }

  // Which result types to return (default: all)
  const requestedTypes = parseCsv(req.query.types)
  for (const type of requestedTypes) {
    if (!GLOBAL_SEARCH_TYPES.includes(type as GlobalSearchType)) {
      return res.status(400).json({ error: `Invalid type: ${type}` })
    }
  }
  const types = new Set<GlobalSearchType>(
    requestedTypes.length
      ? (requestedTypes as GlobalSearchType[])
      : [...GLOBAL_SEARCH_TYPES]
  )

  // Which chains to search (default: all public chains)
  const validChainIds = PUBLIC_DEFAULT_CHAINS.map((c) => c.id)
  const chainIdParams = parseCsv(req.query.chainIds)
  for (const id of chainIdParams) {
    if (!validChainIds.includes(Number(id))) {
      return res.status(400).json({ error: `Invalid chain ID: ${id}` })
    }
  }
  let chains: Chain[] = chainIdParams.length
    ? PUBLIC_DEFAULT_CHAINS.filter((c) => chainIdParams.includes(String(c.id)))
    : [...PUBLIC_DEFAULT_CHAINS]

  // Optional DAO scope: ?dao=<token address>&chainId=<chain>
  let daoId: string | undefined
  if (req.query.dao !== undefined) {
    const dao = req.query.dao
    const scopeChainId = Number(req.query.chainId)
    if (typeof dao !== 'string' || !isAddress(dao)) {
      return res.status(400).json({ error: 'dao must be a token address' })
    }
    if (!validChainIds.includes(scopeChainId)) {
      return res.status(400).json({ error: 'chainId is required when dao is set' })
    }
    daoId = dao.toLowerCase()
    chains = PUBLIC_DEFAULT_CHAINS.filter((c) => c.id === scopeChainId)
    // Scoped searches only make sense for DAO activity
    types.delete('daos')
    types.delete('profiles')
  }

  const results = emptyResults()
  const hasMore = noMore()
  let kind: GlobalSearchResponse['kind'] = classifyQuery(rawQuery)
  let resolvedAddress: string | undefined
  let failedChainIds: CHAIN_ID[] = []
  const fetchCount = Math.min(100, pageInt * limitInt)

  try {
    // ENS / Basename → address. getEnsAddress returns its input on failure.
    if (kind === 'name') {
      const resolved = await getEnsAddress(rawQuery.toLowerCase())
      if (resolved && isAddress(resolved)) {
        resolvedAddress = resolved.toLowerCase()
      } else {
        kind = 'text'
      }
    } else if (kind === 'address') {
      resolvedAddress = rawQuery.toLowerCase()
    }

    if (resolvedAddress) {
      const address = resolvedAddress
      const { ok, failedChainIds: failed } = await perChain<AddressLookupChainResult>(
        chains,
        (chainId) => globalAddressLookupRequest(chainId, address, fetchCount + 1)
      )
      failedChainIds = failed

      if (types.has('profiles') && !daoId) {
        const profile: ProfileGlobalSearchResult = {
          type: 'profile',
          id: address,
          address,
          name: kind === 'name' ? rawQuery.toLowerCase() : undefined,
          chains: ok.flatMap((r) => (r.profile ? [r.profile] : [])),
        }
        results.profiles = [profile]
      }
      if (types.has('daos')) {
        results.daos = ok.flatMap((r) => r.daos)
      }
      const byDao = <T extends { dao: { id: string } }>(items: T[]) =>
        daoId ? items.filter((i) => i.dao.id === daoId) : items
      if (types.has('proposals')) {
        const p = paginateByTime(
          byDao(ok.flatMap((r) => r.proposals)),
          (i) => i.timeCreated,
          pageInt,
          limitInt
        )
        results.proposals = p.items
        hasMore.proposals = p.hasMore
      }
      if (types.has('votes')) {
        const v = paginateByTime(
          byDao(ok.flatMap((r) => r.votes)),
          (i) => i.timestamp,
          pageInt,
          limitInt
        )
        results.votes = v.items
        hasMore.votes = v.hasMore
      }
      if (types.has('bids')) {
        const b = paginateByTime(
          byDao(ok.flatMap((r) => r.bids)),
          (i) => i.bidTime,
          pageInt,
          limitInt
        )
        results.bids = b.items
        hasMore.bids = b.hasMore
      }
    } else if (kind === 'txHash') {
      const { ok, failedChainIds: failed } = await perChain<TxLookupChainResult>(
        chains,
        (chainId) => globalTxLookupRequest(chainId, rawQuery)
      )
      failedChainIds = failed
      if (types.has('proposals')) results.proposals = ok.flatMap((r) => r.proposals)
      if (types.has('votes')) results.votes = ok.flatMap((r) => r.votes)
      if (types.has('bids')) results.bids = ok.flatMap((r) => r.bids)
    } else if (kind === 'addressPrefix') {
      const prefix = rawQuery.toLowerCase()
      const { ok, failedChainIds: failed } =
        await perChain<AddressPrefixLookupChainResult>(chains, (chainId) =>
          globalAddressPrefixLookupRequest(chainId, prefix, fetchCount + 1)
        )
      failedChainIds = failed

      if (types.has('profiles') && !daoId) {
        // Merge the same address across chains into one profile result
        const profiles = new Map<string, ProfileGlobalSearchResult>()
        for (const match of ok.flatMap((r) => r.profiles)) {
          const { address, ...stats } = match
          const existing = profiles.get(address)
          if (existing) existing.chains.push(stats)
          else
            profiles.set(address, {
              type: 'profile',
              id: address,
              address,
              chains: [stats],
            })
        }
        const lastActive = (p: ProfileGlobalSearchResult) =>
          Math.max(...p.chains.map((c) => Number(c.lastActiveAt) || 0))
        const p = paginateByTime([...profiles.values()], lastActive, pageInt, limitInt)
        results.profiles = p.items
        hasMore.profiles = p.hasMore
      }
      if (types.has('daos')) {
        const d = paginateByTime(
          ok.flatMap((r) => r.daos),
          (i) => i.dao.ownerCount,
          pageInt,
          limitInt
        )
        results.daos = d.items
        hasMore.daos = d.hasMore
      }
    }

    if (kind === 'text') {
      const textTypes = [...types].filter(
        (t): t is GlobalSearchTextType => t !== 'profiles'
      )
      const fulltext = buildSearchText(rawQuery)

      if (fulltext && textTypes.length) {
        const { ok, failedChainIds: failed } = await perChain<GlobalSearchChainResults>(
          chains,
          (chainId) =>
            globalSearchRequest(chainId, fulltext, rawQuery, {
              types: textTypes,
              first: fetchCount,
              daoId,
            })
        )
        failedChainIds = failed

        // Subgraph order is a relevance signal, so rank with each item's index on its chain
        const rankAll = <T>(
          pick: (r: GlobalSearchChainResults) => T[],
          score: (item: T, index: number) => number
        ) => ok.flatMap((r) => pick(r).map((item, i) => ({ item, rank: score(item, i) })))

        const daos = paginate(
          rankAll(
            (r) => r.daos,
            (d, i) => rankDao(d, rawQuery, i)
          ),
          pageInt,
          limitInt
        )
        const proposals = paginate(
          rankAll(
            (r) => r.proposals,
            (p, i) => rankText({ title: p.title, timestamp: p.timeCreated }, rawQuery, i)
          ),
          pageInt,
          limitInt
        )
        const candidates = paginate(
          rankAll(
            (r) => r.candidates,
            (c, i) => rankText({ title: c.title, timestamp: c.createdAt }, rawQuery, i)
          ),
          pageInt,
          limitInt
        )
        const votes = paginate(
          rankAll(
            (r) => r.votes,
            (v, i) => rankText({ body: v.reason, timestamp: v.timestamp }, rawQuery, i)
          ),
          pageInt,
          limitInt
        )
        const bids = paginate(
          rankAll(
            (r) => r.bids,
            (b, i) => rankText({ body: b.comment, timestamp: b.bidTime }, rawQuery, i)
          ),
          pageInt,
          limitInt
        )

        results.daos = daos.items
        results.proposals = proposals.items
        results.candidates = candidates.items
        results.votes = votes.items
        results.bids = bids.items
        hasMore.daos = daos.hasMore
        hasMore.proposals = proposals.hasMore
        hasMore.candidates = candidates.hasMore
        hasMore.votes = votes.hasMore
        hasMore.bids = bids.hasMore
      }
    }

    const response: GlobalSearchResponse = {
      query: rawQuery,
      kind,
      resolvedAddress,
      results,
      hasMore,
      failedChainIds,
    }

    // Don't cache partial results for long
    const { maxAge, swr } = CACHE_TIMES.EXPLORE
    res.setHeader(
      'Cache-Control',
      failedChainIds.length
        ? 'public, s-maxage=10, stale-while-revalidate=60'
        : `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
    )
    return res.status(200).json(response)
  } catch (error) {
    console.error('Global search error:', error instanceof Error ? error.message : error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors()(
  withRateLimit({
    keyPrefix: 'global-search',
  })(handler)
)
