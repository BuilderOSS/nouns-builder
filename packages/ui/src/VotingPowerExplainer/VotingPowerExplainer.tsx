import { Icon } from '@buildeross/zord'
import React from 'react'

import { body, iconWrap, scenarioVariants, title } from './VotingPowerExplainer.css'

export type VotingPowerScenario = 'eligible' | 'none' | 'delegated' | 'incoming' | 'pending'

export interface VotingPowerExplainerProps {
  scenario: VotingPowerScenario
  /** Number of votes the wallet holds at the snapshot block. */
  votingPower?: number
  /** Unix seconds — used by the `pending` scenario to display time until voting opens. */
  voteStart?: number
  className?: string
}

interface ScenarioContent {
  iconId: string
  titleText: string
  bodyText: string
}

function getContent(
  scenario: VotingPowerScenario,
  votingPower: number,
  voteStart?: number
): ScenarioContent {
  switch (scenario) {
    case 'pending':
      return {
        iconId: 'warning',
        titleText: 'Voting opens soon',
        bodyText: voteStart
          ? `Voting opens ${formatOpensIn(voteStart)}. Your voting power is locked in at that moment.`
          : "Voting hasn't opened yet. Your voting power is locked in when it does.",
      }
    case 'none':
      return {
        iconId: 'info16',
        titleText: "You can't vote on this proposal",
        bodyText: 'You held 0 tokens at the snapshot block.',
      }
    case 'delegated':
      return {
        iconId: 'arrowTopRight',
        titleText: 'Your votes are delegated',
        bodyText:
          'You hold tokens but have delegated voting power away. The delegate votes on your behalf.',
      }
    case 'incoming':
      return {
        iconId: 'warning',
        titleText: 'Incoming delegation',
        bodyText: 'An incoming delegation will become active soon.',
      }
    case 'eligible':
    default:
      return {
        iconId: 'check',
        titleText: 'You can vote',
        bodyText:
          votingPower > 0
            ? `You hold ${votingPower} ${votingPower === 1 ? 'vote' : 'votes'}, eligible to vote on this proposal.`
            : 'Eligible to vote on this proposal.',
      }
  }
}

function formatOpensIn(voteStart: number): string {
  const diff = voteStart - Math.floor(Date.now() / 1000)
  if (diff <= 0) return 'now'
  if (diff < 60) return `in ${diff}s`
  const m = Math.floor(diff / 60)
  if (m < 60) return `in ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `in ${h}h ${m % 60}m`
  const d = Math.floor(h / 24)
  return `in ${d}d ${h % 24}h`
}

export const VotingPowerExplainer: React.FC<VotingPowerExplainerProps> = ({
  scenario,
  votingPower = 0,
  voteStart,
  className,
}) => {
  const c = getContent(scenario, votingPower, voteStart)
  return (
    <div
      className={[scenarioVariants[scenario], className].filter(Boolean).join(' ')}
      role="status"
    >
      <div className={iconWrap}>
        <Icon id={c.iconId as Parameters<typeof Icon>[0]['id']} />
      </div>
      <div>
        <div className={title}>{c.titleText}</div>
        <div className={body}>{c.bodyText}</div>
      </div>
    </div>
  )
}
