import type { MyDaosResponse } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { DaoAvatar } from '@buildeross/ui/Avatar'
import { Button, Icon, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'
import {
  daoSelectorCard,
  daoSelectorCardActive,
  daoSelectorCardAvatar,
  daoSelectorChainBadge,
  daoSelectorCheck,
  daoSelectorFilterButton,
  daoSelectorHeaderActions,
  daoSelectorInfo,
  daoSelectorInfoButton,
  daoSelectorInfoTooltip,
  daoSelectorList,
  daoSelectorNameLink,
  profileSection,
  profileSectionHeader,
  profileSurface,
} from 'src/styles/profile.css'
import { createDaoKey } from 'src/utils/profileDashboard'

import { getProfileChainMetadata, ProfileChainIcon } from './ProfileChainIcon'

export {
  getProfileChainMetadata as getProfileDaoChainMetadata,
  ProfileChainIcon as ProfileDaoChainIcon,
} from './ProfileChainIcon'

type ProfileDaoSelectorProps = {
  daos?: MyDaosResponse
  isLoading: boolean
  selectedKeys: string[]
  onToggle: (daoKey: string) => void
  onClear: () => void
}

export const getProfileDaoChainLabel = (chainId: number) => {
  const chain = getProfileChainMetadata(chainId)
  if (!chain) return `Chain ${chainId}`
  return chain.id === CHAIN_ID.ETHEREUM
    ? chain.nativeCurrency?.symbol || chain.name
    : chain.name
}

export const ProfileDaoSelector: React.FC<ProfileDaoSelectorProps> = ({
  daos,
  isLoading,
  selectedKeys,
  onToggle,
  onClear,
}) => (
  <section className={profileSurface} aria-labelledby="profile-daos-heading">
    <div className={profileSection}>
      <div className={profileSectionHeader}>
        <Text as="h3" id="profile-daos-heading" variant="heading-md">
          DAOs
        </Text>
        <div className={daoSelectorHeaderActions}>
          <span className={daoSelectorInfo}>
            <button
              type="button"
              className={daoSelectorInfoButton}
              aria-label="How DAO cards work"
              aria-describedby="profile-dao-card-help"
            >
              i
            </button>
            <span
              id="profile-dao-card-help"
              className={daoSelectorInfoTooltip}
              role="tooltip"
            >
              Select a DAO name to open its page. Select anywhere else on a card to filter
              the profile.
            </span>
          </span>
          {selectedKeys.length > 0 ? (
            <Button size="sm" variant="outline" onClick={onClear}>
              Clear all
            </Button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className={daoSelectorList} aria-busy="true" aria-label="Loading DAOs">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className={daoSelectorCard} />
          ))}
        </div>
      ) : daos?.length ? (
        <div className={daoSelectorList} role="group" aria-label="Filter by DAO">
          {daos.map((dao) => {
            const daoKey = createDaoKey(dao.chainId, dao.collectionAddress)
            const isSelected = selectedKeys.includes(daoKey)
            const chain = getProfileChainMetadata(dao.chainId)
            return (
              <div
                key={daoKey}
                className={[daoSelectorCard, isSelected && daoSelectorCardActive]
                  .filter(Boolean)
                  .join(' ')}
              >
                <button
                  type="button"
                  className={daoSelectorFilterButton}
                  aria-label={`Filter activity by ${dao.name}`}
                  aria-pressed={isSelected}
                  onClick={() => onToggle(daoKey)}
                />
                <span className={daoSelectorCardAvatar}>
                  <DaoAvatar
                    collectionAddress={dao.collectionAddress}
                    auctionAddress={dao.auctionAddress}
                    chainId={dao.chainId}
                    size="40"
                  />
                </span>
                {chain ? (
                  <Link
                    className={daoSelectorNameLink}
                    href={`/dao/${chain.slug}/${dao.collectionAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open ${dao.name} in a new tab`}
                  >
                    <Text fontWeight="display" style={{ overflowWrap: 'anywhere' }}>
                      {dao.name}
                    </Text>
                  </Link>
                ) : (
                  <span className={daoSelectorNameLink}>
                    <Text fontWeight="display" style={{ overflowWrap: 'anywhere' }}>
                      {dao.name}
                    </Text>
                  </span>
                )}
                <span className={daoSelectorChainBadge}>
                  <ProfileChainIcon chainId={dao.chainId} />
                </span>
                {isSelected ? (
                  <span className={daoSelectorCheck} aria-hidden="true">
                    <Icon id="check" size="sm" />
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : (
        <Text color="text3">No DAO memberships found for this wallet.</Text>
      )}
    </div>
  </section>
)
