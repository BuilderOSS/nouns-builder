import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { useFeed } from '@buildeross/hooks'
import type { FeedEventType } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID, FeedItem } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { formatTimeAgo } from '@buildeross/utils/formatTime'
import { Button, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'
import {
  activityBadge,
  activityBadgeRow,
  activityHeaderControls,
  activityList,
  activityMeta,
  activityRow,
  activityRowContent,
  activityViewport,
  activityVoteAbstain,
  activityVoteAgainst,
  activityVoteFor,
  activityVoteSupport,
  loadingSkeleton,
  profileEmptyState,
  profileNotice,
  profileSection,
  profileSectionHeader,
  profileSurface,
} from 'src/styles/profile.css'
import {
  AUCTION_ACTIVITY_FILTER_OPTIONS,
  classifyProfileActivity,
  filterProfileActivity,
  filterProfileActivityByKinds,
  GOVERNANCE_ACTIVITY_FILTER_OPTIONS,
  type ProfileActivityGroup,
  type ProfileActivityKind,
} from 'src/utils/profileDashboard'
import { formatEther } from 'viem'

import { ProfileActivityKindMenu } from './ProfileActivityKindMenu'

type ProfileActivityPanelProps = {
  title: string
  group: ProfileActivityGroup
  profileAddress: AddressType
  eventTypes: FeedEventType[]
  selectedDaoKeys: string[]
  extraItems?: FeedItem[]
  partialChainNames?: string[]
}

const chainById = new Map(PUBLIC_DEFAULT_CHAINS.map((chain) => [chain.id, chain]))

const amountLabel = (item: FeedItem) => {
  if (item.type !== 'AUCTION_BID_PLACED' && item.type !== 'AUCTION_SETTLED') return null
  try {
    return `${Number(formatEther(BigInt(item.amount))).toLocaleString('en-US', {
      maximumFractionDigits: 4,
    })} ETH`
  } catch {
    return null
  }
}

const itemTitle = (item: FeedItem, kind?: string) => {
  if (item.type === 'AUCTION_BID_PLACED') return `Bid on ${item.tokenName}`
  if (item.type === 'AUCTION_SETTLED')
    return kind === 'win' ? `Won ${item.tokenName}` : `Settled ${item.tokenName}`
  if ('proposalTitle' in item)
    return item.proposalTitle || `Proposal ${item.proposalNumber}`
  return item.daoName
}

const voteSupport = (item: FeedItem) => {
  if (item.type !== 'PROPOSAL_VOTED') return null
  if (item.support === 'FOR') return { label: 'For', className: activityVoteFor }
  if (item.support === 'AGAINST')
    return { label: 'Against', className: activityVoteAgainst }
  return { label: 'Abstained', className: activityVoteAbstain }
}

export const ProfileActivityPanel: React.FC<ProfileActivityPanelProps> = ({
  title,
  group,
  profileAddress,
  eventTypes,
  selectedDaoKeys,
  extraItems = [],
  partialChainNames = [],
}) => {
  const { getAuctionLink, getProposalLink } = useLinks()
  const [selectedKinds, setSelectedKinds] = React.useState<ProfileActivityKind[]>([])
  const filterOptions =
    group === 'auction'
      ? AUCTION_ACTIVITY_FILTER_OPTIONS
      : GOVERNANCE_ACTIVITY_FILTER_OPTIONS
  const selectedFilterLabel =
    selectedKinds.length === 1
      ? filterOptions.find((option) => option.value === selectedKinds[0])?.label
      : undefined
  const selectedFilters = selectedDaoKeys.map((key) => {
    const [chainId, address] = key.split(':')
    return { chainId: Number(chainId) as CHAIN_ID, address: address as AddressType }
  })
  const { items, hasMore, isLoading, isLoadingMore, error, fetchNextPage, refresh } =
    useFeed({
      actor: profileAddress,
      eventTypes,
      daos: selectedFilters.length
        ? selectedFilters.map((filter) => filter.address)
        : undefined,
      chainIds: selectedFilters.length
        ? Array.from(new Set(selectedFilters.map((filter) => filter.chainId)))
        : undefined,
      limit: 10,
    })

  const displayedItems = React.useMemo(() => {
    const unique = new Map<string, FeedItem>()
    ;[...items, ...extraItems].forEach((item) =>
      unique.set(`${item.chainId}:${item.id}`, item)
    )
    const daoFilteredItems = filterProfileActivity(
      Array.from(unique.values()).sort((a, b) => b.timestamp - a.timestamp),
      profileAddress,
      group,
      selectedDaoKeys
    )
    return filterProfileActivityByKinds(daoFilteredItems, profileAddress, selectedKinds)
  }, [extraItems, group, items, profileAddress, selectedDaoKeys, selectedKinds])

  return (
    <section className={profileSurface} aria-labelledby={`profile-${group}-heading`}>
      <div className={profileSection}>
        <div className={profileSectionHeader}>
          <Text as="h3" id={`profile-${group}-heading`} variant="heading-md">
            {title}
          </Text>
          <div className={activityHeaderControls}>
            <ProfileActivityKindMenu
              label={`Filter ${title.toLowerCase()}`}
              options={filterOptions}
              selectedKinds={selectedKinds}
              onChange={setSelectedKinds}
            />
            {error ? (
              <Button size="sm" variant="outline" onClick={() => refresh()}>
                Retry
              </Button>
            ) : null}
          </div>
        </div>

        {partialChainNames.length ? (
          <div className={profileNotice} role="status">
            Partial data: {partialChainNames.join(', ')} could not be loaded.
          </div>
        ) : null}

        {isLoading && !displayedItems.length ? (
          <div className={activityList} aria-busy="true" aria-label={`Loading ${title}`}>
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className={[activityRow, loadingSkeleton].join(' ')} />
            ))}
          </div>
        ) : error && !displayedItems.length ? (
          <div className={profileEmptyState} role="alert">
            <Text fontWeight="display">Unable to load {title.toLowerCase()}</Text>
            <Text color="text3">Try again in a moment.</Text>
          </div>
        ) : !displayedItems.length ? (
          <div className={profileEmptyState} role="status">
            <Text fontWeight="display">
              {selectedKinds.length === 0
                ? `No ${title.toLowerCase()} found`
                : selectedFilterLabel
                  ? `No ${selectedFilterLabel.toLowerCase()} found`
                  : 'No selected activity found'}
            </Text>
            <Text color="text3">
              {selectedKinds.length > 0
                ? 'No activity of this type matches the current DAO filter.'
                : selectedDaoKeys.length
                  ? 'No activity matches the selected DAOs.'
                  : 'Activity from this wallet will appear here.'}
            </Text>
            {hasMore ? (
              <Button
                size="sm"
                variant="outline"
                disabled={isLoadingMore}
                onClick={() => fetchNextPage()}
              >
                {isLoadingMore ? 'Loading…' : 'Load more activity'}
              </Button>
            ) : null}
          </div>
        ) : (
          <div className={activityViewport} tabIndex={0} aria-label={`${title} list`}>
            <div className={activityList}>
              {displayedItems.map((item) => {
                const classification = classifyProfileActivity(item, profileAddress)
                const vote = voteSupport(item)
                const chain = chainById.get(item.chainId)
                const href =
                  'proposalNumber' in item
                    ? getProposalLink(
                        item.chainId,
                        item.daoId,
                        item.proposalNumber,
                        'details'
                      ).href
                    : 'tokenId' in item
                      ? getAuctionLink(item.chainId, item.daoId, item.tokenId).href
                      : `/dao/${chain?.slug}/${item.daoId}`
                return (
                  <Link
                    key={`${item.chainId}:${item.id}`}
                    href={href}
                    className={activityRow}
                  >
                    <span
                      style={{
                        width: 48,
                        height: 48,
                        flexShrink: 0,
                        overflow: 'hidden',
                        borderRadius: 8,
                      }}
                    >
                      <FallbackImage
                        src={
                          'tokenImage' in item && item.tokenImage
                            ? item.tokenImage
                            : item.daoImage
                        }
                        alt=""
                        sizes="48px"
                      />
                    </span>
                    <span className={activityRowContent}>
                      <span className={activityBadgeRow}>
                        <span className={activityBadge}>{classification?.kind}</span>
                        {vote ? (
                          <span
                            className={[activityVoteSupport, vote.className].join(' ')}
                          >
                            {vote.label}
                          </span>
                        ) : null}
                      </span>
                      <Text fontWeight="display" style={{ overflowWrap: 'anywhere' }}>
                        {itemTitle(item, classification?.kind)}
                      </Text>
                      <span className={activityMeta}>
                        <span>{item.daoName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatTimeAgo(item.timestamp)}</span>
                        {amountLabel(item) ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{amountLabel(item)}</span>
                          </>
                        ) : null}
                      </span>
                    </span>
                  </Link>
                )
              })}
              {hasMore ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLoadingMore}
                  onClick={() => fetchNextPage()}
                >
                  {isLoadingMore ? 'Loading…' : 'Load more'}
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
