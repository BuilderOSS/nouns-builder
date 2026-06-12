import { Box } from '@buildeross/zord'
import React from 'react'

import {
  statBadgeAccent,
  statBadgeActive,
  statBadgeDefault,
  statBadgeNegative,
  statBadgePositive,
} from './StatBadge.css'

export interface StatBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'positive' | 'negative' | 'accent' | 'active'
  className?: string
}

export const StatBadge: React.FC<StatBadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  const variantClass = {
    default: statBadgeDefault,
    positive: statBadgePositive,
    negative: statBadgeNegative,
    accent: statBadgeAccent,
    active: statBadgeActive,
  }[variant]

  return (
    <span className={`${variantClass} ${className || ''}`}>
      {variant === 'active' && (
        <Box
          as="span"
          aria-hidden
          borderRadius="round"
          backgroundColor="positive"
          style={{ width: 6, height: 6, flexShrink: 0 }}
        />
      )}
      {children}
    </span>
  )
}
