import { Proposal } from '@buildeross/sdk/subgraph'
import { handleGMTOffset } from '@buildeross/utils/helpers'
import { Box, Grid } from '@buildeross/zord'
import dayjs from 'dayjs'
import React, { useCallback } from 'react'
import { propDataGrid } from 'src/styles/Proposals.css'

import { Tile } from './Tile'
import { voteProgress, voteProgressVariants } from './Tile.css'

export type ProposalDetailsGridProps = {
  proposal: Proposal
}

export const ProposalDetailsGrid: React.FC<ProposalDetailsGridProps> = ({ proposal }) => {
  const {
    forVotes,
    againstVotes,
    abstainVotes,
    quorumVotes,
    snapshotBlockNumber,
    voteEnd,
  } = proposal

  const calculateProgress = useCallback(
    (votes: number) => {
      const denominator = forVotes + againstVotes + abstainVotes
      const numerator = (votes / denominator) * 100
      return denominator > 0 ? (numerator > 100 ? 100 : numerator) : 0
    },
    [forVotes, againstVotes, abstainVotes]
  )

  const voteType = React.useMemo(() => {
    return [
      {
        title: 'For',
        votes: forVotes,
        progress: calculateProgress(forVotes),
      },
      {
        title: 'Against',
        votes: againstVotes,
        progress: calculateProgress(againstVotes),
      },
      {
        title: 'Abstain',
        votes: abstainVotes,
        progress: calculateProgress(abstainVotes),
      },
    ]
  }, [forVotes, abstainVotes, againstVotes, calculateProgress])

  return (
    <>
      <Grid columns={'1fr 1fr 1fr'} gap={{ '@initial': 'x2', '@768': 'x4' }}>
        {voteType?.map((vote, i) => {
          return (
            <Tile
              key={i}
              title={vote.title}
              subtitle={vote.votes}
              variant={
                vote.progress
                  ? (vote.title.toLowerCase() as keyof typeof voteProgressVariants)
                  : 'abstain'
              }
            >
              <Box className={voteProgress} w={'100%'} mt={'x4'}>
                <Box
                  className={
                    voteProgressVariants[
                      vote.title.toLowerCase() as keyof typeof voteProgressVariants
                    ]
                  }
                  style={{ width: `${vote.progress}%` }}
                />
              </Box>
            </Tile>
          )
        })}
      </Grid>
      <Grid className={propDataGrid}>
        <Tile
          title={'Threshold'}
          subtitle={`${quorumVotes} ${Number(quorumVotes) === 1 ? 'vote' : 'votes'}`}
          subtext={'Current threshold'}
        />
        <Tile
          title={((Date.now() / 1000) | 0) >= voteEnd ? 'Ended' : 'Ending'}
          subtitle={dayjs(dayjs.unix(voteEnd)).format('MMM, D, YYYY')}
          subtext={`${dayjs.unix(voteEnd).format('h:mm:ss A')} ${handleGMTOffset()}`}
        />
        <a
          href="https://docs.nouns.build/onboarding/governance/#-voting-power"
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'pointer' }}
        >
          <Tile
            title={'Snapshot'}
            subtitle={`#${snapshotBlockNumber}`}
            subtext={'Taken at block'}
            icon="question"
          />
        </a>
      </Grid>
    </>
  )
}
