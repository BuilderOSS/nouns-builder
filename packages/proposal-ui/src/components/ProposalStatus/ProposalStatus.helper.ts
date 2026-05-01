import { ProposalState } from '@buildeross/sdk/contract'
import { fromSeconds } from '@buildeross/utils/helpers'
import { theme } from '@buildeross/zord'

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
  switch (state) {
    case ProposalState.Pending:
      return {
        borderColor: theme.colors.warningDisabled,
        color: theme.colors.warning,
      }
    case ProposalState.Active:
      return {
        borderColor: '#0085FF',
        color: '#0085FF',
      }
    case ProposalState.Succeeded:
      return {
        borderColor: theme.colors.positiveDisabled,
        color: theme.colors.positive,
      }
    case ProposalState.Defeated:
      return {
        borderColor: theme.colors.negativeDisabled,
        color: theme.colors.negative,
      }
    case ProposalState.Executed:
      return {
        borderColor: theme.colors.positiveDisabled,
        color: theme.colors.positive,
      }
    case ProposalState.Queued:
      return {
        borderColor: theme.colors.neutral,
        color: theme.colors.secondary,
      }
    case ProposalState.Expired:
    default:
      return { borderColor: theme.colors.background2, color: theme.colors.text4 }
  }
}
