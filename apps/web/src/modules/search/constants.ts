import type { GlobalSearchType } from '@buildeross/sdk/subgraph'

export type SearchTab = 'all' | GlobalSearchType

export const SEARCH_GROUPS: { type: GlobalSearchType; label: string }[] = [
  { type: 'daos', label: 'DAOs' },
  { type: 'profiles', label: 'Profiles' },
  { type: 'proposals', label: 'Proposals' },
  { type: 'candidates', label: 'Candidates' },
  { type: 'votes', label: 'Votes' },
  { type: 'bids', label: 'Bids' },
]

export const SEARCH_TABS: { tab: SearchTab; label: string }[] = [
  { tab: 'all', label: 'All' },
  ...SEARCH_GROUPS.map(({ type, label }) => ({ tab: type, label })),
]

/** Results per group on the "All" tab of the palette */
export const PALETTE_ALL_LIMIT = 3
/** Results on a single-type tab of the palette */
export const PALETTE_TAB_LIMIT = 8
/** Results per page on the /search page */
export const PAGE_LIMIT = 20

export const isSearchTab = (value: unknown): value is SearchTab =>
  typeof value === 'string' && SEARCH_TABS.some((t) => t.tab === value)
