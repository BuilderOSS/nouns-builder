'use client'

import { Icon } from '@buildeross/zord'
import React, { useState } from 'react'

import { content, dismissButton, iconSlot, toneVariants } from './TimeAlert.css'

export type TimeAlertTone = 'accent' | 'warning' | 'negative'

export interface TimeAlertProps {
  /** Icon to display; defaults to a clock/warning icon. Pass `null` to suppress. */
  icon?: React.ReactNode | null
  tone?: TimeAlertTone
  /** When true, renders a dismiss (×) button. */
  dismissible?: boolean
  children: React.ReactNode
  className?: string
}

export const TimeAlert: React.FC<TimeAlertProps> = ({
  icon,
  tone = 'accent',
  dismissible = false,
  children,
  className,
}) => {
  const [open, setOpen] = useState(true)
  if (!open) return null

  const defaultIcon = <Icon id="warning16" />

  return (
    <div
      className={[toneVariants[tone], className].filter(Boolean).join(' ')}
      role="status"
    >
      {icon !== null && (
        <span className={iconSlot}>{icon ?? defaultIcon}</span>
      )}
      <span className={content}>{children}</span>
      {dismissible && (
        <button
          type="button"
          className={dismissButton}
          aria-label="Dismiss"
          onClick={() => setOpen(false)}
        >
          <Icon id="cross16" />
        </button>
      )}
    </div>
  )
}
