import type { AddressType } from '@buildeross/types'
import { Avatar } from '@buildeross/ui'
import { Icon } from '@buildeross/zord'
import React from 'react'

import {
  bottomNav,
  navItem,
  navItemActive,
  navItemIcon,
  navItemLabel,
} from './MobileBottomNav.css'

export type MobileTab = 'feed' | 'create' | 'profile'

export interface MobileBottomNavProps {
  activeTab: MobileTab
  onTabChange: (tab: MobileTab) => void
  address?: AddressType
  ensAvatar?: string
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  address,
  ensAvatar,
}) => {
  return (
    <nav className={bottomNav}>
      <button
        className={`${navItem} ${activeTab === 'feed' ? navItemActive : ''}`}
        onClick={() => onTabChange('feed')}
        type="button"
        aria-label="Home"
        aria-current={activeTab === 'feed' ? 'page' : undefined}
      >
        <Icon id="noggles" className={navItemIcon} />
        <span className={navItemLabel}>Home</span>
      </button>

      <button
        className={`${navItem} ${activeTab === 'create' ? navItemActive : ''}`}
        onClick={() => onTabChange('create')}
        type="button"
        aria-label="Create"
        aria-current={activeTab === 'create' ? 'page' : undefined}
      >
        <Icon id="plus" className={navItemIcon} />
        <span className={navItemLabel}>Create</span>
      </button>

      <button
        className={`${navItem} ${activeTab === 'profile' ? navItemActive : ''}`}
        onClick={() => onTabChange('profile')}
        type="button"
        aria-label="Profile"
        aria-current={activeTab === 'profile' ? 'page' : undefined}
      >
        <Avatar address={address} src={ensAvatar} size="24" className={navItemIcon} />
        <span className={navItemLabel}>Profile</span>
      </button>
    </nav>
  )
}
