import React from 'react'

import { activeBadgeVariants, dot } from './ActiveBadge.css'

export interface ActiveBadgeProps {
  /** True when member voted on at least one of the last N proposals. */
  active: boolean
  className?: string
}

export const ActiveBadge: React.FC<ActiveBadgeProps> = ({ active, className }) => {
  const variant = active ? 'active' : 'dormant'
  return (
    <span className={[activeBadgeVariants[variant], className].filter(Boolean).join(' ')}>
      <span className={dot[variant]} aria-hidden />
      {active ? 'Active' : 'Dormant'}
    </span>
  )
}
