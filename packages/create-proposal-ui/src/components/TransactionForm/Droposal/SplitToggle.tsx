'use client'

import React from 'react'

import {
  card,
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
}

/**
 * Card-style toggle for enabling a revenue split on a droposal, matching the
 * app's card patterns instead of a bare button.
 */
export const SplitToggle: React.FC<SplitToggleProps> = ({ checked, onChange }) => (
  <div className={card}>
    <div className={textCol}>
      <span className={title}>Use revenue split</span>
      <span className={desc}>
        Share NFT sale proceeds &amp; royalties across multiple recipients.
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
