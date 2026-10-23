import {
  GLOBAL_SEARCH_MIN_LENGTH,
  useGlobalSearch,
} from '@buildeross/hooks/useGlobalSearch'
import type { GlobalSearchResult } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { Text } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'

import {
  isSearchTab,
  PAGE_LIMIT,
  PALETTE_ALL_LIMIT,
  SEARCH_GROUPS,
  SEARCH_TABS,
  type SearchTab,
} from './constants'
import * as styles from './GlobalSearch.css'
import { getFullSearchHref } from './links'
import { SearchResultRow } from './SearchResultRow'
import { useRecentSearches } from './useRecentSearches'
import { type SearchScope } from './useSearchScope'

const MAX_PAGES = 5

const readScope = (query: Record<string, unknown>): SearchScope | undefined => {
  const dao = query.dao
  const chainId = Number(query.chainId)
  if (typeof dao !== 'string' || !dao || !chainId) return undefined
  return { daoAddress: dao.toLowerCase(), chainId: chainId as CHAIN_ID }
}

export const SearchResultsPage: React.FC = () => {
  const router = useRouter()
  const urlQuery = typeof router.query.q === 'string' ? router.query.q : ''
  const tab: SearchTab = isSearchTab(router.query.type) ? router.query.type : 'all'
  const scope = useMemo(() => readScope(router.query), [router.query])
  const [input, setInput] = useState(urlQuery)
  const [page, setPage] = useState(1)
  const { add: addRecent } = useRecentSearches()

  useEffect(() => setInput(urlQuery), [urlQuery])
  useEffect(() => setPage(1), [urlQuery, tab, scope])

  const { data, error, isLoading, isEmpty, searchText } = useGlobalSearch(urlQuery, {
    debounceMs: 0,
    enabled: router.isReady,
    types: tab === 'all' ? undefined : [tab],
    limit: tab === 'all' ? PALETTE_ALL_LIMIT * 2 : PAGE_LIMIT,
    page: tab === 'all' ? 1 : page,
    scope,
  })

  const replace = (next: { q?: string; type?: SearchTab; clearScope?: boolean }) => {
    const href = getFullSearchHref(next.q ?? urlQuery, {
      type: next.type ?? tab,
      dao: next.clearScope ? undefined : scope?.daoAddress,
      chainId: next.clearScope ? undefined : scope?.chainId,
    })
    router.replace(href, undefined, { shallow: true })
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = input.trim()
    if (q.length < GLOBAL_SEARCH_MIN_LENGTH) return
    addRecent(q)
    replace({ q })
  }

  const tabs = scope
    ? SEARCH_TABS.filter((t) => t.tab !== 'daos' && t.tab !== 'profiles')
    : SEARCH_TABS
  const groups = SEARCH_GROUPS.filter((g) => tab === 'all' || g.type === tab)
    .map((g) => ({
      ...g,
      items: (data?.results[g.type] ?? []) as GlobalSearchResult[],
      hasMore: data?.hasMore[g.type] ?? false,
    }))
    .filter((g) => g.items.length > 0)

  return (
    <div className={styles.pageWrapper}>
      <Text as="h1" variant="heading-md" mb="x6">
        Search
      </Text>
      <form onSubmit={onSubmit} role="search">
        <input
          className={styles.pageInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search DAOs, profiles, ENS names, proposals, votes and bids"
          aria-label="Search"
          autoFocus={!urlQuery}
        />
      </form>

      <div className={styles.pageTabs} role="tablist" aria-label="Result type">
        {tabs.map(({ tab: t, label }) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={styles.chip}
            onClick={() => replace({ type: t })}
          >
            {label}
          </button>
        ))}
        {scope && (
          <>
            <span className={styles.chipDivider} aria-hidden="true" />
            <button
              type="button"
              aria-pressed="true"
              className={styles.chip}
              onClick={() => replace({ clearScope: true })}
              title="Search all DAOs"
            >
              This DAO ✕
            </button>
          </>
        )}
      </div>

      {data && data.failedChainIds.length > 0 && (
        <Text variant="paragraph-sm" color="text3" mb="x4">
          Some networks didn’t respond, so results may be incomplete.
        </Text>
      )}

      {!router.isReady ? null : urlQuery.trim().length < GLOBAL_SEARCH_MIN_LENGTH ? (
        <div className={styles.message}>
          Type at least {GLOBAL_SEARCH_MIN_LENGTH} characters to search.
        </div>
      ) : error ? (
        <div className={styles.message}>Search failed. Try again in a moment.</div>
      ) : isLoading && !data ? (
        <div className={styles.message}>Searching…</div>
      ) : isEmpty ? (
        <div className={styles.message}>No results for “{searchText}”.</div>
      ) : (
        groups.map((group) => (
          <section key={group.type} className={styles.pageSection}>
            <div className={styles.groupHeader}>
              <span>{group.label}</span>
              {tab === 'all' && group.hasMore && (
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => replace({ type: group.type })}
                >
                  See all
                </button>
              )}
            </div>
            {group.items.map((item) => (
              <SearchResultRow key={item.id} result={item} query={searchText} />
            ))}
            {tab !== 'all' && (page > 1 || group.hasMore) && (
              <div
                className={styles.footer}
                style={{ borderTop: 'none', justifyContent: 'center' }}
              >
                <button
                  type="button"
                  className={styles.textButton}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← Previous
                </button>
                <span>Page {page}</span>
                <button
                  type="button"
                  className={styles.textButton}
                  disabled={!group.hasMore || page >= MAX_PAGES}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        ))
      )}
    </div>
  )
}
