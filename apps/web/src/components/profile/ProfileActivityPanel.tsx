import { useFeed } from '@buildeross/hooks'
import type { FeedEventType } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID, FeedItem } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { bgForAddress } from '@buildeross/utils'
import { formatTimeAgo } from '@buildeross/utils/formatTime'
import { Button, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'
import {
  activityDaoMeta,
  activityDaoNameRow,
  activityDaoNameText,
  activityHeaderControls,
  activityList,
  activityMeta,
  activityRow,
  activityRowContent,
  activityRowTitle,
  activityRowTitleRow,
  activityViewport,
  activityVoteAbstain,
  activityVoteAgainst,
  activityVoteFor,
  activityVoteSupport,
  loadingSkeleton,
  profileChainFallbackNoBackground,
  profileChainIconNoBackground,
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
  failedChainNames?: string[]
  truncatedChainNames?: string[]
}

const amountLabel = (item: FeedItem) => {
  if (item.type !== 'AUCTION_BID_PLACED' && item.type !== 'AUCTION_SETTLED') return null
  try {
    const value = formatEther(BigInt(item.amount))
    const [whole, rawDecimals = ''] = value.split('.')
    const truncated = rawDecimals.slice(0, 4).replace(/0+$/, '')
    const decimals =
      truncated || (Number(rawDecimals) > 0 ? rawDecimals.replace(/0+$/, '') : '')
    const formattedAmount = `${whole}${decimals ? `.${decimals}` : ''}`
    return `${formattedAmount} ETH`
  } catch {
    return null
  }
}

const tokenNameWithId = (tokenName: string, tokenId?: string) => {
  if (!tokenId) return tokenName
  const idPattern = new RegExp(`#\\s*${tokenId}\\b`, 'i')
  return idPattern.test(tokenName) ? tokenName : `${tokenName} #${tokenId}`
}

const itemTitle = (item: FeedItem, kind?: string) => {
  const proposalTitle =
    'proposalTitle' in item
      ? (item as { proposalTitle?: string }).proposalTitle
      : undefined
  const proposalNumber =
    'proposalNumber' in item
      ? (item as { proposalNumber?: number | string }).proposalNumber
      : undefined

  if (item.type === 'AUCTION_BID_PLACED') {
    const suffix = item.tokenId ? ` #${item.tokenId}` : ''
    return `Bid on ${item.tokenName}${suffix}`
  }

  if (item.type === 'AUCTION_SETTLED') {
    if (kind === 'win') {
      const amount = amountLabel(item)
      return `Won ${tokenNameWithId(item.tokenName, item.tokenId)}${amount ? ` for ${amount}` : ''}`
    }

    return `Settled ${tokenNameWithId(item.tokenName, item.tokenId)}`
  }

  if (item.type === 'PROPOSAL_CREATED')
    return `Proposal Created - ${proposalTitle || `Proposal ${proposalNumber}`}`

  if (item.type === 'PROPOSAL_EXECUTED')
    return `Proposal Executed - ${proposalTitle || `Proposal ${proposalNumber}`}`

  if (item.type === 'PROPOSAL_UPDATED')
    return `Proposal Updated - ${proposalTitle || `Proposal ${proposalNumber}`}`

  if (item.type === 'PROPOSAL_VOTED') return proposalTitle || `Proposal ${proposalNumber}`

  if (proposalTitle) return proposalTitle
  if (proposalNumber) return `Proposal ${proposalNumber}`
  return item.daoName
}

const voteSupport = (item: FeedItem) => {
  if (item.type !== 'PROPOSAL_VOTED') return null
  if (item.support === 'FOR') return { label: 'For', className: activityVoteFor }
  if (item.support === 'AGAINST')
    return { label: 'Against', className: activityVoteAgainst }
  return { label: 'Abstain', className: activityVoteAbstain }
}

export const ProfileActivityPanel: React.FC<ProfileActivityPanelProps> = ({
  profileAddress,
  selectedDaoKeys,
  extraItems = [],
  failedChainNames = [],
  truncatedChainNames = [],
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
          <Text as="h2" id="profile-activity-heading" variant="heading-sm">
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

        {failedChainNames.length ? (
          <div className={profileNotice} role="status">
            Partial data: {failedChainNames.join(', ')} could not be loaded.
          </div>
        ) : null}

        {truncatedChainNames.length ? (
          <div className={profileNotice} role="status">
            Partial data: {truncatedChainNames.join(', ')} reached the dashboard result
            limit.
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
          <div
            className={activityViewport}
            role="region"
            tabIndex={0}
            aria-label="Activity list"
          >
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
                const daoImage =
                  'tokenImage' in item && item.tokenImage
                    ? item.tokenImage
                    : item.daoImage
                const bg = bgForAddress(item.daoId)

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
                        background: daoImage ? undefined : bg,
                      }}
                    >
                      {daoImage && <FallbackImage src={daoImage} alt="" sizes="48px" />}
                    </span>
                    <span className={activityRowContent}>
                      <span className={activityRowTitleRow}>
                        <Text className={activityRowTitle} fontWeight="display">
                          {item.type === 'PROPOSAL_VOTED' ? 'Voted ' : ''}
                          {vote ? (
                            <span
                              className={[activityVoteSupport, vote.className].join(' ')}
                            >
                              {vote.label}
                            </span>
                          ) : null}
                          {item.type === 'PROPOSAL_VOTED' ? ' - ' : ''}
                          {itemTitle(item, classification?.kind)}
                        </Text>
                      </span>
                      {item.type === 'AUCTION_BID_PLACED' && amount ? (
                        <span className={activityMeta}>{amount}</span>
                      ) : null}
                    </span>
                    <span className={activityDaoMeta}>
                      <span className={activityDaoNameRow}>
                        <span className={activityDaoNameText}>{item.daoName}</span>
                        <ProfileChainIcon
                          chainId={item.chainId}
                          imageClassName={profileChainIconNoBackground}
                          fallbackClassName={profileChainFallbackNoBackground}
                        />
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
