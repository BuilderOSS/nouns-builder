import { ProposalState } from '@buildeross/types'
import React from 'react'

import { statusBadgeVariants } from './StatusBadge.css'

const STATE_LABEL: Record<ProposalState, string> = {
  [ProposalState.Pending]: 'Pending',
  [ProposalState.Active]: 'Active',
  [ProposalState.Canceled]: 'Cancelled',
  [ProposalState.Defeated]: 'Defeated',
  [ProposalState.Succeeded]: 'Succeeded',
  [ProposalState.Queued]: 'Queued',
  [ProposalState.Expired]: 'Expired',
  [ProposalState.Executed]: 'Executed',
  [ProposalState.Vetoed]: 'Vetoed',
}

const STATE_VARIANT: Record<ProposalState, keyof typeof statusBadgeVariants> = {
  [ProposalState.Pending]: 'Pending',
  [ProposalState.Active]: 'Active',
  [ProposalState.Canceled]: 'Canceled',
  [ProposalState.Defeated]: 'Defeated',
  [ProposalState.Succeeded]: 'Succeeded',
  [ProposalState.Queued]: 'Queued',
  [ProposalState.Expired]: 'Expired',
  [ProposalState.Executed]: 'Executed',
  [ProposalState.Vetoed]: 'Vetoed',
}

export interface StatusBadgeProps {
  state: ProposalState
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ state, className }) => {
  const variant = STATE_VARIANT[state]
  return (
    <span className={[statusBadgeVariants[variant], className].filter(Boolean).join(' ')}>
      {STATE_LABEL[state]}
    </span>
  )
}
