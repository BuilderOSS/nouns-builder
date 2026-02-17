import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import {
  type DaoSearchResult,
  searchDaosRequest,
  type SearchDaosResponse,
} from '@buildeross/sdk/subgraph'
import { Chain, CHAIN_ID } from '@buildeross/types'
import { executeConcurrently } from '@buildeross/utils/concurrent'
import { buildSearchText } from '@buildeross/utils/search'
import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'

const MIN_SEARCH_LENGTH = 3
const MAX_SEARCH_LENGTH = 100 // Prevent abuse
const PER_PAGE_LIMIT = 30
const MAX_PAGES = 2

/**
 * Ranking weights for DAO search results.
 * These values control how different match types are scored.
 */
const RANKING_WEIGHTS = {
  // Exact matches (highest priority)
  EXACT_NAME: 1000,
  EXACT_SYMBOL: 900,

  // Prefix matches
  PREFIX_NAME: 300,
  PREFIX_SYMBOL: 250,

  // Contains matches
  CONTAINS_NAME: 200,
  CONTAINS_SYMBOL: 150,
  CONTAINS_DESCRIPTION: 30,
  CONTAINS_URI: 10,

  // DB rank bonus (diminishing per position)
  DB_RANK_BASE: 100,
  DB_RANK_DECAY: 5,

  // Position penalty for name matches (max penalty for late matches)
  POSITION_PENALTY_MAX: 50,

  // Multi-term bonus (per additional term)
  MULTI_TERM_BONUS: 20,
} as const

/**
 * Hybrid ranking without direct DB score.
 * Uses the result index as a proxy for DB FTS relevance.
 *
 * @param dao DAO result object
 * @param searchQuery Raw search string
 * @param index Original index from DB results (0 = top result)
 */
