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
  activityDaoMeta,
  activityDaoNameRow,
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
  profileDashboardSection,
  profileDashboardSurface,
  profileEmptyState,
  profileNotice,
  profileSection,
  profileSectionHeader,
  profileSurface,
} from 'src/styles/profile.css'
import {
  classifyProfileActivity,
  getUnifiedProfileActivity,
  PROFILE_ACTIVITY_EVENT_TYPES,
  PROFILE_ACTIVITY_FILTER_OPTIONS,
  type ProfileActivityKind,
} from 'src/utils/profileDashboard'
import { formatEther } from 'viem'

import { ProfileActivityKindMenu } from './ProfileActivityKindMenu'
import { getProfileChainMetadata, ProfileChainIcon } from './ProfileChainIcon'

type ProfileActivityPanelProps = {
  profileAddress: AddressType
  selectedDaoKeys: string[]
  extraItems?: FeedItem[]
  partialChainNames?: string[]
}

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
  profileAddress,
  selectedDaoKeys,
  extraItems = [],
  partialChainNames = [],
}) => {
  const { getAuctionLink, getProposalLink } = useLinks()
  const [selectedKinds, setSelectedKinds] = React.useState<ProfileActivityKind[]>([])
  const selectedFilterLabel =
    selectedKinds.length === 1
      ? PROFILE_ACTIVITY_FILTER_OPTIONS.find(
          (option) => option.value === selectedKinds[0]
        )?.label
      : undefined
  const selectedFilters = selectedDaoKeys.map((key) => {
    const [chainId, address] = key.split(':')
    return { chainId: Number(chainId) as CHAIN_ID, address: address as AddressType }
  })
  const { items, hasMore, isLoading, isLoadingMore, error, fetchNextPage, refresh } =
    useFeed({
      actor: profileAddress,
      eventTypes: [...PROFILE_ACTIVITY_EVENT_TYPES] as FeedEventType[],
      daos: selectedFilters.length
        ? selectedFilters.map((filter) => filter.address)
        : undefined,
      chainIds: selectedFilters.length
        ? Array.from(new Set(selectedFilters.map((filter) => filter.chainId)))
        : undefined,
      limit: 10,
    })

  const displayedItems = React.useMemo(() => {
    return getUnifiedProfileActivity(
      items,
      extraItems,
      profileAddress,
      selectedDaoKeys,
      selectedKinds
    )
  }, [extraItems, items, profileAddress, selectedDaoKeys, selectedKinds])

  return (
    <section
      className={[profileSurface, profileDashboardSurface].join(' ')}
      aria-labelledby="profile-activity-heading"
    >
      <div className={[profileSection, profileDashboardSection].join(' ')}>
        <div className={profileSectionHeader}>
          <Text as="h2" id="profile-activity-heading" variant="heading-md">
            Activity
          </Text>
          <div className={activityHeaderControls}>
            <ProfileActivityKindMenu
              label="Filter activity"
              options={PROFILE_ACTIVITY_FILTER_OPTIONS}
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
          <div className={activityList} aria-busy="true" aria-label="Loading activity">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className={[activityRow, loadingSkeleton].join(' ')} />
            ))}
          </div>
        ) : error && !displayedItems.length ? (
          <div className={profileEmptyState} role="alert">
            <Text fontWeight="display">Unable to load activity</Text>
            <Text color="text3">Try again in a moment.</Text>
          </div>
        ) : !displayedItems.length ? (
          <div className={profileEmptyState} role="status">
            <Text fontWeight="display">
              {selectedKinds.length === 0
                ? 'No activity found'
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
          <div className={activityViewport} tabIndex={0} aria-label="Activity list">
            <div className={activityList}>
              {displayedItems.map((item) => {
                const classification = classifyProfileActivity(item, profileAddress)
                const vote = voteSupport(item)
                const chain = getProfileChainMetadata(item.chainId)
                const amount = amountLabel(item)
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
                      {amount ? <span className={activityMeta}>{amount}</span> : null}
                    </span>
                    <span className={activityDaoMeta}>
                      <span className={activityDaoNameRow}>
                        <span>{item.daoName}</span>
                        <ProfileChainIcon chainId={item.chainId} />
                      </span>
                      <span>{formatTimeAgo(item.timestamp)}</span>
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
