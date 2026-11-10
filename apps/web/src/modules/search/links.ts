import type { GlobalSearchResult } from '@buildeross/sdk/subgraph'
import { chainIdToSlug } from '@buildeross/utils/chains'

/** Relative app URL for a global search result. */
export const getSearchResultHref = (result: GlobalSearchResult): string => {
  if (result.type === 'profile') return `/profile/${result.address}`

  const dao = `/dao/${chainIdToSlug(result.chainId)}/${result.dao.tokenAddress}`
  switch (result.type) {
    case 'dao':
      return dao
    case 'proposal':
      return `${dao}/vote/${result.proposalNumber}`
    case 'candidate':
      return `${dao}/candidate/${result.candidateNumber}`
    case 'vote':
      return `${dao}/vote/${result.proposalNumber}?tab=votes`
    case 'bid':
      return `${dao}/${result.tokenId}`
  }
}

export const getFullSearchHref = (
  query: string,
  opts: { type?: string; dao?: string; chainId?: number } = {}
): string => {
  const params = new URLSearchParams({ q: query })
  if (opts.type && opts.type !== 'all') params.set('type', opts.type)
  if (opts.dao && opts.chainId) {
    params.set('dao', opts.dao)
    params.set('chainId', String(opts.chainId))
  }
  return `/search?${params.toString()}`
}
