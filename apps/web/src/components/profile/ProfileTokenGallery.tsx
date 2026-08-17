import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { Button, Icon, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'
import {
  activityKindDropdown,
  compactFilterChevron,
  compactFilterSelect,
  loadingSkeleton,
  profileEmptyState,
  profileNotice,
  profileSection,
  profileSectionHeader,
  profileSurface,
  tokenCard,
  tokenCardBody,
  tokenCardMeta,
  tokenGrid,
  tokenGridItem,
  tokenGridViewport,
  tokenGridViewportLocked,
} from 'src/styles/profile.css'
import {
  filterProfileTokens,
  getInitialProfileTokenVisibleCount,
  type ProfileToken,
} from 'src/utils/profileDashboard'
import type { TokenSortOption } from 'src/utils/profileIdentity'

import { ProfileChainIcon } from './ProfileChainIcon'

type ProfileTokenGalleryProps = {
  tokens: ProfileToken[]
  isLoading: boolean
  selectedDaoKeys: string[]
  sort: TokenSortOption
  onSortChange: (sort: TokenSortOption) => void
  failedChainNames: string[]
  truncatedChainNames: string[]
  onRetry: () => void
}

const sortTokens = (tokens: ProfileToken[], sort: TokenSortOption) =>
  [...tokens].sort((left, right) => {
    if (sort === 'oldest') return Number(left.mintedAt) - Number(right.mintedAt)
    if (sort === 'dao-name-asc') return left.daoName.localeCompare(right.daoName)
    if (sort === 'token-id-asc') return Number(left.tokenId) - Number(right.tokenId)
    if (sort === 'token-id-desc') return Number(right.tokenId) - Number(left.tokenId)
    return Number(right.mintedAt) - Number(left.mintedAt)
  })

export const ProfileTokenGallery: React.FC<ProfileTokenGalleryProps> = ({
  tokens,
  isLoading,
  selectedDaoKeys,
  sort,
  onSortChange,
  failedChainNames,
  truncatedChainNames,
  onRetry,
}) => {
  const filteredTokens = React.useMemo(
    () => sortTokens(filterProfileTokens(tokens, selectedDaoKeys), sort),
    [selectedDaoKeys, sort, tokens]
  )
  const [visibleCount, setVisibleCount] = React.useState(() =>
    getInitialProfileTokenVisibleCount(filteredTokens.length)
  )
  const [isViewportLocked, setIsViewportLocked] = React.useState(false)
  const [viewportHeight, setViewportHeight] = React.useState<number | null>(null)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const gridRef = React.useRef<HTMLUListElement>(null)
  const initialBoundaryRef = React.useRef<HTMLAnchorElement>(null)
  const initialVisibleCount = getInitialProfileTokenVisibleCount(filteredTokens.length)
  const daoFilterKey = selectedDaoKeys.join(',')

  const measureInitialViewport = React.useCallback(() => {
    const grid = gridRef.current
    const boundary = initialBoundaryRef.current
    if (!grid || !boundary) return

    const height = Math.ceil(
      boundary.getBoundingClientRect().bottom - grid.getBoundingClientRect().top
    )
    if (height > 0)
      setViewportHeight((current) => (current === height ? current : height))
  }, [])

  React.useLayoutEffect(() => {
    setVisibleCount(initialVisibleCount)
    setIsViewportLocked(false)
    setViewportHeight(null)
    if (viewportRef.current) viewportRef.current.scrollTop = 0
  }, [daoFilterKey, initialVisibleCount, sort])

  React.useLayoutEffect(() => {
    if (!isViewportLocked) return

    measureInitialViewport()
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measureInitialViewport)
    if (gridRef.current) resizeObserver?.observe(gridRef.current)
    if (initialBoundaryRef.current) resizeObserver?.observe(initialBoundaryRef.current)
    window.addEventListener('resize', measureInitialViewport)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', measureInitialViewport)
    }
  }, [isViewportLocked, measureInitialViewport])

  const loadMore = () => {
    measureInitialViewport()
    setIsViewportLocked(true)
    setVisibleCount((count) => Math.min(filteredTokens.length, count + 32))
  }

  return (
    <section className={profileSurface} aria-labelledby="profile-tokens-heading">
      <div className={profileSection}>
        <div className={profileSectionHeader}>
          <Text as="h3" id="profile-tokens-heading" variant="heading-md">
            Tokens held
          </Text>
          <label className={activityKindDropdown}>
            <span
              style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}
            >
              Sort tokens
            </span>
            <select
              className={compactFilterSelect}
              value={sort}
              onChange={(event) => onSortChange(event.target.value as TokenSortOption)}
              aria-label="Sort tokens"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="dao-name-asc">DAO name</option>
              <option value="token-id-asc">Token ID ascending</option>
              <option value="token-id-desc">Token ID descending</option>
            </select>
            <span className={compactFilterChevron} aria-hidden="true">
              <Icon id="chevron-down" fill="tertiary" pointerEvents="none" />
            </span>
          </label>
        </div>

        {failedChainNames.length ? (
          <div className={profileNotice} role="status">
            Some chains are unavailable ({failedChainNames.join(', ')}). Successful chain
            results are still shown.{' '}
            <button type="button" onClick={onRetry}>
              Retry
            </button>
          </div>
        ) : null}

        {truncatedChainNames.length ? (
          <div className={profileNotice} role="status">
            Some chains reached the dashboard result limit (
            {truncatedChainNames.join(', ')}). Results shown may be incomplete.
          </div>
        ) : null}

        {isLoading && !tokens.length ? (
          <div className={tokenGrid} aria-busy="true" aria-label="Loading tokens">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className={[tokenCard, loadingSkeleton].join(' ')}
                style={{ aspectRatio: '1 / 1.25' }}
              />
            ))}
          </div>
        ) : !filteredTokens.length ? (
          <div className={profileEmptyState} role="status">
            <Text fontWeight="display">
              {selectedDaoKeys.length
                ? 'No tokens match these DAOs'
                : 'No DAO tokens held'}
            </Text>
            <Text color="text3">
              {selectedDaoKeys.length
                ? 'Clear the DAO filter to see tokens from every supported chain.'
                : 'Tokens currently owned by this wallet will appear here.'}
            </Text>
          </div>
        ) : (
          <>
            <div
              ref={viewportRef}
              className={[tokenGridViewport, isViewportLocked && tokenGridViewportLocked]
                .filter(Boolean)
                .join(' ')}
              role="region"
              aria-label="Tokens held gallery"
              tabIndex={isViewportLocked ? 0 : undefined}
              style={
                isViewportLocked && viewportHeight
                  ? { height: `${viewportHeight}px` }
                  : undefined
              }
            >
              <ul ref={gridRef} className={tokenGrid}>
                {filteredTokens.slice(0, visibleCount).map((token, index) => (
                  <li
                    key={`${token.chainId}:${token.tokenContract}:${token.tokenId}`}
                    className={tokenGridItem}
                  >
                    <Link
                      ref={
                        index === initialVisibleCount - 1 ? initialBoundaryRef : undefined
                      }
                      href={`/dao/${token.chainSlug}/${token.tokenContract}/${token.tokenId}`}
                      className={tokenCard}
                    >
                      <div style={{ aspectRatio: '1 / 1', position: 'relative' }}>
                        <FallbackImage src={token.image} alt={token.name} sizes="25vw" />
                      </div>
                      <div className={tokenCardBody}>
                        <Text fontWeight="display">{token.name}</Text>
                        <span className={tokenCardMeta}>
                          <Text color="text3" fontSize="12">
                            {token.daoName}
                          </Text>
                          <ProfileChainIcon chainId={token.chainId} />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {visibleCount < filteredTokens.length ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                <Button size="sm" variant="outline" onClick={loadMore}>
                  Load more
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