export function rankDao(
  dao: DaoSearchResult,
  searchQuery: string,
  index: number
): number {
  const query = searchQuery.toLowerCase().trim()
  const terms = query.split(/\s+/).filter(Boolean)

  const name = dao.dao.name?.toLowerCase() || ''
  const symbol = dao.dao.symbol?.toLowerCase() || ''
  const description = dao.dao.description?.toLowerCase() || ''
  const uri = dao.dao.projectURI?.toLowerCase() || ''

  let score = 0

  // DB rank bonus (diminishing returns based on position)
  const dbRankBonus = Math.max(
    0,
    RANKING_WEIGHTS.DB_RANK_BASE - index * RANKING_WEIGHTS.DB_RANK_DECAY
  )
  score += dbRankBonus

  // Exact matches (highest priority) on DAO name/symbol
  if (name === query) {
    score += RANKING_WEIGHTS.EXACT_NAME
  } else if (symbol === query) {
    score += RANKING_WEIGHTS.EXACT_SYMBOL
  } else {
    // Partial matches
    for (const term of terms) {
      // Name matches
      if (name.startsWith(term)) {
        score += RANKING_WEIGHTS.PREFIX_NAME
      } else if (name.includes(term)) {
        const position = name.indexOf(term)
        const positionPenalty = Math.min(RANKING_WEIGHTS.POSITION_PENALTY_MAX, position)
        score += RANKING_WEIGHTS.CONTAINS_NAME - positionPenalty
      }

      // Symbol matches
      if (symbol.startsWith(term)) {
        score += RANKING_WEIGHTS.PREFIX_SYMBOL
      } else if (symbol.includes(term)) {
        score += RANKING_WEIGHTS.CONTAINS_SYMBOL
      }

      // Description and URI matches
      if (description.includes(term)) {
        score += RANKING_WEIGHTS.CONTAINS_DESCRIPTION
      }
      if (uri.includes(term)) {
        score += RANKING_WEIGHTS.CONTAINS_URI
      }
    }

    // Multi-term bonus
    if (terms.length > 1) {
      score += terms.length * RANKING_WEIGHTS.MULTI_TERM_BONUS
    }
  }

  return score
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const maxResults = PER_PAGE_LIMIT * MAX_PAGES // 60 total results (2 pages of 30)
  const { page, search, limit } = req.query
  const pageInt = Math.max(1, parseInt(page as string) || 1)
  const limitInt = Math.max(1, parseInt(limit as string) || PER_PAGE_LIMIT)

  if (pageInt > MAX_PAGES) {
    return res.status(400).json({ error: `Page cannot be greater than ${MAX_PAGES}` })
  }

  if (limitInt > PER_PAGE_LIMIT) {
    return res
      .status(400)
      .json({ error: `Limit cannot be greater than ${PER_PAGE_LIMIT}` })
  }

  if (!search || typeof search !== 'string' || search.trim().length === 0) {
    return res.status(400).json({ error: 'Search query required' })
  }

  const rawSearch = search.trim()

  if (rawSearch.length < MIN_SEARCH_LENGTH) {
    return res.status(400).json({
      error: `Search must be at least ${MIN_SEARCH_LENGTH} characters`,
    })
  }

  if (rawSearch.length > MAX_SEARCH_LENGTH) {
    return res.status(400).json({
      error: `Search must be less than ${MAX_SEARCH_LENGTH} characters`,
    })
  }

  // Determine which chains to search:
  // - If `chainIds` is provided, search only those chains
  // - If `chainIds` is NOT provided, search across ALL PUBLIC_DEFAULT_CHAINS.
  let chainsToSearch: Chain[] = [...PUBLIC_DEFAULT_CHAINS]

  // Validate and parse chainIds (comma-separated chain IDs)
  let chainIds: CHAIN_ID[] | undefined
  if (req.query.chainIds) {
    if (typeof req.query.chainIds !== 'string') {
      return res.status(400).json({ error: 'chainIds must be a comma-separated string' })
    }
    const ids = req.query.chainIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0)

    // Validate each chain ID
    const validChainIds = PUBLIC_DEFAULT_CHAINS.map((c) => c.id)
    for (const id of ids) {
      const parsed = Number(id)
      if (isNaN(parsed) || !validChainIds.includes(parsed)) {
        return res.status(400).json({ error: `Invalid chain ID format: ${id}` })
      }
    }

    const parsedIds = ids.map((id) => Number(id) as CHAIN_ID)
    chainIds = parsedIds.length > 0 ? parsedIds : undefined
  }

  if (chainIds && chainIds.length > 0) {
    chainsToSearch = chainIds.map((id) => PUBLIC_DEFAULT_CHAINS.find((x) => x.id === id)!)
  }

  try {
    // Transform the search query for GraphQL fulltext search
    const transformedSearch = buildSearchText(rawSearch)

    type SearchResult = { chain: Chain; daos: DaoSearchResult[] }

    const performSearch = async (searchQuery: string) => {
      const searchTasks = chainsToSearch.map((chain) => async () => {
        try {
          const searchRes = await searchDaosRequest(chain.id, searchQuery, maxResults, 0)

          return {
            chain,
            daos: searchRes?.daos || [],
          }
        } catch (error) {
          console.error(
            `Failed to fetch search results for chain ${chain.id}:`,
            error instanceof Error ? error.message : error
          )
          return {
            chain,
            daos: [],
          }
        }
      })

      // Fetch results for all selected chains in parallel.
      // Each call fetches up to `maxResults` from that chain.
      return await executeConcurrently<SearchResult>(searchTasks)
    }

    // First try with the transformed search
    let searchResults = await performSearch(transformedSearch)

    // If no results found and transformed search differs from raw search,
    // fallback to raw search
    const hasResults = searchResults.some((result) => result.daos.length > 0)
    if (!hasResults && transformedSearch !== rawSearch) {
      searchResults = await performSearch(rawSearch)
    }

    // Aggregate DAOs from all successful chain responses,
    // preserving chain metadata so we can rank by chain match.
    const allResults: {
      dao: DaoSearchResult
      chain: Chain
      dbIndex: number
    }[] = searchResults.flatMap(({ chain, daos }) =>
      daos.map((dao, index) => ({
        dao,
        chain,
        dbIndex: index,
      }))
    )

    // Rank and sort ALL results globally (across chains)
    const rankedDaos = allResults
      .map(({ dao, dbIndex }) => ({
        dao,
        rank: rankDao(dao, rawSearch, dbIndex),
      }))
      .sort((a, b) => b.rank - a.rank)

    // Calculate pagination indices
    const startIndex = (pageInt - 1) * limitInt
    const endIndex = startIndex + limitInt

    // Extract the requested page from globally-ranked results
    const paginatedDaos = rankedDaos.slice(startIndex, endIndex).map((item) => item.dao)

    // Check if there's a next page
    const hasNextPage = pageInt < MAX_PAGES && rankedDaos.length > endIndex

    const { maxAge, swr } = CACHE_TIMES.EXPLORE
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
    )

    const result = { daos: paginatedDaos, hasNextPage } as SearchDaosResponse

    return res.status(200).json(result)
  } catch (error) {
    console.error('Search error:', error instanceof Error ? error.message : error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors()(
  withRateLimit({
    keyPrefix: 'search',
  })(handler)
)
