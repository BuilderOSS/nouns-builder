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
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className={bottomNav}>
      <button
        className={`${navItem} ${activeTab === 'feed' ? navItemActive : ''}`}
        onClick={() => onTabChange('feed')}
        type="button"
      >
        <Icon id="collection" className={navItemIcon} />
        <span className={navItemLabel}>Home</span>
      </button>

      <button
        className={`${navItem} ${activeTab === 'create' ? navItemActive : ''}`}
        onClick={() => onTabChange('create')}
        type="button"
      >
        <Icon id="plus" className={navItemIcon} />
        <span className={navItemLabel}>Create</span>
      </button>

      <button
        className={`${navItem} ${activeTab === 'profile' ? navItemActive : ''}`}
        onClick={() => onTabChange('profile')}
        type="button"
      >
        <Icon id="sliders" className={navItemIcon} />
        <span className={navItemLabel}>Profile</span>
      </button>
    </nav>
  )
}
