import { fromSeconds } from '@buildeross/utils/helpers'
import { theme } from '@buildeross/zord'

import { ProposalState } from 'src/data/contract/requests/getProposalState'

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
    case ProposalState.Active:
    case ProposalState.Succeeded:
      return {
        borderColor: 'rgba(28, 182, 135, 0.1)',
        color: theme.colors.positive,
      }
    case ProposalState.Defeated:
      return {
        borderColor: 'rgba(240, 50, 50, 0.1)',
        color: theme.colors.negative,
      }
    case ProposalState.Executed:
      return {
        borderColor: 'rgba(37, 124, 237, 0.1)',
        color: '#257CED',
      }
    case ProposalState.Queued:
      return {
        borderColor: '#F2E2F7',
        color: '#D16BE1',
      }
    case ProposalState.Expired:
    default:
      return { borderColor: theme.colors.background2, color: theme.colors.text4 }
  }
}
