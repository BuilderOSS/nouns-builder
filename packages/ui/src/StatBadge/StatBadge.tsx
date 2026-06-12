import React from 'react'

import {
  statBadgeAccent,
  statBadgeDefault,
  statBadgeNegative,
  statBadgePositive,
} from './StatBadge.css'

export interface StatBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'positive' | 'negative' | 'accent'
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
  }[variant]

  return <span className={`${variantClass} ${className || ''}`}>{children}</span>
}
