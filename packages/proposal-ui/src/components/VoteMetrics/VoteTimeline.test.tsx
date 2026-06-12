import { ProposalVoteFragment, ProposalVoteSupport } from '@buildeross/sdk/subgraph'
import { render } from '@buildeross/test-fixtures'
import { fireEvent, screen } from '@testing-library/react'
import dayjs from 'dayjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { VoteTimeline } from './VoteTimeline'

const date = new Date(2022, 1, 1)
const voteStart = dayjs(date).subtract(1, 'day').unix()
const voteEnd = dayjs(date).add(1, 'day').unix()

const makeVote = (
  support: ProposalVoteSupport,
  weight: number,
  timestamp: unknown
): ProposalVoteFragment =>
  ({
    voter: `0x${support}${weight}`,
    support,
    weight,
    reason: null,
    timestamp,
  }) as ProposalVoteFragment

const votes: ProposalVoteFragment[] = [
  makeVote(ProposalVoteSupport.For, 2, String(voteStart + 600)),
  makeVote(ProposalVoteSupport.Against, 1, String(voteStart + 1_200)),
  makeVote(ProposalVoteSupport.For, 3, String(voteStart + 1_800)),
]

describe('VoteTimeline', () => {
  beforeEach(() => {
    vi.setSystemTime(date)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders three series polylines and the legend with cumulative totals', () => {
    render(<VoteTimeline votes={votes} voteStart={voteStart} voteEnd={voteEnd} />)

    expect(screen.getByTestId('vote-timeline')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-line-for')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-line-against')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-line-abstain')).toBeInTheDocument()
    expect(screen.getByText('For 5')).toBeInTheDocument()
    expect(screen.getByText('Against 1')).toBeInTheDocument()
    expect(screen.getByText('Abstain 0')).toBeInTheDocument()
  })

  it('renders the voting window bounds', () => {
    render(<VoteTimeline votes={votes} voteStart={voteStart} voteEnd={voteEnd} />)

    expect(
      screen.getByText(dayjs.unix(voteStart).format('MMM D, YYYY h:mm A'))
    ).toBeInTheDocument()
    expect(
      screen.getByText(dayjs.unix(voteEnd).format('MMM D, YYYY h:mm A'))
    ).toBeInTheDocument()
  })

  it('renders nothing when there are no votes', () => {
    render(<VoteTimeline votes={[]} voteStart={voteStart} voteEnd={voteEnd} />)

    expect(screen.queryByTestId('vote-timeline')).not.toBeInTheDocument()
  })

  it('renders nothing when votes lack timestamps', () => {
    const stale = [makeVote(ProposalVoteSupport.For, 1, undefined as never)]
    render(<VoteTimeline votes={stale} voteStart={voteStart} voteEnd={voteEnd} />)

    expect(screen.queryByTestId('vote-timeline')).not.toBeInTheDocument()
  })

  it('updates the legend on hover', () => {
    render(<VoteTimeline votes={votes} voteStart={voteStart} voteEnd={voteEnd} />)

    const svg = screen.getByTestId('vote-timeline').querySelector('svg') as SVGSVGElement
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 500,
      height: 220,
      right: 500,
      bottom: 220,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect)

    fireEvent.mouseMove(svg, { clientX: 0, clientY: 0 })

    expect(screen.getByText('For 0')).toBeInTheDocument()
    expect(screen.getByText('Against 0')).toBeInTheDocument()
  })
})
