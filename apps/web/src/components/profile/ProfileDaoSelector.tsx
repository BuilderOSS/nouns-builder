import type { MyDaosResponse } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { Button, Text } from '@buildeross/zord'
import React from 'react'
import { ProfileDaoList } from 'src/components/ProfileDaoList'
import {
  profileDaoSurface,
  profileDashboardSection,
  profileDashboardSurface,
  profileSection,
  profileSurface,
} from 'src/styles/profile.css'
import { createDaoKey, isOwnProfileAddress } from 'src/utils/profileDashboard'
import { useAccount } from 'wagmi'

import { getProfileChainMetadata } from './ProfileChainIcon'

export {
  getProfileChainMetadata as getProfileDaoChainMetadata,
  ProfileChainIcon as ProfileDaoChainIcon,
} from './ProfileChainIcon'

type ProfileDaoSelectorProps = {
  daos?: MyDaosResponse
  isLoading: boolean
  profileAddress: string
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
  profileAddress,
  selectedKeys,
  onToggle,
  onClear,
}) => {
  const { address: connectedAddress } = useAccount()

  return (
    <section
      className={[profileSurface, profileDashboardSurface, profileDaoSurface].join(' ')}
      aria-label="DAOs"
    >
      <div className={[profileSection, profileDashboardSection].join(' ')}>
        {isLoading && !daos?.length ? (
          <div aria-busy="true" aria-label="Loading DAOs">
            <Text color="text3">Loading DAOs…</Text>
          </div>
        ) : daos?.length ? (
          <ProfileDaoList
            daos={daos}
            userAddress={profileAddress}
            isOwnProfile={isOwnProfileAddress(connectedAddress, profileAddress)}
            activeDaoKeys={selectedKeys}
            onDaoClick={(dao) =>
              onToggle(createDaoKey(dao.chainId, dao.collectionAddress))
            }
            headerAction={
              selectedKeys.length ? (
                <Button size="sm" variant="outline" onClick={onClear}>
                  Clear all
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <Text fontWeight="display">DAOs</Text>
            <Text color="text3">No DAO memberships found for this wallet.</Text>
          </>
        )}
      </div>
    </section>
  )
}
