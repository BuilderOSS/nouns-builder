/**
 * Minimal shape needed to rank a DAO search result.
 * Structural so both explore DAO results and global search results can use it.
 */
export type RankableDao = {
  dao: {
    name?: string | null
    symbol?: string | null
    description?: string | null
    projectURI?: string | null
  }
}

/**
 * Ranking weights for DAO search results.
 * These values control how different match types are scored.
 */
export const RANKING_WEIGHTS = {
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
 * @param dao DAO result object (anything with a `dao` of name/symbol/description/projectURI)
 * @param searchQuery Raw search string
 * @param index Original index from DB results (0 = top result)
 */
export function rankDao(dao: RankableDao, searchQuery: string, index: number): number {
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

/**
 * Ranking weights for text results (proposals, candidates, votes, bids).
 */
export const TEXT_RANKING_WEIGHTS = {
  EXACT_TITLE: 600,
  PREFIX_TITLE: 250,
  CONTAINS_TITLE: 150,
  CONTAINS_BODY: 40,
  DB_RANK_BASE: 100,
  DB_RANK_DECAY: 5,
  // Up to this many points for very recent items, decaying linearly over RECENCY_WINDOW
  RECENCY_MAX: 60,
  RECENCY_WINDOW_SECONDS: 60 * 60 * 24 * 365,
} as const

export type RankTextInput = {
  /** Primary text, e.g. a proposal title */
  title?: string | null
  /** Secondary text, e.g. a vote reason or bid comment */
  body?: string | null
  /** Unix timestamp (seconds) of the item */
  timestamp?: number
}

/**
 * Hybrid ranking for fulltext results that come from different indexes and chains.
 * Like rankDao, uses the subgraph position as a proxy for the DB relevance score.
 */
export function rankText(
  item: RankTextInput,
  searchQuery: string,
  index: number,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): number {
  const query = searchQuery.toLowerCase().trim()
  const terms = query.split(/\s+/).filter(Boolean)
  const title = item.title?.toLowerCase() || ''
  const body = item.body?.toLowerCase() || ''
  const W = TEXT_RANKING_WEIGHTS

  let score = Math.max(0, W.DB_RANK_BASE - index * W.DB_RANK_DECAY)

  if (title && title === query) {
    score += W.EXACT_TITLE
  } else {
    for (const term of terms) {
      if (title.startsWith(term)) score += W.PREFIX_TITLE
      else if (title.includes(term)) score += W.CONTAINS_TITLE
      if (body.includes(term)) score += W.CONTAINS_BODY
    }
  }

  if (item.timestamp && item.timestamp > 0) {
    const age = Math.max(0, nowSeconds - item.timestamp)
    const freshness = Math.max(0, 1 - age / W.RECENCY_WINDOW_SECONDS)
    score += Math.round(W.RECENCY_MAX * freshness)
  }

  return score
}
