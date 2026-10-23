import {
  GLOBAL_SEARCH_MIN_LENGTH,
  useGlobalSearch,
} from '@buildeross/hooks/useGlobalSearch'
import type { GlobalSearchResult, GlobalSearchType } from '@buildeross/sdk/subgraph'
import { Icon } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  PALETTE_ALL_LIMIT,
  PALETTE_TAB_LIMIT,
  SEARCH_GROUPS,
  SEARCH_TABS,
  type SearchTab,
} from './constants'
import * as styles from './GlobalSearch.css'
import { getFullSearchHref, getSearchResultHref } from './links'
import { SearchResultRow } from './SearchResultRow'
import { useRecentSearches } from './useRecentSearches'
import { type SearchScope } from './useSearchScope'

type SearchPaletteProps = {
  open: boolean
  onClose: () => void
  /** Current DAO, when the palette is opened from a DAO page */
  daoScope?: SearchScope
}

const FOCUSABLE = 'button, [href], input, [tabindex]:not([tabindex="-1"])'

export const SearchPalette: React.FC<SearchPaletteProps> = ({
  open,
  onClose,
  daoScope,
}) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || !open) return null
  return createPortal(
    <PaletteDialog onClose={onClose} daoScope={daoScope} />,
    document.body
  )
}

const PaletteDialog: React.FC<Omit<SearchPaletteProps, 'open'>> = ({
  onClose,
  daoScope,
}) => {
  const router = useRouter()
  const listId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<SearchTab>('all')
  const [scoped, setScoped] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const { recent, add: addRecent, clear: clearRecent } = useRecentSearches()

  const scope = scoped ? daoScope : undefined
  // DAO and profile results don't apply inside a single DAO
  const visibleTabs = useMemo(
    () =>
      scope
        ? SEARCH_TABS.filter((t) => t.tab !== 'daos' && t.tab !== 'profiles')
        : SEARCH_TABS,
    [scope]
  )
  useEffect(() => {
    if (!visibleTabs.some((t) => t.tab === tab)) setTab('all')
  }, [visibleTabs, tab])

  const { data, error, isLoading, isValidating, isEmpty, searchText, isPreviousData } =
    useGlobalSearch(query, {
      types: tab === 'all' ? undefined : [tab],
      limit: tab === 'all' ? PALETTE_ALL_LIMIT : PALETTE_TAB_LIMIT,
      scope,
    })

  const groups = useMemo(() => {
    if (!data) return []
    return SEARCH_GROUPS.filter((g) => tab === 'all' || g.type === tab)
      .map((g) => ({
        ...g,
        items: data.results[g.type] as GlobalSearchResult[],
        hasMore: data.hasMore[g.type],
      }))
      .filter((g) => g.items.length > 0)
  }, [data, tab])

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups])

  useEffect(() => setActiveIndex(0), [data, tab])

  // Keep the active row in view while moving with the keyboard
  useEffect(() => {
    const el = resultsRef.current?.querySelector('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  // Lock page scroll and restore focus when the dialog closes
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.()
    }
  }, [])

  // Close when navigation starts (e.g. after selecting a result)
  useEffect(() => {
    router.events.on('routeChangeStart', onClose)
    return () => router.events.off('routeChangeStart', onClose)
  }, [router.events, onClose])

  const trimmed = query.trim()

  const openFullSearch = useCallback(() => {
    if (trimmed.length < GLOBAL_SEARCH_MIN_LENGTH) return
    addRecent(trimmed)
    router.push(
      getFullSearchHref(trimmed, {
        type: tab,
        dao: scope?.daoAddress,
        chainId: scope?.chainId,
      })
    )
  }, [trimmed, addRecent, router, tab, scope])

  const selectResult = useCallback(
    (result: GlobalSearchResult) => {
      addRecent(trimmed)
      router.push(getSearchResultHref(result))
    },
    [addRecent, trimmed, router]
  )

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key === 'Tab') {
      // Keep focus inside the dialog
      const focusables = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
      )
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
      return
    }
    if (event.target !== inputRef.current) return
    if (event.key === 'ArrowDown' && flat.length) {
      event.preventDefault()
      setActiveIndex((i) => (i + 1) % flat.length)
    } else if (event.key === 'ArrowUp' && flat.length) {
      event.preventDefault()
      setActiveIndex((i) => (i - 1 + flat.length) % flat.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      // Results still belong to an earlier query or filter: the debounce hasn't caught
      // up, or the request for the current query/tab/scope hasn't returned yet
      const isStale = searchText !== trimmed || isPreviousData
      if (event.metaKey || event.ctrlKey || isStale || !flat[activeIndex])
        openFullSearch()
      else selectResult(flat[activeIndex])
    }
  }

  const activeId = flat[activeIndex] ? `${listId}-${activeIndex}` : undefined
  let rowIndex = -1

  const renderBody = () => {
    if (trimmed.length < GLOBAL_SEARCH_MIN_LENGTH) {
      if (!recent.length) {
        return (
          <div className={styles.message}>
            Search DAOs, profiles, ENS names, proposals, candidates, votes and bids.
          </div>
        )
      }
      return (
        <>
          <div className={styles.groupHeader}>
            <span>Recent</span>
            <button type="button" className={styles.textButton} onClick={clearRecent}>
              Clear
            </button>
          </div>
          {recent.map((value) => (
            <button
              key={value}
              type="button"
              className={styles.row}
              style={{ border: 'none', background: 'none', textAlign: 'left' }}
              onClick={() => {
                setQuery(value)
                inputRef.current?.focus()
              }}
            >
              <span className={styles.rowMedia}>
                <Icon id="search" size="sm" fill="text3" />
              </span>
              <span className={styles.rowTitle}>{value}</span>
            </button>
          ))}
        </>
      )
    }
    if (error) {
      return <div className={styles.message}>Search failed. Try again in a moment.</div>
    }
    if (isLoading && !data) {
      return <div className={styles.message}>Searching…</div>
    }
    if (isEmpty) {
      return (
        <div className={styles.message}>
          No results for “{searchText}”{scope ? ' in this DAO' : ''}.
        </div>
      )
    }
    return groups.map((group) => (
      <div key={group.type} role="group" aria-label={group.label}>
        <div className={styles.groupHeader}>
          <span>{group.label}</span>
          {tab === 'all' && group.hasMore && (
            <button
              type="button"
              className={styles.textButton}
              onClick={() => setTab(group.type as GlobalSearchType)}
            >
              See all
            </button>
          )}
        </div>
        {group.items.map((item) => {
          rowIndex += 1
          const index = rowIndex
          return (
            <SearchResultRow
              key={item.id}
              id={`${listId}-${index}`}
              role="option"
              result={item}
              query={searchText}
              active={index === activeIndex}
              onHover={() => setActiveIndex(index)}
              onSelect={() => addRecent(trimmed)}
            />
          )
        })}
      </div>
    ))
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onKeyDown={onKeyDown}
      >
        <div className={styles.dialogInner}>
          <div className={styles.inputRow}>
            <Icon id="search" size="md" fill="text3" />
            <input
              ref={inputRef}
              className={styles.input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search DAOs, profiles, proposals, votes…"
              aria-label="Search"
              role="combobox"
              aria-expanded={flat.length > 0}
              aria-controls={listId}
              aria-activedescendant={activeId}
              aria-autocomplete="list"
              autoComplete="off"
              spellCheck={false}
            />
            {isValidating && <span className={styles.kbd}>…</span>}
            <button
              type="button"
              className={styles.textButton}
              onClick={onClose}
              aria-label="Close search"
            >
              <span className={styles.kbd}>Esc</span>
            </button>
          </div>

          <div className={styles.tabs} role="tablist" aria-label="Result type">
            {visibleTabs.map(({ tab: t, label }) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                className={styles.chip}
                onClick={() => {
                  setTab(t)
                  inputRef.current?.focus()
                }}
              >
                {label}
              </button>
            ))}
            {daoScope && (
              <>
                <span className={styles.chipDivider} aria-hidden="true" />
                <button
                  type="button"
                  aria-pressed={scoped}
                  className={styles.chip}
                  onClick={() => {
                    setScoped((s) => !s)
                    inputRef.current?.focus()
                  }}
                >
                  This DAO
                </button>
              </>
            )}
          </div>

          <div ref={resultsRef} className={styles.results} id={listId} role="listbox">
            {renderBody()}
          </div>

          <div className={styles.footer}>
            <span className={styles.footerHints}>
              <span className={styles.kbd}>↑</span>
              <span className={styles.kbd}>↓</span> navigate
              <span className={styles.kbd}>↵</span> open
              <span className={styles.kbd}>⌘↵</span> full search
            </span>
            <button
              type="button"
              className={styles.footerLink}
              onClick={openFullSearch}
              disabled={trimmed.length < GLOBAL_SEARCH_MIN_LENGTH}
            >
              Full search →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
