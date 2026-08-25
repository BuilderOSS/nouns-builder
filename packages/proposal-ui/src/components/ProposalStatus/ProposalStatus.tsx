import { Proposal } from '@buildeross/sdk/subgraph'
import { ProposalState } from '@buildeross/types'
import { Box, Flex, Label, Paragraph } from '@buildeross/zord'
import dayjs from 'dayjs'
import React from 'react'

import { formatTime, parseBgColor, parseState, parseTime } from './ProposalStatus.helper'

export type ProposalForStatus = Pick<
  Proposal,
  | 'proposer'
  | 'values'
  | 'state'
  | 'voteEnd'
  | 'voteStart'
  | 'expiresAt'
  | 'executedAt'
  | 'title'
  | 'proposalNumber'
  | 'proposalId'
  | 'timeCreated'
  | 'candidateVersion'
>

type StatusProps = ProposalForStatus & {
  className?: string
  flipped?: Boolean
  showTime?: Boolean
}

export const ProposalStatus: React.FC<StatusProps> = ({
  className,
  flipped,
  showTime,
  ...proposal
}) => {
  const { state, voteEnd, voteStart, expiresAt, executedAt, candidateVersion } = proposal

  // Override state for promoted proposals: show Pending instead of Updatable
  // Promoted proposals (from candidates) can't be updated via UI yet (requires signature collection)
  const isPromotedProposal = !!candidateVersion
  const displayState =
    isPromotedProposal && state === ProposalState.Updatable
      ? ProposalState.Pending
      : state

  const now = dayjs.unix(Date.now() / 1000)

  const diffEnd = dayjs.unix(voteEnd).diff(now, 'second')
  const diffStart = dayjs.unix(voteStart).diff(now, 'second')
  const diffExpiration = expiresAt ? dayjs.unix(expiresAt).diff(now, 'second') : 0
  const diffExecution = executedAt ? now.diff(dayjs.unix(executedAt), 'second') : 0

  return (
    <Flex
      className={className}
      align="center"
      direction={flipped ? { '@768': 'row-reverse' } : {}}
    >
      <Box
        py={'x1'}
        px={'x3'}
        borderRadius={'round'}
        borderStyle={'solid'}
        borderWidth={'normal'}
        mr={flipped ? { '@initial': 'x3', '@768': 'x0' } : 'x3'}
        ml={flipped ? { '@768': 'x3' } : 'x0'}
        style={parseBgColor(displayState)}
      >
        <Label size="sm">{parseState(displayState)}</Label>
      </Box>
      {displayState === ProposalState.Pending && showTime && (
        <Paragraph color="text3" data-testid="time-prefix">
          {parseTime(diffStart, 'Starts')}
        </Paragraph>
      )}
      {displayState === ProposalState.Active && showTime && (
        <Paragraph color="text3" data-testid="time-prefix">
          {parseTime(diffEnd, 'Ends')}
        </Paragraph>
      )}
      {displayState === ProposalState.Queued && showTime && (
        <Paragraph color="text3" data-testid="time-prefix">
          {parseTime(diffExpiration, 'Expires')}
        </Paragraph>
      )}
      {displayState === ProposalState.Executed && showTime && (
        <Paragraph color="text3" data-testid="time-prefix">
          {formatTime(diffExecution, 'ago', false)}
        </Paragraph>
      )}
    </Flex>
  )
}
