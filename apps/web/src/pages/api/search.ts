import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import {
  type DaoSearchResult,
  searchDaosRequest,
  type SearchDaosResponse,
} from '@buildeross/sdk/subgraph'
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

  // Exact matches (highest priority)
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
  const { page, search, network } = req.query
  const pageInt = Math.max(1, parseInt(page as string) || 1)

  if (pageInt > MAX_PAGES) {
    return res.status(400).json({ error: `Page cannot be greater than ${MAX_PAGES}` })
  }

  const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.slug === network)

  if (!chain) {
    return res.status(404).json({ error: 'Network not found' })
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

  try {
    // Transform the search query for GraphQL fulltext search
    const transformedSearch = buildSearchText(rawSearch)

    // Fetch all results up to maxResults to ensure consistent ranking across pages
    // This is necessary because we need to rank globally before paginating
    const searchRes = await searchDaosRequest(chain.id, transformedSearch, maxResults, 0)

    if (!searchRes) {
      return res.status(500).json({ error: 'Search failed' })
    }

    // Rank and sort ALL results globally
    const rankedDaos = searchRes.daos
      .map((dao, index) => ({
        dao,
        rank: rankDao(dao, rawSearch, index),
      }))
      .sort((a, b) => b.rank - a.rank)

    // Calculate pagination indices
    const startIndex = (pageInt - 1) * PER_PAGE_LIMIT
    const endIndex = startIndex + PER_PAGE_LIMIT

    // Extract the requested page from globally-ranked results
    const paginatedDaos = rankedDaos.slice(startIndex, endIndex).map((item) => item.dao)

    // Check if there's a next page
    // We cap at maxPages (2), so page 2 never has a next page
    // For page 1, check if there are more results in the ranked list
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
    maxRequests: 30,
    windowSeconds: 60, // 30 requests per minute
    keyPrefix: 'search',
  })(handler)
)
