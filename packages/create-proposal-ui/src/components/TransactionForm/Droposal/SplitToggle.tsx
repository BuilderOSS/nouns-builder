'use client'

import { Icon } from '@buildeross/zord'
import React from 'react'

import {
  card,
  cardActive,
  checkIcon,
  desc,
  knob,
  knobOn,
  textCol,
  title,
  track,
  trackOff,
  trackOn,
} from './SplitToggle.css'

export interface SplitToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Whether a split has been successfully deployed (shows green styling) */
  isActive?: boolean
}

/**
 * Card-style toggle for enabling a revenue split on a droposal, matching the
 * app's card patterns instead of a bare button.
 */
export const SplitToggle: React.FC<SplitToggleProps> = ({
  checked,
  onChange,
  isActive = false,
}) => (
  <div className={[card, isActive ? cardActive : ''].filter(Boolean).join(' ')}>
    <div className={textCol}>
      <span className={title}>
        {isActive && (
          <span className={checkIcon}>
            <Icon id="check" size="sm" />
          </span>
        )}
        Use revenue split
      </span>
      <span className={desc}>
        {isActive
          ? 'Revenue split is active - toggle off to remove.'
          : checked
            ? 'Configure recipients below, then create the split.'
            : 'Share NFT sale proceeds & royalties across multiple recipients.'}
      </span>
    </div>
    <button
      type={'button'}
      role={'switch'}
      aria-checked={checked}
      aria-label={'Use revenue split'}
      className={[track, checked ? trackOn : trackOff].join(' ')}
      onClick={() => onChange(!checked)}
    >
      <span className={[knob, checked ? knobOn : ''].filter(Boolean).join(' ')} />
    </button>
  </div>
)
