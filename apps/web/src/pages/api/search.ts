import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { type DaoSearchResult, searchDaosRequest } from '@buildeross/sdk/subgraph'
import { buildSearchText } from '@buildeross/utils/search'
import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'

const MIN_SEARCH_LENGTH = 3
const MAX_SEARCH_LENGTH = 100 // Prevent abuse
const PER_PAGE_LIMIT = 30
const MAX_PAGES = 2

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

  // --- BASE SCORE (preserve DB FTS rank) ---
  // Earlier items get higher initial score
  const BASE_MAX = 700
  const baseScore = BASE_MAX - index * 10 // Small decay per rank position

  let score = baseScore

  // --- DOMAIN BOOSTS (smaller than base to avoid overriding DB rank) ---
  const BOOST = {
    EXACT_NAME: 150,
    EXACT_SYMBOL: 130,
    STARTS_NAME: 90,
    STARTS_SYMBOL: 75,
    CONTAINS_NAME: 55,
    CONTAINS_SYMBOL: 45,
    DESCRIPTION: 20,
    URI: 10,
    MULTI_TERM: 5,
    POSITION_MAX: 25,
  } as const

  // Exact match priority
  if (name === query) return score + BOOST.EXACT_NAME
  if (symbol === query) return score + BOOST.EXACT_SYMBOL

  for (const term of terms) {
    if (name.startsWith(term)) score += BOOST.STARTS_NAME
    else if (name.includes(term)) score += BOOST.CONTAINS_NAME

    if (symbol.startsWith(term)) score += BOOST.STARTS_SYMBOL
    else if (symbol.includes(term)) score += BOOST.CONTAINS_SYMBOL

    if (description.includes(term)) score += BOOST.DESCRIPTION
    if (uri.includes(term)) score += BOOST.URI

    score += BOOST.MULTI_TERM
  }

  // Positional bonus: name match earlier = higher score
  const pos = name.indexOf(query)
  if (pos > 0) {
    score += Math.max(1, BOOST.POSITION_MAX - pos)
  }

  return score
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const maxResults = PER_PAGE_LIMIT * MAX_PAGES // 60 total results (2 pages of 30)
  const { page, search, network } = req.query
  const pageInt = Number.isFinite(Number(page))
    ? Math.max(1, Math.min(MAX_PAGES, Number(page)))
    : 1

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

    res.status(200).json({ daos: paginatedDaos, hasNextPage })
  } catch (error) {
    console.error('Search error:', error)
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
