import { ProposalState } from '@buildeross/sdk/contract'
import { fromSeconds } from '@buildeross/utils/helpers'
import { theme } from '@buildeross/zord'

export type ProposalStateColorStyle = {
  borderColor: string
  color: string
}

export const proposalStateColorStyles: Record<ProposalState, ProposalStateColorStyle> = {
  [ProposalState.Pending]: {
    borderColor: theme.colors.warningDisabled,
    color: theme.colors.warning,
  },
  [ProposalState.Active]: {
    borderColor: theme.colors.focusRing,
    color: theme.colors.focusRing,
  },
  [ProposalState.Canceled]: {
    borderColor: theme.colors.background2,
    color: theme.colors.text4,
  },
  [ProposalState.Defeated]: {
    borderColor: theme.colors.negativeDisabled,
    color: theme.colors.negative,
  },
  [ProposalState.Succeeded]: {
    borderColor: theme.colors.positiveDisabled,
    color: theme.colors.positive,
  },
  [ProposalState.Queued]: {
    borderColor: theme.colors.neutral,
    color: theme.colors.secondary,
  },
  [ProposalState.Expired]: {
    borderColor: theme.colors.background2,
    color: theme.colors.text4,
  },
  [ProposalState.Executed]: {
    borderColor: theme.colors.positiveDisabled,
    color: theme.colors.positive,
  },
  [ProposalState.Vetoed]: {
    borderColor: theme.colors.background2,
    color: theme.colors.text4,
  },
}

export const getProposalStateColorStyle = (
  state: ProposalState
): ProposalStateColorStyle =>
  proposalStateColorStyles[state] || proposalStateColorStyles[ProposalState.Expired]

export function formatTime(
  timediff: number,
  affix: string,
  isPrefix: boolean
): string | undefined {
  const timeObj = fromSeconds(timediff)

  const units = [
    { value: timeObj.days, label: 'day' },
    { value: timeObj.hours, label: 'hour' },
    { value: timeObj.minutes, label: 'minute' },
    { value: timeObj.seconds, label: 'second' },
  ]

  for (const unit of units) {
    if (unit.value && unit.value > 0) {
      const plural = unit.value > 1 ? `${unit.label}s` : unit.label
      return isPrefix
        ? `${affix} in ${unit.value} ${plural}`
        : `${unit.value} ${plural} ${affix}`
    }
  }

  return undefined
}

export function parseTime(timediff: number, prefix: string) {
  return formatTime(timediff, prefix, true)
}

export function parseState(state: ProposalState) {
  switch (state) {
    case ProposalState.Pending:
      return 'Pending'
    case ProposalState.Active:
      return 'Active'
    case ProposalState.Canceled:
      return 'Cancelled'
    case ProposalState.Defeated:
      return 'Defeated'
    case ProposalState.Succeeded:
      return 'Succeeded'
    case ProposalState.Queued:
      return 'Queued'
    case ProposalState.Expired:
      return 'Expired'
    case ProposalState.Executed:
      return 'Executed'
    case ProposalState.Vetoed:
      return 'Vetoed'
    default:
      return 'Loading'
  }
}

export function parseBgColor(state: ProposalState) {
  return getProposalStateColorStyle(state)
}
