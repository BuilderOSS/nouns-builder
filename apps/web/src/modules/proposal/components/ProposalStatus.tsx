import { Box, Flex, Label, Paragraph } from '@buildeross/zord'
import dayjs from 'dayjs'
import React from 'react'

import { Proposal } from 'src/data/subgraph/requests/proposalQuery'
import { ProposalState } from 'src/typings'

import { formatTime, parseBgColor, parseState, parseTime } from './ProposalStatus.helper'

export type ProposalForStatus = Pick<
  Proposal,
  | 'state'
  | 'voteEnd'
  | 'voteStart'
  | 'expiresAt'
  | 'executedAt'
  | 'title'
  | 'proposalNumber'
  | 'timeCreated'
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
  const { state, voteEnd, voteStart, expiresAt, executedAt } = proposal

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
        style={parseBgColor(state)}
      >
        <Label size="sm">{parseState(state)}</Label>
      </Box>
      {state === ProposalState.Pending && showTime && (
        <Paragraph color="text3" data-testid="time-prefix">
          {parseTime(diffStart, 'Starts')}
        </Paragraph>
      )}
      {state === ProposalState.Active && showTime && (
        <Paragraph color="text3" data-testid="time-prefix">
          {parseTime(diffEnd, 'Ends')}
        </Paragraph>
      )}
      {state === ProposalState.Queued && showTime && (
        <Paragraph color="text3" data-testid="time-prefix">
          {parseTime(diffExpiration, 'Expires')}
        </Paragraph>
      )}
      {state === ProposalState.Executed && showTime && (
        <Paragraph color="text3" data-testid="time-prefix">
          {formatTime(diffExecution, 'ago', false)}
        </Paragraph>
      )}
    </Flex>
  )
}
